"""
FastAPI 主入口 — 心旅 AI (MindTrip AI) 核心引擎
=================================================
"""

from __future__ import annotations
from typing import Dict, List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
import uvicorn
import os

from backend.module_2_psychology import (
    calculate_routing_parameters,
    validate_emotion,
    validate_big_five,
    validate_archetypes,
    get_emotion_label,
)
from backend.module_3_aesthetics import (
    create_extractor,
    V1OpenCVExtractor,
    aesthetics_to_dict,
)
from backend.module_4_routing import (
    RoutingOptimizer,
    create_default_merchants,
    Merchant,
)
from backend.module_5_mind_print import (
    MindPrintGenerator,
    mind_print_to_json,
)

# ---------- FastAPI 应用 ----------

app = FastAPI(
    title="心旅 AI (MindTrip AI) 核心引擎",
    description="心理测评 -> 美学特征提取 -> 动态路径规划 -> 跨时空叙事生成",
    version="1.0.0-Demo",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 挂载前端静态文件（生产构建版本）
FRONTEND_DIST = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")

# ---------- Pydantic 请求/响应模型 ----------

class EmotionInput(BaseModel):
    energy: float = Field(..., ge=0.0, le=1.0, description="能量水平 [0,1]")
    pace: float = Field(..., ge=0.0, le=1.0, description="节奏水平 [0,1]")


class BigFiveInput(BaseModel):
    O: float = Field(..., ge=0.0, le=1.0, description="开放性")
    C: float = Field(..., ge=0.0, le=1.0, description="尽责性")
    E: float = Field(..., ge=0.0, le=1.0, description="外倾性")
    A: float = Field(..., ge=0.0, le=1.0, description="宜人性")
    N: float = Field(..., ge=0.0, le=1.0, description="神经质")


class ArchetypeInput(BaseModel):
    explorer: float = Field(0.0, ge=0.0, le=1.0)
    creator: float = Field(0.0, ge=0.0, le=1.0)
    sage: float = Field(0.0, ge=0.0, le=1.0)
    hero: float = Field(0.0, ge=0.0, le=1.0)
    outlaw: float = Field(0.0, ge=0.0, le=1.0)
    magician: float = Field(0.0, ge=0.0, le=1.0)
    lover: float = Field(0.0, ge=0.0, le=1.0)
    jester: float = Field(0.0, ge=0.0, le=1.0)
    everyman: float = Field(0.0, ge=0.0, le=1.0)
    caregiver: float = Field(0.0, ge=0.0, le=1.0)
    ruler: float = Field(0.0, ge=0.0, le=1.0)
    innocent: float = Field(0.0, ge=0.0, le=1.0)


class QuizRequest(BaseModel):
    emotion: EmotionInput
    big_five: BigFiveInput
    archetypes: ArchetypeInput


class RouteRequest(QuizRequest):
    w_match: float = Field(0.5, ge=0.0, le=1.0)
    w_unique: float = Field(0.3, ge=0.0, le=1.0)
    w_surprise: float = Field(0.2, ge=0.0, le=1.0)


# ---------- API 路由 ----------

@app.get("/api/health")
def root():
    return {
        "service": "心旅 AI (MindTrip AI) 核心引擎",
        "version": "1.0.0-Demo",
        "status": "running",
        "modules": ["2.0-心理学测评", "3.0-美学解析", "4.0-路径规划", "5.0-心灵足迹"],
    }


@app.post("/api/v1/analyze-quiz")
def analyze_quiz(request: QuizRequest):
    """
    分析测评结果，返回路由控制参数
    """
    emotion_dict = request.emotion.model_dump()
    big_five_dict = request.big_five.model_dump()
    archetype_dict = request.archetypes.model_dump()

    try:
        params = calculate_routing_parameters(emotion_dict, big_five_dict, archetype_dict)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return {
        "emotion_label": get_emotion_label(emotion_dict["energy"], emotion_dict["pace"]),
        "routing_parameters": params,
    }


@app.post("/api/v1/plan-route")
def plan_route(request: RouteRequest):
    """
    完整流程: 测评分析 -> 美学匹配 -> 路线规划
    """
    emotion_dict = request.emotion.model_dump()
    big_five_dict = request.big_five.model_dump()
    archetype_dict = request.archetypes.model_dump()

    # 1. 计算路由参数
    try:
        routing_params = calculate_routing_parameters(
            emotion_dict, big_five_dict, archetype_dict
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # 2. 构建用户偏好向量
    user_profile_vector = {
        "wabi_sabi": routing_params.get("wabi_sabi_affinity", 0.5),
        "eccentric_cute": routing_params.get("eccentric_cute_affinity", 0.5),
        "modern_design": 0.5,
        "traditional_chinese": 0.5,
        "bohemian": 0.5,
    }

    # 3. 加载商户数据
    merchants = create_default_merchants()

    # 4. 路径规划
    optimizer = RoutingOptimizer(
        w_match=request.w_match,
        w_unique=request.w_unique,
        w_surprise=request.w_surprise,
    )
    route = optimizer.plan_route(
        user_profile_vector=user_profile_vector,
        merchants=merchants,
        routing_params=routing_params,
    )

    # 5. 获取商户详情
    merchant_details = []
    for mid in route.merchant_ids:
        for m in merchants:
            if m.merchant_id == mid:
                merchant_details.append({
                    "merchant_id": m.merchant_id,
                    "name": m.name,
                    "category": m.category,
                    "tags": m.tags,
                    "crowd_density": m.crowd_density,
                    "is_hidden_gem": m.is_hidden_gem,
                })
                break

    return {
        "emotion_label": get_emotion_label(emotion_dict["energy"], emotion_dict["pace"]),
        "routing_parameters": routing_params,
        "route": {
            "merchant_ids": route.merchant_ids,
            "merchant_details": merchant_details,
            "total_score": route.total_score,
            "scores_detail": route.scores_detail,
        },
    }


@app.post("/api/v1/generate-mind-print")
def generate_mind_print(request: RouteRequest):
    """
    完整流程 + 心灵足迹生成
    """
    # 先获取路线
    emotion_dict = request.emotion.model_dump()
    big_five_dict = request.big_five.model_dump()
    archetype_dict = request.archetypes.model_dump()

    try:
        routing_params = calculate_routing_parameters(
            emotion_dict, big_five_dict, archetype_dict
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    user_profile_vector = {
        "wabi_sabi": routing_params.get("wabi_sabi_affinity", 0.5),
        "eccentric_cute": routing_params.get("eccentric_cute_affinity", 0.5),
        "modern_design": 0.5,
        "traditional_chinese": 0.5,
        "bohemian": 0.5,
    }

    merchants = create_default_merchants()
    optimizer = RoutingOptimizer()
    route = optimizer.plan_route(user_profile_vector, merchants, routing_params)

    # 收集商户信息
    merchant_names = []
    merchant_tags = []
    partner_id = None
    for mid in route.merchant_ids:
        for m in merchants:
            if m.merchant_id == mid:
                merchant_names.append(m.name)
                merchant_tags.extend(m.tags)
                if partner_id is None:
                    partner_id = m.merchant_id
                break

    # 提取美学特征
    extractor = create_extractor("v1")
    aesthetics = extractor.extract_from_data(partner_id or "JZD_M_009")
    if aesthetics is None:
        aesthetics = extractor.extract_from_data("JZD_M_009")

    # 生成心灵足迹
    generator = MindPrintGenerator()
    mind_print = generator.generate(
        user_id="demo_user",
        emotion_idx=emotion_dict,
        routing_params=routing_params,
        aesthetics_spectrum=aesthetics.aesthetics_spectrum.__dict__,
        merchant_names=merchant_names,
        merchant_tags=merchant_tags,
        partner_merchant_id=partner_id,
    )

    return {
        "emotion_label": get_emotion_label(emotion_dict["energy"], emotion_dict["pace"]),
        "route": {
            "merchant_ids": route.merchant_ids,
            "merchant_details": [
                {"merchant_id": m.merchant_id, "name": m.name}
                for m in merchants if m.merchant_id in route.merchant_ids
            ],
        },
        "mind_print": mind_print_to_json(mind_print),
    }


@app.get("/api/v1/merchants")
def list_merchants():
    """列出所有商户"""
    merchants = create_default_merchants()
    return {
        "merchants": [
            {
                "merchant_id": m.merchant_id,
                "name": m.name,
                "category": m.category,
                "tags": m.tags,
                "crowd_density": m.crowd_density,
                "is_new": m.is_new,
                "is_hidden_gem": m.is_hidden_gem,
                "confidence_coefficient": m.confidence_coefficient,
            }
            for m in merchants
        ]
    }


@app.get("/api/v1/merchant/{merchant_id}/aesthetics")
def get_merchant_aesthetics(merchant_id: str):
    """获取商户美学特征"""
    extractor = create_extractor("v1")
    aesthetics = extractor.extract_from_data(merchant_id)
    if aesthetics is None:
        raise HTTPException(status_code=404, detail=f"商户 {merchant_id} 未找到")
    return aesthetics_to_dict(aesthetics)


# ---------- SPA 回落（必须在所有API路由之后） ----------

from fastapi.responses import FileResponse
import os

frontend_dist = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")

@app.get("/assets/{rest_of_path:path}")
async def serve_assets(rest_of_path: str):
    """服务前端静态资源"""
    file_path = os.path.join(frontend_dist, "assets", rest_of_path)
    if os.path.isfile(file_path):
        return FileResponse(file_path)
    return FileResponse(os.path.join(frontend_dist, "index.html"))


@app.get("/favicon.svg")
async def serve_favicon():
    """服务favicon"""
    return FileResponse(os.path.join(frontend_dist, "favicon.svg"))


@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    """SPA回落：非API路径统一返回index.html"""
    if full_path.startswith("api/"):
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="API endpoint not found")

    # 先检查是否有匹配的静态文件
    if full_path:
        file_path = os.path.join(frontend_dist, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path, headers={"Cache-Control": "no-cache"})

    # 没有匹配文件，返回index.html (SPA路由)
    index_path = os.path.join(frontend_dist, "index.html")
    if os.path.isfile(index_path):
        return FileResponse(index_path, headers={"Cache-Control": "no-cache"})
    return {"error": "Frontend not built. Run: cd frontend && npx vite build"}


# ---------- 启动入口 ----------

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)