"""
Module 5.0: "心灵足迹" Web3 资产与叙事生成 (Mind Print & Narrative Generation)
================================================================================
模拟生成"旅行心路札记"与"数字资产(NFT)"证明
"""

from __future__ import annotations
from typing import Dict, List, Optional
from dataclasses import dataclass, field
from datetime import datetime
import json
import hashlib
import random


# ---------- 数据模型 ----------

@dataclass
class LoyaltyVerification:
    """忠诚度验证"""
    partner_merchant_id: str
    lifetime_discount: float  # 终身折扣 [0.5, 1.0]
    story_uploaded: bool = False


@dataclass
class JourneySummary:
    """旅程摘要"""
    aesthetic_dna: str         # 如 "65% 侘寂极简 + 35% 古怪可爱"
    emotional_curve: str       # 如 "从枯竭到充盈（疗愈成功）"


@dataclass
class MindPrint:
    """心灵足迹 — 完整数字资产"""
    mind_print_id: str
    user_wallet_mock: str
    journey_summary: JourneySummary
    narrative_log: str
    loyalty_verification: Optional[LoyaltyVerification] = None
    created_at: str = ""


# ---------- 叙事词库 ----------

NARRATIVE_TEMPLATES = {
    "wabi_sabi": [
        "你在{place}的{location}深处，触摸到了{era}同温的泥土。",
        "{place}的手作{craft}，用{adjective}的质感诉说着时间的故事。",
        "阳光透过{feature}洒在{craft}上，侘寂之美在静谧中流淌。",
    ],
    "eccentric_cute": [
        "{place}手工打造的{craft}系列，用{adjective}的戏谑打破了现实的沉闷。",
        "转角遇见{place}，{craft}上夸张的{feature}让人忍俊不禁。",
        "色彩斑斓的{craft}在{place}的橱窗里跳跃，{adjective}的设计唤醒童心。",
    ],
    "healing_low_energy": [
        "今天的你，只需要一杯茶和{place}的静谧。",
        "在{place}的温柔角落里，让{craft}的触感治愈疲惫的心灵。",
        "慢下来，{place}的{craft}正等着聆听你的故事。",
    ],
    "exploration_high_energy": [
        "穿过{location}，{place}的{craft}正在等待冒险者的发现。",
        "{place}的{craft}融合了{adjective}的前卫设计，是街头最亮眼的发现。",
        "在{place}，{craft}不再是传统的样子——它是{adjective}的艺术宣言。",
    ],
}

ADJECTIVES = {
    "wabi_sabi": ["粗粝", "温润", "素雅", "古朴", "沉静", "自然"],
    "eccentric_cute": ["古怪可爱", "荒诞有趣", "戏谑幽默", "波普鲜艳", "天马行空"],
    "neutral": ["独特", "精致", "匠心", "别致", "细腻"],
}


# ---------- 生成器 ----------

class MindPrintGenerator:
    """心灵足迹生成器"""

    def __init__(self):
        self._used_ids: set = set()

    def _generate_id(self) -> str:
        """生成唯一心灵足迹ID"""
        date_str = datetime.now().strftime("%Y%m%d")
        seq = len(self._used_ids) + 1
        mp_id = f"MP_{date_str}_{seq:03d}"
        self._used_ids.add(mp_id)
        return mp_id

    def _generate_wallet(self) -> str:
        """生成模拟钱包地址"""
        hex_chars = "0123456789ABCDEF"
        addr = "0x" + "".join(random.choices(hex_chars, k=40))
        return addr

    def _compute_aesthetic_dna(
        self,
        aesthetics_spectrum: Dict[str, float],
        routing_params: Dict[str, float]
    ) -> str:
        """计算美学DNA标签"""
        # 找出前两大美学风格
        sorted_styles = sorted(
            aesthetics_spectrum.items(),
            key=lambda x: x[1],
            reverse=True
        )
        top2 = sorted_styles[:2]
        labels = {
            "wabi_sabi": "侘寂极简", "eccentric_cute": "古怪可爱",
            "modern_design": "现代设计", "traditional_chinese": "中式传统",
            "bohemian": "波西米亚"
        }
        parts = []
        for style, score in top2:
            if score > 0.1:
                label = labels.get(style, style)
                parts.append(f"{int(score * 100)}% {label}")

        if not parts:
            return "未定义美学风格"

        return " + ".join(parts)

    def _compute_emotional_curve(
        self,
        emotion_idx: Dict[str, float]
    ) -> str:
        """计算情绪曲线描述"""
        energy = emotion_idx.get("energy", 0.5)
        pace = emotion_idx.get("pace", 0.5)

        if energy < 0.3:
            start = "枯竭"
        elif energy < 0.5:
            start = "疲惫"
        elif energy < 0.7:
            start = "平稳"
        else:
            start = "充盈"

        if energy >= 0.5:
            end = "充盈"
            outcome = "活力焕发"
        elif energy >= 0.3:
            end = "恢复"
            outcome = "渐入佳境"
        else:
            end = "枯竭"
            outcome = "需要更多时间疗愈"

        if energy < 0.3 and pace < 0.3:
            return "从枯竭到沉寂（深度疗愈模式）"
        elif energy < 0.3:
            return f"从{start}到{end}（疗愈进行中）"
        elif energy < 0.7:
            return f"从{start}到{end}（{outcome}）"
        else:
            return f"从{start}到{end}（{outcome}）"

    def _generate_narrative(
        self,
        aesthetics_spectrum: Dict[str, float],
        emotion_idx: Dict[str, float],
        merchant_names: List[str],
        merchant_tags: List[str],
    ) -> str:
        """生成叙事日志"""
        energy = emotion_idx.get("energy", 0.5)

        # 选择叙事基调
        if energy < 0.3:
            templates = NARRATIVE_TEMPLATES["healing_low_energy"]
            adj_pool = ADJECTIVES["wabi_sabi"]
        elif energy > 0.7:
            templates = NARRATIVE_TEMPLATES["exploration_high_energy"]
            adj_pool = ADJECTIVES["eccentric_cute"]
        else:
            # 根据美学光谱选择
            if aesthetics_spectrum.get("wabi_sabi", 0) > 0.6:
                templates = NARRATIVE_TEMPLATES["wabi_sabi"]
                adj_pool = ADJECTIVES["wabi_sabi"]
            else:
                templates = NARRATIVE_TEMPLATES["eccentric_cute"]
                adj_pool = ADJECTIVES["eccentric_cute"]

        # 填充模板
        segments = []
        placeholders = {
            "place": merchant_names[0] if merchant_names else "景德镇",
            "location": random.choice(["三宝村", "雕塑瓷厂", "陶溪川", "老厂区", "弄堂深处"]),
            "era": random.choice(["宋代", "明代", "清代", "民国"]),
            "craft": random.choice(merchant_tags) if merchant_tags else "陶瓷",
            "feature": random.choice(["天窗", "老墙", "木架", "水景", "庭院"]),
            "adjective": random.choice(adj_pool),
        }

        for template in templates[:2]:
            segment = template.format(**placeholders)
            segments.append(segment)

        # 结尾升华
        if energy < 0.5:
            closing = "这趟旅程，是你与自己内心的对话。"
        else:
            closing = "每一件器物，都是这场旅行中最忠实的见证者。"

        return " ".join(segments) + " " + closing

    def generate(
        self,
        user_id: str,
        emotion_idx: Dict[str, float],
        routing_params: Dict[str, float],
        aesthetics_spectrum: Dict[str, float],
        merchant_names: List[str],
        merchant_tags: List[str],
        partner_merchant_id: Optional[str] = None,
    ) -> MindPrint:
        """
        生成完整的心灵足迹

        Args:
            user_id: 用户ID
            emotion_idx: 情绪状态
            routing_params: 路由参数
            aesthetics_spectrum: 美学光谱
            merchant_names: 访问过的商户名称列表
            merchant_tags: 商户标签列表
            partner_merchant_id: 合作商户ID (可选，用于忠诚度验证)

        Returns:
            MindPrint: 完整的心灵足迹
        """
        wallet = self._generate_wallet()
        aesthetic_dna = self._compute_aesthetic_dna(aesthetics_spectrum, routing_params)
        emotional_curve = self._compute_emotional_curve(emotion_idx)
        narrative = self._generate_narrative(
            aesthetics_spectrum, emotion_idx, merchant_names, merchant_tags
        )

        loyalty_verification = None
        if partner_merchant_id:
            loyalty_verification = LoyaltyVerification(
                partner_merchant_id=partner_merchant_id,
                lifetime_discount=round(random.uniform(0.8, 0.95), 2),
                story_uploaded=False,
            )

        mind_print = MindPrint(
            mind_print_id=self._generate_id(),
            user_wallet_mock=wallet,
            journey_summary=JourneySummary(
                aesthetic_dna=aesthetic_dna,
                emotional_curve=emotional_curve,
            ),
            narrative_log=narrative,
            loyalty_verification=loyalty_verification,
            created_at=datetime.now().isoformat(),
        )
        return mind_print


def mind_print_to_json(mind_print: MindPrint) -> str:
    """将MindPrint序列化为JSON字符串"""
    data = {
        "mind_print_id": mind_print.mind_print_id,
        "user_wallet_mock": mind_print.user_wallet_mock,
        "journey_summary": {
            "aesthetic_dna": mind_print.journey_summary.aesthetic_dna,
            "emotional_curve": mind_print.journey_summary.emotional_curve,
        },
        "narrative_log": mind_print.narrative_log,
        "created_at": mind_print.created_at,
    }
    if mind_print.loyalty_verification:
        data["loyalty_verification"] = {
            "partner_merchant_id": mind_print.loyalty_verification.partner_merchant_id,
            "lifetime_discount": mind_print.loyalty_verification.lifetime_discount,
            "story_uploaded": mind_print.loyalty_verification.story_uploaded,
        }
    return json.dumps(data, ensure_ascii=False, indent=2)