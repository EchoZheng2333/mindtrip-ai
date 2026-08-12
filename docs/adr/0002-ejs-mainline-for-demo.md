# EJS v1.2 为演示版主线，React 前端暂缓

心旅 AI 决定演示版（比赛/路演）以 v1.2（EJS mainline）为唯一开发主线；现有 React 前端（`frontend/src`）暂停迭代，backend（FastAPI）保留为算法参考与赛后升级基础。

背景：仓库内并存 EJS v1.2（8 步旅程功能完整）、React demo（半成品，滑块直填接 FastAPI）、stitch-pages（设计稿）。演示版时间紧，需要最快路径达到"惊艳"效果。

选择理由：EJS 功能最全（快测/画像/动线/约束/LLM/地图全在）、Node 技术栈可自行维护、在其上做视觉升级远比从 React 半成品重写快。React 前端冻结，留待赛后评估（若上小程序/H5 再重新考虑）。

后果：演示版所有视觉升级（含全视觉沉浸测评）在 EJS 上实现；`frontend/src` 冻结；backend 引擎的心理学模型作为"赛后算法升级"的参考实现。
