# 03 · 测评页"上一题后无法前进" + 导航栏宽度不匹配

Status: resolved

## 问题
1. 测评页点"上一题"回退后，无法返回到下一题
2. 导航栏横向长度与首页全宽色块不匹配（顶栏比内容窄一圈）

## 根因
1. `renderQuestion()` 非最后一题时把"下一题"按钮 `display:none`（依赖"选中自动跳题"）——回退/回改后（回改不触发自动跳）没有任何前进入口
2. 首页 hero/痛点/解法/场景/收尾区块均用 `margin: 0 -20px` 突破容器 padding 形成全宽色块，但 `.app-header__bar` 在容器 padding 内 → 顶栏比首页区块左右各窄 20px（mobile 16px）

## 修复
- `views/quiz.ejs`：
  - 中间题也显示"下一题"按钮（当前题未答时 `disabled`，保证逐题作答）；最后一题保持"查看结果"
  - 新增 `autoAdvanceTimer` 管理首次作答的 300ms 自动跳题定时器，`nextQuestion()` / `prevQuestion()` 先 `clearTimeout`，避免"自动跳 + 手动点"连跳两题
- `public/css/style.css`：`.app-header__bar` 加 `margin: 0 -20px`（≤600px 时 `-16px`），与容器 padding 抵消，导航栏与首页全宽色块对齐

## 验证
- quiz 页渲染含新逻辑（autoAdvanceTimer 4 处、中间题按钮、disabled 判断）
- 首页 200；导航栏全宽样式就位
