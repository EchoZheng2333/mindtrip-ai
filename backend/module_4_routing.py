"""
Module 4.0: 惊喜流量与反作弊动态路径规划 (Dynamic Routing Optimization)
========================================================================
核心公式: S_i = (W_match × M_i) + (W_unique × U_i) + (W_surprise × P_i × C_i)
"""

from __future__ import annotations
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, field
import math
import time


@dataclass
class Merchant:
    """商户数据模型"""
    merchant_id: str
    name: str
    category: str           # 品类: 陶瓷/玻璃/木作/布艺/综合
    tags: List[str]         # 标签列表
    aesthetics_vector: Dict[str, float]  # 美学向量 {wabi_sabi: 0.88, ...}
    crowd_density: float    # 人流密度 [0, 1]
    location_lat: float = 0.0
    location_lng: float = 0.0
    is_new: bool = False            # 新入驻商户（享受惊喜扶持）
    join_timestamp: float = 0.0     # 入驻时间戳
    total_impressions: int = 0      # 累计独立用户曝光
    confidence_coefficient: float = 1.0  # 人工校准与反作弊置信度系数 C_i
    is_hidden_gem: bool = False     # 偏远/隐藏商户


@dataclass
class RoutePlan:
    """推荐路线规划"""
    merchant_ids: List[str] = field(default_factory=list)
    total_score: float = 0.0
    scores_detail: List[Dict] = field(default_factory=list)


# 惊喜扶持常量
MAX_EXPOSURE_CAP = 1000       # N_cap: 最大曝光次数
MAX_DAYS_CAP = 90.0           # T_max: 最大入驻天数
SURPRISE_WEIGHT_INITIAL = 0.3  # P_initial: 初始惊喜权重
DECAY_LAMBDA = 0.02           # λ: 衰减系数


class RoutingOptimizer:
    """
    动态路径规划优化器
    实现加权调调算法 (Weighted Harmony Algorithm)
    """

    def __init__(
        self,
        w_match: float = 0.5,
        w_unique: float = 0.3,
        w_surprise: float = 0.2,
        current_time: Optional[float] = None,
    ):
        """
        Args:
            w_match: 匹配度权重
            w_unique: 独特性权重
            w_surprise: 惊喜扶持权重
            current_time: 当前时间戳 (用于测试可注入)
        """
        self.w_match = w_match
        self.w_unique = w_unique
        self.w_surprise = w_surprise
        self.current_time = current_time or time.time()

    def calculate_match_score(
        self,
        user_profile_vector: Dict[str, float],
        merchant: Merchant
    ) -> float:
        """
        计算用户画像与商户标签的余弦相似度 M_i

        Args:
            user_profile_vector: 用户偏好向量 (来自Module 2.0)
            merchant: 商户

        Returns:
            cosine_similarity: [0, 1]
        """
        # 取所有键的并集
        all_keys = set(user_profile_vector.keys()) | set(merchant.aesthetics_vector.keys())

        # 构建向量
        v1 = [user_profile_vector.get(k, 0.0) for k in all_keys]
        v2 = [merchant.aesthetics_vector.get(k, 0.0) for k in all_keys]

        # 计算点积
        dot_product = sum(a * b for a, b in zip(v1, v2))
        norm1 = math.sqrt(sum(a * a for a in v1))
        norm2 = math.sqrt(sum(b * b for b in v2))

        if norm1 == 0 or norm2 == 0:
            return 0.0

        cosine = dot_product / (norm1 * norm2)
        return max(0.0, min(1.0, cosine))

    def calculate_uniqueness_score(
        self,
        merchant: Merchant,
        all_merchants: List[Merchant]
    ) -> float:
        """
        计算商户美学特征在当前城市数据库中的稀有度指数 U_i

        Args:
            merchant: 目标商户
            all_merchants: 当前城市所有商户

        Returns:
            uniqueness: [0, 1]
        """
        if not all_merchants or len(all_merchants) <= 1:
            return 0.5

        # 计算与其他商户的平均美学距离
        total_distance = 0.0
        count = 0
        for other in all_merchants:
            if other.merchant_id == merchant.merchant_id:
                continue
            # 欧几里得距离
            all_keys = set(merchant.aesthetics_vector.keys()) | set(other.aesthetics_vector.keys())
            squared_diff = 0.0
            for k in all_keys:
                diff = merchant.aesthetics_vector.get(k, 0.0) - other.aesthetics_vector.get(k, 0.0)
                squared_diff += diff * diff
            distance = math.sqrt(squared_diff)
            total_distance += distance
            count += 1

        avg_distance = total_distance / count if count > 0 else 0.0
        # 归一化到 [0, 1] (假设最大距离为 sqrt(5) ≈ 2.236)
        normalized = min(1.0, avg_distance / math.sqrt(5.0))
        return round(normalized, 4)

    def calculate_surprise_weight(self, merchant: Merchant) -> float:
        """
        计算惊喜扶持权重 P_i(t)
        含动态衰减: P_i(t) = P_initial × e^(-λ × t)

        Returns:
            surprise_weight: [0, P_initial]
        """
        if not merchant.is_new:
            return 0.0

        # 检查曝光上限
        if merchant.total_impressions >= MAX_EXPOSURE_CAP:
            return 0.0

        # 检查入驻天数上限
        days_since_join = (self.current_time - merchant.join_timestamp) / (24 * 3600)
        if days_since_join >= MAX_DAYS_CAP:
            return 0.0

        # 指数衰减
        decayed = SURPRISE_WEIGHT_INITIAL * math.exp(-DECAY_LAMBDA * days_since_join)
        return max(0.0, decayed)

    def calculate_final_score(
        self,
        merchant: Merchant,
        match_score: float,
        uniqueness_score: float,
        surprise_weight: float,
    ) -> float:
        """
        计算最终推荐得分 S_i

        S_i = (W_match × M_i) + (W_unique × U_i) + (W_surprise × P_i × C_i)

        Args:
            merchant: 商户
            match_score: 匹配度 M_i
            uniqueness_score: 独特性 U_i
            surprise_weight: 惊喜权重 P_i

        Returns:
            final_score: 综合得分
        """
        match_term = self.w_match * match_score
        unique_term = self.w_unique * uniqueness_score
        surprise_term = self.w_surprise * surprise_weight * merchant.confidence_coefficient

        return round(match_term + unique_term + surprise_term, 4)

    def get_merchant_final_score(
        self,
        merchant: Merchant,
        user_profile_vector: Dict[str, float],
        all_merchants: List[Merchant]
    ) -> Tuple[float, Dict]:
        """
        计算单个商户的最终得分及明细

        Returns:
            (final_score, detail_dict)
        """
        match_score = self.calculate_match_score(user_profile_vector, merchant)
        uniqueness_score = self.calculate_uniqueness_score(merchant, all_merchants)
        surprise_weight = self.calculate_surprise_weight(merchant)

        # 反作弊: 置信度系数为0时强制归零
        effective_surprise = surprise_weight * merchant.confidence_coefficient
        if merchant.confidence_coefficient <= 0.0:
            effective_surprise = 0.0

        final_score = self.calculate_final_score(
            merchant, match_score, uniqueness_score, effective_surprise
        )

        detail = {
            "merchant_id": merchant.merchant_id,
            "name": merchant.name,
            "match_score": match_score,
            "uniqueness_score": uniqueness_score,
            "surprise_weight_raw": surprise_weight,
            "confidence_coefficient": merchant.confidence_coefficient,
            "effective_surprise": effective_surprise,
            "final_score": final_score,
        }
        return final_score, detail

    def plan_route(
        self,
        user_profile_vector: Dict[str, float],
        merchants: List[Merchant],
        routing_params: Dict[str, float],
        max_results: Optional[int] = None,
        min_score_threshold: float = 0.0,
    ) -> RoutePlan:
        """
        规划推荐路线

        Args:
            user_profile_vector: 用户偏好向量 (来自Module 2.0)
            merchants: 候选商户列表
            routing_params: 路由控制参数 (来自Module 2.0)
            max_results: 最大推荐数量 (默认使用routing_params中的值)
            min_score_threshold: 最低得分阈值

        Returns:
            RoutePlan: 排序后的路线规划
        """
        if max_results is None:
            max_results = int(routing_params.get("max_recommendations", 5))

        crowd_threshold = routing_params.get("crowd_threshold", 1.0)
        hidden_gem_bonus = routing_params.get("hidden_gem_bonus", 0.0)

        scored_merchants = []
        for merchant in merchants:
            # 硬熔断: 人流密度过滤
            if merchant.crowd_density > crowd_threshold:
                continue

            # 硬熔断: 反作弊 — 置信度为0的商户无条件剔除
            if merchant.confidence_coefficient <= 0.0:
                continue

            final_score, detail = self.get_merchant_final_score(
                merchant, user_profile_vector, merchants
            )

            # 隐藏宝石加成
            if merchant.is_hidden_gem and hidden_gem_bonus > 0:
                final_score += hidden_gem_bonus
                detail["hidden_gem_bonus_applied"] = hidden_gem_bonus

            if final_score < min_score_threshold:
                continue

            scored_merchants.append((final_score, detail))

        # 按得分降序排列
        scored_merchants.sort(key=lambda x: x[0], reverse=True)

        # 取前N个
        top = scored_merchants[:max_results]

        route = RoutePlan(
            merchant_ids=[d["merchant_id"] for _, d in top],
            total_score=round(sum(s for s, _ in top), 4),
            scores_detail=[d for _, d in top],
        )
        return route


def create_default_merchants() -> List[Merchant]:
    """创建默认商户数据集"""
    now = time.time()
    return [
        Merchant(
            merchant_id="JZD_M_009", name="造心社",
            category="陶瓷", tags=["粗粝陶土", "自然天光", "深巷秘境"],
            aesthetics_vector={"wabi_sabi": 0.88, "eccentric_cute": 0.12,
                               "modern_design": 0.05, "traditional_chinese": 0.45},
            crowd_density=0.25, is_hidden_gem=True,
            location_lat=29.292, location_lng=117.206,
            join_timestamp=now - 30 * 24 * 3600,  # 30天前
        ),
        Merchant(
            merchant_id="JZD_M_012", name="波普实验室",
            category="陶瓷", tags=["波普色彩", "戏谑造型", "赛博朋克"],
            aesthetics_vector={"wabi_sabi": 0.15, "eccentric_cute": 0.85,
                               "modern_design": 0.60, "traditional_chinese": 0.10},
            crowd_density=0.55,
            location_lat=29.295, location_lng=117.210,
            join_timestamp=now - 120 * 24 * 3600,  # 120天前（非新）
        ),
        Merchant(
            merchant_id="JZD_M_021", name="玻璃光舍",
            category="玻璃", tags=["极简线条", "几何构成", "未来感"],
            aesthetics_vector={"wabi_sabi": 0.45, "eccentric_cute": 0.30,
                               "modern_design": 0.75, "traditional_chinese": 0.20},
            crowd_density=0.40,
            location_lat=29.288, location_lng=117.215,
            join_timestamp=now - 10 * 24 * 3600,  # 10天前（新）
        ),
        Merchant(
            merchant_id="JZD_M_045", name="青花旧梦",
            category="陶瓷", tags=["青花古韵", "匠人手笔", "东方美学"],
            aesthetics_vector={"wabi_sabi": 0.60, "eccentric_cute": 0.25,
                               "modern_design": 0.35, "traditional_chinese": 0.70},
            crowd_density=0.70,  # 高人流
            location_lat=29.298, location_lng=117.205,
            join_timestamp=now - 200 * 24 * 3600,
        ),
        Merchant(
            merchant_id="JZD_M_067", name="自然编织工作室",
            category="布艺", tags=["波西米亚", "手工编织", "植物染"],
            aesthetics_vector={"wabi_sabi": 0.30, "eccentric_cute": 0.55,
                               "modern_design": 0.40, "traditional_chinese": 0.15},
            crowd_density=0.15, is_hidden_gem=True, is_new=True,
            location_lat=29.285, location_lng=117.200,
            join_timestamp=now - 5 * 24 * 3600,  # 5天前（新）
            total_impressions=50,
        ),
        Merchant(
            merchant_id="JZD_M_088", name="可疑刷单店",
            category="综合", tags=["刷单", "虚假好评"],
            aesthetics_vector={"wabi_sabi": 0.50, "eccentric_cute": 0.50,
                               "modern_design": 0.50, "traditional_chinese": 0.50},
            crowd_density=0.10,
            location_lat=29.290, location_lng=117.208,
            join_timestamp=now - 3 * 24 * 3600,
            confidence_coefficient=0.0,  # 反作弊: 置信度为0
            is_new=True,
        ),
    ]