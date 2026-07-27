---
# ===== 设计系统元数据（Design System Metadata） =====

# 设计系统名称 / 品牌名称
name: Soul Journey AI

# ===== 颜色系统（Color System） =====
# Material Design 3 (M3) 色彩体系，定义所有 UI 表面、文字、轮廓、主色、辅色和错误色
colors:
  # --- 表面色（Surface Colors）---
  # 最浅的表面底色，对应"纸白"概念
  surface: '#fdf8f8'
  # 稍暗的表面色，用于深度层次
  surface-dim: '#ddd9d8'
  # 明亮的表面色
  surface-bright: '#fdf8f8'
  # 最低对比度的容器色（通常为纯白）
  surface-container-lowest: '#ffffff'
  # 较低对比度的容器色
  surface-container-low: '#f7f3f2'
  # 默认容器色
  surface-container: '#f1edec'
  # 较高对比度的容器色
  surface-container-high: '#ebe7e6'
  # 最高对比度的容器色
  surface-container-highest: '#e5e2e1'

  # --- 表面文字色（On-Surface Colors）---
  # 在表面上的主要文字颜色（墨黑）
  on-surface: '#1c1b1b'
  # 在表面上的变体文字颜色
  on-surface-variant: '#444748'

  # --- 反色（Inverse Colors）---
  # 深色模式下的表面色
  inverse-surface: '#313030'
  # 深色模式下表面的文字颜色
  inverse-on-surface: '#f4f0ef'

  # --- 轮廓色（Outline Colors）---
  # 默认轮廓 / 边框颜色
  outline: '#747878'
  # 轮廓变体，用于较低强调的边框
  outline-variant: '#c4c7c7'
  # 表面色调，用于主题化
  surface-tint: '#5f5e5e'

  # --- 主色（Primary Colors）---
  # 品牌主色（墨黑）
  primary: '#000000'
  # 主色上的文字颜色（白色）
  on-primary: '#ffffff'
  # 主容器色（深灰）
  primary-container: '#1c1b1b'
  # 主容器上的文字颜色
  on-primary-container: '#858383'

  # 主色在深色背景上的反色
  inverse-primary: '#c8c6c5'

  # --- 辅色（Secondary Colors）---
  # 品牌辅色
  secondary: '#5d5f58'
  # 辅色上的文字颜色
  on-secondary: '#ffffff'
  # 辅容器色
  secondary-container: '#e3e3da'
  # 辅容器上的文字颜色
  on-secondary-container: '#63655e'

  # --- 第三色（Tertiary Colors）---
  # 第三品牌色（墨黑）
  tertiary: '#000000'
  # 第三色上的文字颜色
  on-tertiary: '#ffffff'
  # 第三容器色
  tertiary-container: '#1c1b1a'
  # 第三容器上的文字颜色
  on-tertiary-container: '#868382'

  # --- 错误色（Error Colors）---
  # 错误状态颜色（红色）
  error: '#ba1a1a'
  # 错误色上的文字颜色
  on-error: '#ffffff'
  # 错误容器背景色
  error-container: '#ffdad6'
  # 错误容器上的文字颜色
  on-error-container: '#93000a'

  # --- 固定变体色（Fixed Variant Colors）---
  # 主色固定（浅色）
  primary-fixed: '#e5e2e1'
  # 主色固定暗色
  primary-fixed-dim: '#c8c6c5'
  # 主色固定上的文字色
  on-primary-fixed: '#1c1b1b'
  # 主色固定上的文字变体色
  on-primary-fixed-variant: '#474746'
  # 辅色固定
  secondary-fixed: '#e3e3da'
  # 辅色固定暗色
  secondary-fixed-dim: '#c6c7bf'
  # 辅色固定上的文字色
  on-secondary-fixed: '#1a1c17'
  # 辅色固定上的文字变体色
  on-secondary-fixed-variant: '#464741'
  # 第三色固定
  tertiary-fixed: '#e6e2df'
  # 第三色固定暗色
  tertiary-fixed-dim: '#cac6c4'
  # 第三色固定上的文字色
  on-tertiary-fixed: '#1c1b1a'
  # 第三色固定上的文字变体色
  on-tertiary-fixed-variant: '#484645'

  # --- 其他色（Other）---
  # 页面 / 应用背景色
  background: '#fdf8f8'
  # 背景上的文字颜色
  on-background: '#1c1b1b'
  # 表面变体色
  surface-variant: '#e5e2e1'

# ===== 排版系统（Typography System） =====
# 定义所有文本层级：字族、字号、字重、行高和字间距
typography:
  # 大标题（桌面端）：适用于 Hero 区 / 大标题
  display-lg:
    fontFamily: Noto Serif
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 52px
    letterSpacing: -0.02em
  # 大标题（移动端）：移动设备上的大标题
  display-lg-mobile:
    fontFamily: Noto Serif
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  # 中号标题：适用于二级标题
  headline-md:
    fontFamily: Noto Serif
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
  # 大号正文：适用于较长的描述性文字
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  # 中号正文：默认正文大小
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  # 小号标签：适用于按钮、标签、辅助文字
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.04em

# ===== 圆角系统（Rounded / Border Radius System） =====
# 定义所有 UI 元素的圆角半径等级
rounded:
  sm: 0.25rem       # 小圆角：用于极小元素
  DEFAULT: 0.5rem   # 默认圆角
  md: 0.75rem       # 中圆角：用于输入框等
  lg: 1rem          # 大圆角：用于卡片
  xl: 1.5rem        # 特大圆角：用于主要容器
  full: 9999px      # 全圆角（胶囊 / 药丸形状）：用于按钮

# ===== 间距系统（Spacing System） =====
# 基于 8px 基数的间距体系，定义内外边距和布局边距
spacing:
  base: 8px         # 基准间距单位
  xs: 4px           # 极小间距（半基）
  sm: 12px          # 小间距
  md: 24px          # 中间距
  lg: 48px          # 大间距
  xl: 80px          # 特大间距
  gutter: 24px      # 栅格列间距
  margin-mobile: 20px     # 移动端页面边距
  margin-desktop: 64px    # 桌面端页面边距
---

# ===== 品牌与风格 =====

## Brand & Style
<!-- 品牌与风格概述 — 设计系统核心理念："禅意智能"，融合中国古典美学与现代界面设计 -->
The design system embodies "Zen Intelligence"—a harmonious intersection of traditional Chinese aesthetic philosophy and contemporary fluid interface design. It is crafted to evoke an emotional response of tranquility, reflection, and quiet companionship. The target audience seeks a digital sanctuary for emotional expression and AI-driven introspection.

The visual style is **New Chinese Minimalism**. It prioritizes "empty space" (Maobai) to reduce cognitive load, utilizing fluid transitions and soft glassmorphism to mimic the ephemeral nature of ink washing on rice paper. The interface feels organic and breathable, moving away from rigid digital structures toward a more poetic, tactile experience.

# ===== 色彩系统说明 =====

## Colors
<!-- 色彩体系说明 — 基于"墨黑"与"纸白"的高对比基础，辅以情感化强调色 -->
The palette is grounded in the contrast between **Ink Black** (text and structural depth) and **Paper White** (the primary canvas). This high-contrast foundation is softened by the use of mood-based accents that shift based on the user's emotional state or the time of day.

- **Zen Green** is used for growth, healing, and calm interactions.
- **Deep Indigo** represents deep reflection and nighttime introspection.
- **Sunset Coral** provides warmth for moments of joy or energy.
- **Ethereal Purple** is reserved for AI insights and spiritual exploration.

Surfaces utilize a soft glassmorphism effect, layering transparent "Paper White" over subtle background blurs to maintain a sense of lightness and depth.

# ===== 排版系统说明 =====

## Typography
<!-- 排版策略说明 — Noto Serif（衬线体，用于标题） 和 Plus Jakarta Sans（无衬线体，用于正文） 的搭配 -->
The typography strategy pairings reflect the "New Chinese" aesthetic. **Noto Serif** provides an authoritative yet poetic voice for headings, reminiscent of classic literature and calligraphy. Its high contrast and elegant terminals create a rhythmic reading experience.

**Plus Jakarta Sans** serves as the functional workhorse for body text and labels. Its soft, rounded letterforms mirror the organic nature of the UI, ensuring that even technical or systemic information feels approachable and empathetic. Line heights are purposefully generous to allow the text to "breathe" on the page.

# ===== 布局与间距说明 =====

## Layout & Spacing
<!-- 布局策略说明 — 基于 8px 间距体系，采用"流动-固定混合"布局，兼顾移动端与桌面端 -->
This design system utilizes an **8px spacing scale** to maintain mathematical harmony while allowing for the "generous whitespace" required by the brand personality. The layout philosophy is a **fluid-fixed hybrid**: 

- **Mobile:** A single-column layout with 20px side margins and 24px vertical gutters between cards.
- **Desktop:** A centered 12-column fixed grid (max-width 1200px) to prevent line lengths from becoming unreadable, maintaining the "sanctuary" feel.

Margins and paddings should favor the `lg` (48px) and `xl` (80px) values for section headers to create a sense of scale and importance, emphasizing the "Journey" aspect of the user experience.

# ===== 层次与深度说明 =====

## Elevation & Depth
<!-- 层次与深度表现 — 通过色调分层和柔和阴影替代生硬边框，营造通透感 -->
Depth is expressed through **Tonal Layering** and **Soft Shadows** rather than stark borders. The primary canvas is "Paper White." Elements elevated above the canvas (like cards or floating buttons) use a compound elevation style:
1.  **Backdrop Blur:** 12px to 20px blur on the underlying layer.
2.  **Shadow:** A very soft, diffused shadow (`y: 8, blur: 24, opacity: 0.04`) tinted slightly with the primary "Ink Black" to ground the element.
3.  **Inner Glow:** A 1px semi-transparent white border to simulate the edge of a glass pane catching light.

# ===== 形状 / 圆角说明 =====

## Shapes
<!-- 形状语言说明 — 以 24px (2xl) 圆角为核心，营造"鹅卵石"般的柔和触感 -->
The shape language is defined by the **24px (2xl) corner radius** for all primary containers and cards. This extreme roundedness removes visual tension and creates a "pebble-like" feel that is pleasant and safe.

- **Small elements (Inputs):** 12px radius.
- **Medium elements (Cards):** 24px radius.
- **Interactive elements (Buttons):** Full-pill (infinite radius) to distinguish them from information containers.

# ===== 组件说明 =====

## Components

### Buttons
<!-- 按钮组件 — 胶囊形状、浮动、线性渐变、大写字母 + 增加字间距 -->
Buttons are floating, pill-shaped elements. They should utilize soft linear gradients (e.g., Ink Black to a deep charcoal, or the mood-based accent to a lighter tint of the same hue). Text inside buttons should be uppercase with slightly increased letter spacing (0.05em) for a modern, refined look.

### Cards
<!-- 卡片组件 — 主要内容容器，24px 圆角、1px 半透明边框、玻璃态阴影 -->
Cards are the primary content vehicle. They feature a 24px corner radius, a subtle 1px border (#1A1A1A at 5% opacity), and the glassmorphic shadow described in the Elevation section. Card padding should be a minimum of 32px to maintain the sense of "space."

### Icons
<!-- 图标组件 — 细线风格（1px-1.5px 描边），优雅有机形态，避免尖锐直角 -->
Icons must be thin-line (1px or 1.5px stroke), elegant, and organic. Avoid sharp 90-degree corners in iconography; use rounded caps and joins to match the UI's softness.

### Input Fields
<!-- 输入框组件 — 极简风格，仅底部边框（水墨风格）或浅填充背景 + 12px 圆角 -->
Inputs are minimal, featuring only a bottom border (ink-wash style) or a very light soft-filled background with 12px rounded corners. The focus state should be indicated by a soft glow in the current "Mood Accent" color.

### Mood Selector
<!-- 情绪选择器组件 — 自定义有机形态气泡，缓慢脉动并切换颜色，用于改变 UI 强调色 -->
A custom component featuring organic, blob-like shapes that slowly pulsate and shift color. These shapes act as the interactive triggers for changing the UI's accent color palette.
