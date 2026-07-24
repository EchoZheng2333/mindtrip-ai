"""
Module 3.0: 多模态美学解析引擎 (Multi-Modal Aesthetics Engine) - v1 低成本方案
================================================================================
采用依赖注入(DI)模式设计，预留大模型API切换接口。
v1: OpenCV 颜色聚类与纹理提取 (模拟实现)
"""

from __future__ import annotations
from typing import Dict, List, Protocol
from dataclasses import dataclass, field, asdict


# ---------- 标准化数据模型 ----------

@dataclass
class AestheticsSpectrum:
    """美学光谱 - 标准化输出格式"""
    wabi_sabi: float = 0.0        # 侘寂极简
    eccentric_cute: float = 0.0   # 古怪可爱
    modern_design: float = 0.0    # 现代设计
    traditional_chinese: float = 0.0  # 中式传统
    bohemian: float = 0.0         # 波西米亚/自然


@dataclass
class MerchantAesthetics:
    """商户美学特征 - 完整输出"""
    merchant_id: str
    aesthetics_spectrum: AestheticsSpectrum = field(default_factory=AestheticsSpectrum)
    extracted_tags: List[str] = field(default_factory=list)
    color_palette: List[str] = field(default_factory=list)  # 十六进制色值
    texture_roughness: float = 0.0  # 纹理粗糙度 [0,1]


# ---------- 抽象提取器接口 (DI 模式) ----------

class AestheticsExtractor(Protocol):
    """美学提取器抽象接口 — 未来v2大模型版本只需实现此协议"""

    def extract(self, image_path: str) -> MerchantAesthetics:
        """从图片路径提取美学特征"""
        ...


# ---------- v1 模拟实现 (OpenCV 模拟) ----------

class V1OpenCVExtractor:
    """
    v1 基础提取器 — 模拟 OpenCV 处理逻辑
    实际生产环境会使用 OpenCV HSV 聚类 + LBP 纹理提取
    """

    # 模拟商户美学数据库
    MERCHANT_AESTHETICS_DB: Dict[str, MerchantAesthetics] = {
        "JZD_M_009": MerchantAesthetics(
            merchant_id="JZD_M_009",
            aesthetics_spectrum=AestheticsSpectrum(
                wabi_sabi=0.88, eccentric_cute=0.12,
                modern_design=0.05, traditional_chinese=0.45,
                bohemian=0.20
            ),
            extracted_tags=["粗粝陶土", "自然天光", "深巷秘境", "宋代素胚"],
            color_palette=["#8B7D6B", "#D2C5B0", "#5C4A3A", "#A89B8C"],
            texture_roughness=0.78
        ),
        "JZD_M_012": MerchantAesthetics(
            merchant_id="JZD_M_012",
            aesthetics_spectrum=AestheticsSpectrum(
                wabi_sabi=0.15, eccentric_cute=0.85,
                modern_design=0.60, traditional_chinese=0.10,
                bohemian=0.30
            ),
            extracted_tags=["波普色彩", "戏谑造型", "潮流玩物", "赛博朋克"],
            color_palette=["#FF6B6B", "#4ECDC4", "#FFE66D", "#2C3E50"],
            texture_roughness=0.35
        ),
        "JZD_M_021": MerchantAesthetics(
            merchant_id="JZD_M_021",
            aesthetics_spectrum=AestheticsSpectrum(
                wabi_sabi=0.45, eccentric_cute=0.30,
                modern_design=0.75, traditional_chinese=0.20,
                bohemian=0.55
            ),
            extracted_tags=["极简线条", "玻璃光影", "几何构成", "未来感"],
            color_palette=["#FFFFFF", "#E0E0E0", "#BDBDBD", "#757575"],
            texture_roughness=0.22
        ),
        "JZD_M_045": MerchantAesthetics(
            merchant_id="JZD_M_045",
            aesthetics_spectrum=AestheticsSpectrum(
                wabi_sabi=0.60, eccentric_cute=0.25,
                modern_design=0.35, traditional_chinese=0.70,
                bohemian=0.40
            ),
            extracted_tags=["青花古韵", "匠人手笔", "东方美学", "禅意空间"],
            color_palette=["#1A3A5C", "#4A7C9B", "#C9D8E0", "#F5F0E8"],
            texture_roughness=0.55
        ),
        "JZD_M_067": MerchantAesthetics(
            merchant_id="JZD_M_067",
            aesthetics_spectrum=AestheticsSpectrum(
                wabi_sabi=0.30, eccentric_cute=0.55,
                modern_design=0.40, traditional_chinese=0.15,
                bohemian=0.70
            ),
            extracted_tags=["波西米亚", "手工编织", "植物染", "自然随性"],
            color_palette=["#D4A574", "#8B5E3C", "#E8C9A0", "#5A7A5A"],
            texture_roughness=0.62
        ),
    }

    def extract(self, image_path: str) -> MerchantAesthetics:
        """
        提取美学特征 (模拟实现)
        实际会调用 OpenCV 进行 HSV 聚类 + LBP 纹理分析
        """
        # 模拟: 从路径提取商户ID
        merchant_id = self._parse_merchant_id(image_path)
        return self.MERCHANT_AESTHETICS_DB.get(
            merchant_id,
            MerchantAesthetics(
                merchant_id=merchant_id,
                aesthetics_spectrum=AestheticsSpectrum(
                    wabi_sabi=0.5, eccentric_cute=0.5,
                    modern_design=0.5, traditional_chinese=0.5,
                    bohemian=0.5
                ),
                extracted_tags=["默认商户", "综合风格"],
                color_palette=["#CCCCCC", "#999999"],
                texture_roughness=0.5
            )
        )

    def extract_from_data(self, merchant_id: str) -> MerchantAesthetics:
        """直接从数据库提取，不存在则返回默认美学特征"""
        if merchant_id in self.MERCHANT_AESTHETICS_DB:
            return self.MERCHANT_AESTHETICS_DB[merchant_id]
        return MerchantAesthetics(
            merchant_id=merchant_id,
            aesthetics_spectrum=AestheticsSpectrum(
                wabi_sabi=0.5, eccentric_cute=0.5,
                modern_design=0.5, traditional_chinese=0.5,
                bohemian=0.5
            ),
            extracted_tags=["默认商户", "综合风格"],
            color_palette=["#CCCCCC", "#999999"],
            texture_roughness=0.5
        )

    def _parse_merchant_id(self, image_path: str) -> str:
        """从图片路径解析商户ID"""
        # 模拟: images/JZD_M_009_main.jpg -> JZD_M_009
        import re
        match = re.search(r'(JZD_[A-Z]_\d{3})', image_path)
        if match:
            return match.group(1)
        return "unknown"


# ---------- v2 大模型占位 (接口已就绪) ----------

class V2LLMExtractor:
    """
    v2: 多模态大模型 API 提取器 (占位)
    未来只需实现此方法，输出格式与 v1 完全一致
    """

    async def extract(self, image_path: str) -> MerchantAesthetics:
        """调用多模态LLM API 进行美学分析"""
        raise NotImplementedError("v2 LLM 提取器尚未接入，请配置 API_KEY 后使用")


# ---------- 工厂函数 ----------

def create_extractor(version: str = "v1") -> AestheticsExtractor:
    """提取器工厂 — 依赖注入入口"""
    if version == "v1":
        return V1OpenCVExtractor()
    elif version == "v2":
        return V2LLMExtractor()
    else:
        raise ValueError(f"不支持的提取器版本: {version}")


def aesthetics_to_dict(aesthetics: MerchantAesthetics) -> dict:
    """将美学特征转为标准JSON输出"""
    return {
        "merchant_id": aesthetics.merchant_id,
        "aesthetics_spectrum": asdict(aesthetics.aesthetics_spectrum),
        "extracted_tags": aesthetics.extracted_tags,
        "color_palette": aesthetics.color_palette,
        "texture_roughness": aesthetics.texture_roughness,
    }