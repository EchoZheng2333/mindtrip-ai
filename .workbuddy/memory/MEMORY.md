# 心旅 AI 项目长期约定

## Git / GitHub
- **远程仓库必须常更新**（echo 明确要求）：每次会话完成实质工作后，commit + push 到 GitHub（`origin: EchoZheng2333/mindtrip-ai`，分支 main）。
- 网络注意：CN 网络对 GitHub 大对象 push 易 408/SSL 中断；已配置 `http.postBuffer=524288000`、`http.version=HTTP/1.1`、lowSpeed 参数。长 push 用后台方式运行。
- 远程可能有 echo 在网页端的提交（如 Update README.md），push 前先 `git fetch` + `git pull --rebase`，必要时 `--force-with-lease`。

## 密钥安全
- **`.env.example` 只放占位符**（`sk-xxx...` / `xxx...`），真实 key 只存 `.env`（已被 .gitignore 排除）。
- 2026-08-12 曾发生 .env.example 含真实 DeepSeek/高德 key 入库（提交 c59a065），已用 filter-branch 重写历史清除并推送；**echo 需在 DeepSeek/高德后台轮换这两个 key**（旧 key 曾明文存在本地历史）。
- 推送前若遇 GitHub Push Protection 拦截，先查是否 .env* 泄露。

## 项目方向（2026-08-12 需求对齐确认）
- 品牌统一「心旅 AI」；灵感之源 AI 为前身（设计语言可继承）。
- 语言双轨：对外四维画像/人格卡/心灵指数；心理学模型（大五/荣格/美学向量）仅存算法内部（ADR-0001）。
- 主线 EJS v1.2（frontend/mindtrip-ai），React 前端冻结（ADR-0002）；心灵足迹去 Web3（ADR-0003）。
- 演示版目标 2026-10-17，需求见 `docs/demo-requirements.md`；词汇表权威 `CONTEXT.md`。
- Obsidian vault「心旅AI」目录同步人读版文档。
