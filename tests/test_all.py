"""
心旅 AI 核心引擎 — 自动化测试套件
===================================
覆盖 PRD 6.1 边界值测试用例 + 模块单元测试
"""

import pytest
import math
import time
import sys
import os

# 确保backend可导入
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from backend.module_2_psychology import (
    calculate_routing_parameters,
    validate_emotion,
    validate_big_five,
    validate_archetypes,
    get_emotion_label,
    ARCHETYPE_NAMES,
)
from backend.module_3_aesthetics import (
    create_extractor,
    V1OpenCVExtractor,
    MerchantAesthetics,
    AestheticsSpectrum,
    aesthetics_to_dict,
)
from backend.module_4_routing import (
    RoutingOptimizer,
    Merchant,
    create_default_merchants,
    MAX_EXPOSURE_CAP,
    MAX_DAYS_CAP,
    SURPRISE_WEIGHT_INITIAL,
)
from backend.module_5_mind_print import (
    MindPrintGenerator,
    MindPrint,
    JourneySummary,
    mind_print_to_json,
)


# ======================================================================
# 辅助函数: 生成标准测试输入
# ======================================================================

def default_emotion(energy=0.5, pace=0.5):
    return {"energy": energy, "pace": pace}

def default_big_five(O=0.5, C=0.5, E=0.5, A=0.5, N=0.5):
    return {"O": O, "C": C, "E": E, "A": A, "N": N}

def default_archetypes(**overrides):
    archetypes = {name: 0.3 for name in ARCHETYPE_NAMES}
    archetypes.update(overrides)
    return archetypes


# ======================================================================
# Module 2.0: 心理学测评引擎测试
# ======================================================================

class TestModule2Validation:
    """输入校验测试"""

    def test_validate_emotion_valid(self):
        assert validate_emotion({"energy": 0.5, "pace": 0.5}) is True

    def test_validate_emotion_missing_key(self):
        assert validate_emotion({"energy": 0.5}) is False

    def test_validate_emotion_out_of_range(self):
        assert validate_emotion({"energy": 1.5, "pace": 0.5}) is False

    def test_validate_emotion_negative(self):
        assert validate_emotion({"energy": -0.1, "pace": 0.5}) is False

    def test_validate_emotion_boundary_low(self):
        assert validate_emotion({"energy": 0.0, "pace": 0.0}) is True

    def test_validate_emotion_boundary_high(self):
        assert validate_emotion({"energy": 1.0, "pace": 1.0}) is True

    def test_validate_big_five_valid(self):
        assert validate_big_five({"O": 0.5, "C": 0.5, "E": 0.5, "A": 0.5, "N": 0.5}) is True

    def test_validate_big_five_missing(self):
        assert validate_big_five({"O": 0.5, "C": 0.5, "E": 0.5, "A": 0.5}) is False

    def test_validate_archetypes_valid(self):
        arch = {name: 0.3 for name in ARCHETYPE_NAMES}
        assert validate_archetypes(arch) is True

    def test_validate_archetypes_missing(self):
        assert validate_archetypes({"explorer": 0.5}) is False


class TestModule2RoutingParameters:
    """路由参数计算测试"""

    def test_normal_state(self):
        """正常状态: 默认参数"""
        params = calculate_routing_parameters(
            default_emotion(), default_big_five(), default_archetypes()
        )
        assert params["privacy_weight"] == 0.5
        assert params["crowd_threshold"] == 0.6
        assert params["stay_duration_min"] == 45.0
        assert params["max_recommendations"] == 5

    # --- 【测试用例 1】极致低能量过滤 ---
    def test_extreme_low_energy_hard_fuse(self):
        """
        边界值测试: 能量枯竭状态
        输入: energy=0.05, pace=0.1
        预期: privacy_weight >= 0.85, crowd_threshold <= 0.3,
              stay_duration_min >= 90, max_recommendations <= 3
        """
        params = calculate_routing_parameters(
            default_emotion(energy=0.05, pace=0.1),
            default_big_five(),
            default_archetypes()
        )
        # 硬熔断: 低能量时隐私权重提高
        assert params["privacy_weight"] >= 0.85, "低能量时应提高隐私权重"
        # 硬熔断: 人流阈值降低
        assert params["crowd_threshold"] <= 0.3, "低能量时应降低人流阈值"
        # 硬熔断: 停留时间延长
        assert params["stay_duration_min"] >= 90, "低能量时应延长停留时间"
        # 硬熔断: 推荐数量减少
        assert params["max_recommendations"] <= 3, "低能量时应减少推荐数量"

    def test_low_energy_edge_case(self):
        """能量刚好在0.3边界"""
        params = calculate_routing_parameters(
            default_emotion(energy=0.3, pace=0.5),
            default_big_five(),
            default_archetypes()
        )
        # 0.3 不触发低能量熔断
        assert params["privacy_weight"] == 0.5, "0.3能量不应触发硬熔断"

    def test_low_energy_just_below_threshold(self):
        """能量刚好低于0.3边界"""
        params = calculate_routing_parameters(
            default_emotion(energy=0.299, pace=0.5),
            default_big_five(),
            default_archetypes()
        )
        # 应触发熔断
        assert params["max_recommendations"] <= 3, "0.299能量应触发硬熔断"

    def test_high_openness_affects_eccentric_cute(self):
        """高开放性(O)应增加古怪可爱亲和度"""
        params = calculate_routing_parameters(
            default_emotion(),
            default_big_five(O=1.0),
            default_archetypes()
        )
        assert params["eccentric_cute_affinity"] == 0.7, "O=1.0时 affinity 应为 0.7"

    def test_low_extraversion_affects_wabi_sabi(self):
        """低外倾性(E)应增加侘寂亲和度"""
        params = calculate_routing_parameters(
            default_emotion(),
            default_big_five(E=0.0),
            default_archetypes()
        )
        assert params["wabi_sabi_affinity"] == 0.6, "E=0.0时 wabi_sabi_affinity 应为 0.6"

    def test_high_explorer_with_energy(self):
        """高探险家原型 + 足够能量 -> hidden_gem_bonus"""
        params = calculate_routing_parameters(
            default_emotion(energy=0.5),
            default_big_five(),
            default_archetypes(explorer=0.8)
        )
        assert params["hidden_gem_bonus"] == 0.3

    def test_high_explorer_low_energy_no_bonus(self):
        """高探险家原型 + 低能量 -> 无 hidden_gem_bonus"""
        params = calculate_routing_parameters(
            default_emotion(energy=0.2),
            default_big_five(),
            default_archetypes(explorer=0.8)
        )
        assert params["hidden_gem_bonus"] == 0.0, "低能量时探险家不应获得隐藏宝石加成"

    def test_archetype_bonus_accumulation(self):
        """多个原型同时触发时应叠加加成"""
        params = calculate_routing_parameters(
            default_emotion(energy=0.5),
            default_big_five(),
            default_archetypes(explorer=0.8, creator=0.7, sage=0.7)
        )
        assert params.get("hidden_gem_bonus", 0) > 0
        assert params.get("handmade_affinity_bonus", 0) > 0
        assert params.get("cultural_depth_bonus", 0) > 0

    def test_invalid_input_raises(self):
        """无效输入应抛出ValueError"""
        with pytest.raises(ValueError):
            calculate_routing_parameters(
                {"energy": 1.5, "pace": 0.5},
                default_big_five(),
                default_archetypes()
            )


class TestModule2EmotionLabel:
    """情绪标签测试"""

    def test_exhausted(self):
        assert get_emotion_label(0.1, 0.1) == "枯竭沉寂"

    def test_low_energy(self):
        assert get_emotion_label(0.1, 0.5) == "能量枯竭"

    def test_calm(self):
        assert get_emotion_label(0.5, 0.1) == "舒缓平静"

    def test_hyper(self):
        assert get_emotion_label(0.8, 0.8) == "亢奋活跃"

    def test_energetic(self):
        assert get_emotion_label(0.8, 0.5) == "精力充沛"

    def test_balanced(self):
        assert get_emotion_label(0.5, 0.5) == "平稳均衡"


# ======================================================================
# Module 3.0: 美学解析引擎测试
# ======================================================================

class TestModule3Extractor:
    """美学提取器测试"""

    def setup_method(self):
        self.extractor = create_extractor("v1")
        assert isinstance(self.extractor, V1OpenCVExtractor)

    def test_extract_known_merchant(self):
        """已知商户应返回正确美学特征"""
        aesthetics = self.extractor.extract_from_data("JZD_M_009")
        assert aesthetics is not None
        assert aesthetics.merchant_id == "JZD_M_009"
        assert aesthetics.aesthetics_spectrum.wabi_sabi == 0.88
        assert "粗粝陶土" in aesthetics.extracted_tags

    def test_extract_unknown_merchant(self):
        """未知商户应返回默认值"""
        aesthetics = self.extractor.extract_from_data("UNKNOWN")
        assert aesthetics is not None
        assert aesthetics.merchant_id == "UNKNOWN"
        assert aesthetics.aesthetics_spectrum.wabi_sabi == 0.5

    def test_extract_from_path(self):
        """从图片路径解析商户ID"""
        aesthetics = self.extractor.extract("images/JZD_M_012_main.jpg")
        assert aesthetics.merchant_id == "JZD_M_012"
        assert aesthetics.aesthetics_spectrum.eccentric_cute == 0.85

    def test_aesthetics_to_dict_format(self):
        """输出格式应匹配PRD规范"""
        aesthetics = self.extractor.extract_from_data("JZD_M_009")
        result = aesthetics_to_dict(aesthetics)
        assert "merchant_id" in result
        assert "aesthetics_spectrum" in result
        assert "extracted_tags" in result
        assert "wabi_sabi" in result["aesthetics_spectrum"]
        assert "eccentric_cute" in result["aesthetics_spectrum"]

    def test_v2_extractor_not_implemented(self):
        """v2提取器应抛出NotImplementedError"""
        if False:  # 仅检查接口存在
            pass
        from backend.module_3_aesthetics import V2LLMExtractor
        import asyncio
        with pytest.raises(NotImplementedError):
            asyncio.run(V2LLMExtractor().extract("test.jpg"))


# ======================================================================
# Module 4.0: 动态路径规划测试
# ======================================================================

class TestModule4RoutingOptimizer:
    """路径规划优化器测试"""

    def setup_method(self):
        self.optimizer = RoutingOptimizer()
        self.merchants = create_default_merchants()
        self.user_profile = {
            "wabi_sabi": 0.7,
            "eccentric_cute": 0.3,
            "modern_design": 0.5,
            "traditional_chinese": 0.4,
            "bohemian": 0.3,
        }

    def test_match_score_same_vector(self):
        """相同向量的余弦相似度应为1.0"""
        merchant = self.merchants[0]
        vector = merchant.aesthetics_vector.copy()
        score = self.optimizer.calculate_match_score(vector, merchant)
        assert abs(score - 1.0) < 0.001, f"相同向量相似度应为1.0, 实际{score}"

    def test_match_score_orthogonal(self):
        """正交向量应得0分"""
        merchant = Merchant(
            merchant_id="test", name="test", category="test",
            tags=[], aesthetics_vector={"wabi_sabi": 0.0, "eccentric_cute": 0.0},
            crowd_density=0.0
        )
        score = self.optimizer.calculate_match_score(
            {"wabi_sabi": 1.0, "eccentric_cute": 0.0}, merchant
        )
        assert score == 0.0

    def test_match_score_empty_vector(self):
        """空向量应返回0"""
        merchant = Merchant(
            merchant_id="test", name="test", category="test",
            tags=[], aesthetics_vector={},
            crowd_density=0.0
        )
        score = self.optimizer.calculate_match_score({}, merchant)
        assert score == 0.0

    def test_uniqueness_score_single_merchant(self):
        """单个商户时独特度应为0.5"""
        score = self.optimizer.calculate_uniqueness_score(
            self.merchants[0], [self.merchants[0]]
        )
        assert score == 0.5

    def test_uniqueness_score_multiple(self):
        """多个商户时独特度应在[0,1]范围内"""
        score = self.optimizer.calculate_uniqueness_score(
            self.merchants[0], self.merchants
        )
        assert 0.0 <= score <= 1.0

    def test_surprise_weight_new_merchant(self):
        """新商户应有惊喜扶持权重"""
        score = self.optimizer.calculate_surprise_weight(self.merchants[4])  # 自然编织工作室
        assert score > 0.0, "新商户应有惊喜权重"

    def test_surprise_weight_old_merchant(self):
        """老商户不应有惊喜权重"""
        score = self.optimizer.calculate_surprise_weight(self.merchants[1])  # 波普实验室
        assert score == 0.0, "老商户不应有惊喜权重"

    def test_surprise_weight_max_exposure(self):
        """超过曝光上限的商户应无惊喜权重"""
        merchant = Merchant(
            merchant_id="test", name="test", category="test",
            tags=[], aesthetics_vector={}, crowd_density=0.0,
            is_new=True, join_timestamp=time.time(),
            total_impressions=MAX_EXPOSURE_CAP + 1,
        )
        score = self.optimizer.calculate_surprise_weight(merchant)
        assert score == 0.0, "超过曝光上限应无惊喜权重"

    def test_surprise_weight_max_days(self):
        """超过入驻天数上限的商户应无惊喜权重"""
        old_time = time.time() - (MAX_DAYS_CAP + 1) * 24 * 3600
        merchant = Merchant(
            merchant_id="test", name="test", category="test",
            tags=[], aesthetics_vector={}, crowd_density=0.0,
            is_new=True, join_timestamp=old_time,
            total_impressions=0,
        )
        score = self.optimizer.calculate_surprise_weight(merchant)
        assert score == 0.0, "超过入驻天数上限应无惊喜权重"

    # --- 【测试用例 2】反作弊熔断机制 ---
    def test_anti_cheat_zero_confidence(self):
        """
        反作弊熔断测试
        输入: 商户A的置信度 C_A = 0.0, 匹配度 M_A = 0.99
        预期: 最终得分 S_A 必须大幅度低于常规基准，从首选路径中无条件剔除
        """
        # 创建一个高匹配度但置信度为0的商户
        cheat_merchant = Merchant(
            merchant_id="JZD_M_CHEAT", name="作弊商户",
            category="test", tags=["fake"],
            aesthetics_vector={"wabi_sabi": 0.7, "eccentric_cute": 0.3},
            crowd_density=0.1,
            is_new=True,
            join_timestamp=time.time(),
            confidence_coefficient=0.0,  # 反作弊: 置信度为0
        )

        # 创建一个正常商户做对比
        normal_merchant = Merchant(
            merchant_id="JZD_M_NORMAL", name="正常商户",
            category="test", tags=["real"],
            aesthetics_vector={"wabi_sabi": 0.5, "eccentric_cute": 0.3},
            crowd_density=0.1,
            is_new=True,
            join_timestamp=time.time(),
            confidence_coefficient=1.0,
        )

        all_merchants = [cheat_merchant, normal_merchant]
        user_profile = {"wabi_sabi": 0.7, "eccentric_cute": 0.3}

        # 计算得分
        cheat_score, cheat_detail = self.optimizer.get_merchant_final_score(
            cheat_merchant, user_profile, all_merchants
        )
        normal_score, normal_detail = self.optimizer.get_merchant_final_score(
            normal_merchant, user_profile, all_merchants
        )

        # 断言: 作弊商户得分应显著低于正常商户
        assert cheat_score < normal_score, \
            f"作弊商户得分({cheat_score})应低于正常商户({normal_score})"
        # 断言: 作弊商户的惊喜项应为0
        assert cheat_detail["effective_surprise"] == 0.0, "置信度为0时惊喜项应为0"
        # 断言: 作弊商户应被剔除出路线
        route = self.optimizer.plan_route(
            user_profile, all_merchants,
            {"max_recommendations": 5, "crowd_threshold": 1.0, "hidden_gem_bonus": 0.0}
        )
        assert cheat_merchant.merchant_id not in route.merchant_ids, \
            "作弊商户应从推荐路线中剔除"

    def test_crowd_density_filter(self):
        """人流密度过滤: 超过阈值的商户应被剔除"""
        route = self.optimizer.plan_route(
            self.user_profile, self.merchants,
            {"max_recommendations": 5, "crowd_threshold": 0.3, "hidden_gem_bonus": 0.0}
        )
        # 青花旧梦 crowd_density=0.7 > 0.3，应被过滤
        assert "JZD_M_045" not in route.merchant_ids, "超过人流阈值的商户应被过滤"

    def test_plan_route_ordering(self):
        """路线应按得分降序排列"""
        route = self.optimizer.plan_route(
            self.user_profile, self.merchants,
            {"max_recommendations": 5, "crowd_threshold": 1.0, "hidden_gem_bonus": 0.0}
        )
        scores = [d["final_score"] for d in route.scores_detail]
        for i in range(len(scores) - 1):
            assert scores[i] >= scores[i + 1], \
                f"路线应按得分降序排列: {scores[i]} < {scores[i+1]}"

    def test_plan_route_max_results(self):
        """路线推荐数量应受max_recommendations限制"""
        route = self.optimizer.plan_route(
            self.user_profile, self.merchants,
            {"max_recommendations": 2, "crowd_threshold": 1.0, "hidden_gem_bonus": 0.0}
        )
        assert len(route.merchant_ids) <= 2, "推荐数量应不超过max_recommendations"

    def test_plan_route_empty_merchants(self):
        """空商户列表应返回空路线"""
        route = self.optimizer.plan_route(
            self.user_profile, [],
            {"max_recommendations": 5, "crowd_threshold": 1.0, "hidden_gem_bonus": 0.0}
        )
        assert len(route.merchant_ids) == 0
        assert route.total_score == 0.0


# ======================================================================
# Module 5.0: 心灵足迹测试
# ======================================================================

class TestModule5MindPrint:
    """心灵足迹生成测试"""

    def setup_method(self):
        self.generator = MindPrintGenerator()
        self.emotion = {"energy": 0.5, "pace": 0.5}
        self.routing_params = {
            "wabi_sabi_affinity": 0.5, "eccentric_cute_affinity": 0.5,
            "hidden_gem_bonus": 0.0,
        }
        self.aesthetics = {
            "wabi_sabi": 0.7, "eccentric_cute": 0.3,
            "modern_design": 0.2, "traditional_chinese": 0.1,
            "bohemian": 0.1,
        }

    def test_generate_basic(self):
        """基本生成测试"""
        mp = self.generator.generate(
            "user_001", self.emotion, self.routing_params,
            self.aesthetics, ["造心社", "玻璃光舍"],
            ["陶瓷", "粗粝陶土", "极简"],
        )
        assert isinstance(mp, MindPrint)
        assert mp.mind_print_id.startswith("MP_")
        assert mp.journey_summary.aesthetic_dna != ""

    def test_generate_unique_id(self):
        """每次生成应产生不同的ID"""
        mp1 = self.generator.generate(
            "user_001", self.emotion, self.routing_params,
            self.aesthetics, ["造心社"], ["陶瓷"],
        )
        mp2 = self.generator.generate(
            "user_002", self.emotion, self.routing_params,
            self.aesthetics, ["玻璃光舍"], ["玻璃"],
        )
        assert mp1.mind_print_id != mp2.mind_print_id

    def test_json_output_format(self):
        """JSON输出格式应符合PRD规范"""
        mp = self.generator.generate(
            "user_001", self.emotion, self.routing_params,
            self.aesthetics, ["造心社"], ["陶瓷"],
            partner_merchant_id="JZD_M_009",
        )
        json_str = mind_print_to_json(mp)
        import json
        data = json.loads(json_str)
        assert "mind_print_id" in data
        assert "user_wallet_mock" in data
        assert "journey_summary" in data
        assert "narrative_log" in data
        assert "loyalty_verification" in data
        assert data["loyalty_verification"]["partner_merchant_id"] == "JZD_M_009"
        assert "lifetime_discount" in data["loyalty_verification"]

    def test_emotional_curve_low_energy(self):
        """低能量情绪曲线描述"""
        mp = self.generator.generate(
            "user_001", {"energy": 0.2, "pace": 0.2},
            self.routing_params, self.aesthetics,
            ["造心社"], ["陶瓷"],
        )
        assert "疗愈" in mp.journey_summary.emotional_curve

    def test_emotional_curve_high_energy(self):
        """高能量情绪曲线描述"""
        mp = self.generator.generate(
            "user_001", {"energy": 0.8, "pace": 0.7},
            self.routing_params, self.aesthetics,
            ["造心社"], ["陶瓷"],
        )
        assert "充盈" in mp.journey_summary.emotional_curve

    def test_low_energy_narrative_healing(self):
        """低能量叙事应使用疗愈词库"""
        mp = self.generator.generate(
            "user_001", {"energy": 0.1, "pace": 0.1},
            self.routing_params, self.aesthetics,
            ["造心社"], ["陶瓷"],
        )
        assert "治愈" in mp.narrative_log or "温柔" in mp.narrative_log or "慢" in mp.narrative_log


# ======================================================================
# 集成测试: 端到端流程
# ======================================================================

class TestIntegration:
    """端到端集成测试"""

    def test_full_pipeline_normal(self):
        """正常流程: 测评 -> 路由 -> 规划 -> 心灵足迹"""
        emotion = {"energy": 0.6, "pace": 0.5}
        big_five = {"O": 0.7, "C": 0.6, "E": 0.4, "A": 0.8, "N": 0.3}
        archetypes = {name: 0.3 for name in ARCHETYPE_NAMES}
        archetypes["explorer"] = 0.8

        # Module 2
        params = calculate_routing_parameters(emotion, big_five, archetypes)
        assert params["eccentric_cute_affinity"] == 0.49  # 0.7 * 0.7
        assert params["hidden_gem_bonus"] == 0.3

        # Module 4
        optimizer = RoutingOptimizer()
        user_profile = {
            "wabi_sabi": params.get("wabi_sabi_affinity", 0.5),
            "eccentric_cute": params.get("eccentric_cute_affinity", 0.5),
            "modern_design": 0.5,
            "traditional_chinese": 0.5,
            "bohemian": 0.5,
        }
        merchants = create_default_merchants()
        route = optimizer.plan_route(user_profile, merchants, params)
        assert len(route.merchant_ids) > 0
        assert route.total_score > 0

        # Module 5
        generator = MindPrintGenerator()
        aesthetics = {
            "wabi_sabi": 0.5, "eccentric_cute": 0.5,
            "modern_design": 0.5, "traditional_chinese": 0.5,
            "bohemian": 0.5,
        }
        mp = generator.generate(
            "user_001", emotion, params, aesthetics,
            ["造心社"], ["陶瓷"],
        )
        assert mp.mind_print_id is not None

    def test_full_pipeline_low_energy(self):
        """
        完整端到端: 极致低能量过滤
        验证: 路线推荐不超过3个，无高人流商户
        """
        emotion = {"energy": 0.05, "pace": 0.1}
        big_five = {"O": 0.5, "C": 0.5, "E": 0.5, "A": 0.5, "N": 0.5}
        archetypes = {name: 0.3 for name in ARCHETYPE_NAMES}

        # 计算路由参数
        params = calculate_routing_parameters(emotion, big_five, archetypes)
        assert params["max_recommendations"] <= 3, "低能量时推荐数应≤3"
        assert params["privacy_weight"] >= 0.85, "低能量时隐私权重应≥0.85"

        # 规划路线
        optimizer = RoutingOptimizer()
        user_profile = {
            "wabi_sabi": 0.5, "eccentric_cute": 0.5,
            "modern_design": 0.5, "traditional_chinese": 0.5,
            "bohemian": 0.5,
        }
        merchants = create_default_merchants()
        route = optimizer.plan_route(user_profile, merchants, params)

        # 验证: 路线不超过3个商户
        assert len(route.merchant_ids) <= 3, \
            f"低能量路线应≤3个商户, 实际{len(route.merchant_ids)}"

        # 验证: 无高人流商户 (crowd_density > 0.4)
        for mid in route.merchant_ids:
            for m in merchants:
                if m.merchant_id == mid:
                    assert m.crowd_density <= 0.4, \
                        f"商户{m.name}人流密度{m.crowd_density} > 0.4，不应被推荐"

    def test_full_pipeline_anti_cheat(self):
        """
        完整端到端: 反作弊熔断
        验证: 置信度为0的商户被剔除
        """
        emotion = {"energy": 0.6, "pace": 0.5}
        big_five = {"O": 0.7, "C": 0.6, "E": 0.4, "A": 0.8, "N": 0.3}
        archetypes = {name: 0.3 for name in ARCHETYPE_NAMES}

        params = calculate_routing_parameters(emotion, big_five, archetypes)
        optimizer = RoutingOptimizer()
        user_profile = {"wabi_sabi": 0.5, "eccentric_cute": 0.5,
                        "modern_design": 0.5, "traditional_chinese": 0.5, "bohemian": 0.5}
        merchants = create_default_merchants()

        route = optimizer.plan_route(user_profile, merchants, params)

        # 验证: "可疑刷单店"(JZD_M_088, confidence=0) 被剔除
        assert "JZD_M_088" not in route.merchant_ids, \
            "置信度为0的商户应从推荐路线中剔除"


# ======================================================================
# FastAPI 集成测试
# ======================================================================

class TestFastAPI:
    """FastAPI 接口测试"""

    def test_analyze_endpoint(self):
        """测试 /api/v1/analyze-quiz 端点"""
        from fastapi.testclient import TestClient
        from backend.main import app

        client = TestClient(app)
        response = client.post("/api/v1/analyze-quiz", json={
            "emotion": {"energy": 0.5, "pace": 0.5},
            "big_five": {"O": 0.5, "C": 0.5, "E": 0.5, "A": 0.5, "N": 0.5},
            "archetypes": {name: 0.3 for name in ARCHETYPE_NAMES},
        })
        assert response.status_code == 200
        data = response.json()
        assert "routing_parameters" in data
        assert "emotion_label" in data

    def test_plan_route_endpoint(self):
        """测试 /api/v1/plan-route 端点"""
        from fastapi.testclient import TestClient
        from backend.main import app

        client = TestClient(app)
        response = client.post("/api/v1/plan-route", json={
            "emotion": {"energy": 0.6, "pace": 0.5},
            "big_five": {"O": 0.7, "C": 0.6, "E": 0.4, "A": 0.8, "N": 0.3},
            "archetypes": {name: 0.3 for name in ARCHETYPE_NAMES},
        })
        assert response.status_code == 200
        data = response.json()
        assert "route" in data
        assert "merchant_ids" in data["route"]
        assert "merchant_details" in data["route"]

    def test_merchants_endpoint(self):
        """测试 /api/v1/merchants 端点"""
        from fastapi.testclient import TestClient
        from backend.main import app

        client = TestClient(app)
        response = client.get("/api/v1/merchants")
        assert response.status_code == 200
        data = response.json()
        assert "merchants" in data
        assert len(data["merchants"]) > 0

    def test_merchant_aesthetics_endpoint(self):
        """测试 /api/v1/merchant/{id}/aesthetics 端点"""
        from fastapi.testclient import TestClient
        from backend.main import app

        client = TestClient(app)
        response = client.get("/api/v1/merchant/JZD_M_009/aesthetics")
        assert response.status_code == 200
        data = response.json()
        assert data["merchant_id"] == "JZD_M_009"
        assert "aesthetics_spectrum" in data

    def test_merchant_aesthetics_not_found(self):
        """测试不存在的商户返回默认美学特征"""
        from fastapi.testclient import TestClient
        from backend.main import app

        client = TestClient(app)
        response = client.get("/api/v1/merchant/UNKNOWN/aesthetics")
        assert response.status_code == 200
        data = response.json()
        assert data["merchant_id"] == "UNKNOWN"
        assert data["aesthetics_spectrum"]["wabi_sabi"] == 0.5

    def test_invalid_emotion_input(self):
        """测试无效输入返回422 (Pydantic校验)"""
        from fastapi.testclient import TestClient
        from backend.main import app

        client = TestClient(app)
        response = client.post("/api/v1/analyze-quiz", json={
            "emotion": {"energy": 1.5, "pace": 0.5},
            "big_five": {"O": 0.5, "C": 0.5, "E": 0.5, "A": 0.5, "N": 0.5},
            "archetypes": {name: 0.3 for name in ARCHETYPE_NAMES},
        })
        assert response.status_code == 422


if __name__ == "__main__":
    pytest.main(["-v", __file__])