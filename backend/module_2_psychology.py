"""
Module 2.0: 心理学测评与权重路由引擎 (Psychology Scoring Engine)
==============================================================
路由冲突消解算法: 当前情绪状态(Current Emotion) > 大五人格(Big Five) > 荣格原型(Archetypes)
"""

from __future__ import annotations
from typing import Dict, Any
import math


# 荣格12原型标准列表
ARCHETYPE_NAMES = [
    "explorer", "creator", "sage", "hero", "outlaw", "magician",
    "lover", "jester", "everyman", "caregiver", "ruler", "innocent"
]


def validate_emotion(emotion_idx: Dict[str, float]) -> bool:
    """验证情绪输入格式"""
    required_keys = {"energy", "pace"}
    if not required_keys.issubset(emotion_idx.keys()):
        return False
    for k in required_keys:
        v = emotion_idx.get(k, -1)
        if not isinstance(v, (int, float)) or v < 0.0 or v > 1.0:
            return False
    return True


def validate_big_five(big_five_scores: Dict[str, float]) -> bool:
    """验证大五人格输入格式"""
    required_keys = {"O", "C", "E", "A", "N"}
    if not required_keys.issubset(big_five_scores.keys()):
        return False
    for k in required_keys:
        v = big_five_scores.get(k, -1)
        if not isinstance(v, (int, float)) or v < 0.0 or v > 1.0:
            return False
    return True


def validate_archetypes(archetype_scores: Dict[str, float]) -> bool:
    """验证荣格原型输入格式 — 必须包含全部12个原型"""
    if not archetype_scores:
        return False
    for name in ARCHETYPE_NAMES:
        if name not in archetype_scores:
            return False
        v = archetype_scores[name]
        if not isinstance(v, (int, float)) or v < 0.0 or v > 1.0:
            return False
    return True


def calculate_routing_parameters(
    emotion_idx: Dict[str, float],
    big_five_scores: Dict[str, float],
    archetype_scores: Dict[str, float]
) -> Dict[str, float]:
    """
    级联动态矩阵衰减 (Cascading Matrix Decay) 计算最终控制参数。

    优先级: 情绪状态(硬熔断) > 大五人格(方向权重) > 荣格原型(长尾加成)

    Args:
        emotion_idx: {energy: float[0-1], pace: float[0-1]}
        big_five_scores: {O: float, C: float, E: float, A: float, N: float}
        archetype_scores: dict of 12 archetypes

    Returns:
        base_params: dict of routing control parameters
    """
    # --- 输入校验 ---
    if not validate_emotion(emotion_idx):
        raise ValueError("emotion_idx 必须包含 energy/pace，且值在 [0,1] 范围内")
    if not validate_big_five(big_five_scores):
        raise ValueError("big_five_scores 必须包含 O/C/E/A/N，且值在 [0,1] 范围内")
    if not validate_archetypes(archetype_scores):
        raise ValueError("archetype_scores 必须包含全部12个原型，且值在 [0,1] 范围内")

    energy = emotion_idx["energy"]
    pace = emotion_idx["pace"]

    # 1. 情绪状态硬熔断与基准参数设定 (最高优先级)
    base_params: Dict[str, float] = {
        "privacy_weight": 0.5,
        "crowd_threshold": 0.6,
        "stay_duration_min": 45.0,
        "max_recommendations": 5,
        "hidden_gem_bonus": 0.0,
        "eccentric_cute_affinity": 0.0,
        "wabi_sabi_affinity": 0.0,
        "pace_modifier": 0.0,
    }

    if energy < 0.3:  # 能量枯竭状态 — 硬熔断
        base_params["privacy_weight"] = 0.85
        base_params["crowd_threshold"] = 0.3
        base_params["stay_duration_min"] = 90.0
        base_params["max_recommendations"] = 3

    if pace < 0.3:  # 低节奏 — 慢节奏偏好
        base_params["pace_modifier"] = -0.3
    elif pace > 0.7:  # 高节奏 — 快节奏偏好
        base_params["pace_modifier"] = 0.3

    # 2. 大五人格动态叠加 (中优先级)
    # 开放性(O)影响对实验性/小众调性的接受度
    o = big_five_scores["O"]
    e = big_five_scores["E"]
    a = big_five_scores["A"]
    c = big_five_scores["C"]
    n = big_five_scores["N"]

    base_params["eccentric_cute_affinity"] = round(o * 0.7, 4)
    # 内倾(低E)更爱侘寂; 外倾(高E)更爱现代
    base_params["wabi_sabi_affinity"] = round((1.0 - e) * 0.6, 4)
    # 宜人性(A)影响社交偏好
    base_params["social_warmth_affinity"] = round(a * 0.5, 4)
    # 尽责性(C)影响规划偏好
    base_params["planning_rigidity"] = round(c * 0.4, 4)
    # 神经质(N)影响安全需求
    base_params["safety_cushion"] = round(n * 0.3, 4)

    # 3. 荣格原型长尾加成 (低优先级)
    # 探险家 — 在能量允许时推荐隐藏地图
    explorer_score = archetype_scores.get("explorer", 0.0)
    if explorer_score > 0.7 and energy >= 0.3:
        base_params["hidden_gem_bonus"] = 0.3

    # 创造者 — 偏好手作/DIY商户
    creator_score = archetype_scores.get("creator", 0.0)
    if creator_score > 0.6:
        base_params["handmade_affinity_bonus"] = 0.25

    # 智者 — 偏好文化/历史型商户
    sage_score = archetype_scores.get("sage", 0.0)
    if sage_score > 0.6:
        base_params["cultural_depth_bonus"] = 0.25

    # 天真者 — 偏好轻松愉悦型商户
    innocent_score = archetype_scores.get("innocent", 0.0)
    if innocent_score > 0.6:
        base_params["joyful_affinity_bonus"] = 0.2

    # 小丑 — 偏好趣味/幽默型商户
    jester_score = archetype_scores.get("jester", 0.0)
    if jester_score > 0.6:
        base_params["playful_affinity_bonus"] = 0.2

    return base_params


def get_emotion_label(energy: float, pace: float) -> str:
    """根据情绪状态返回人类可读标签"""
    if energy < 0.3 and pace < 0.3:
        return "枯竭沉寂"
    elif energy < 0.3:
        return "能量枯竭"
    elif pace < 0.3:
        return "舒缓平静"
    elif energy > 0.7 and pace > 0.7:
        return "亢奋活跃"
    elif energy > 0.7:
        return "精力充沛"
    else:
        return "平稳均衡"