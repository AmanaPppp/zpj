# Lumina — 技术规范

## 依赖

| 包名 | 版本 | 用途 |
|------|------|------|
| lucide-react | latest | Lucide 图标（功能卡片内嵌图形） |
| iconify-icon | ^1.0.7 | Iconify Web Component（Solar 图标集） |

## 组件清单

### 布局

| 组件 | 来源 | 说明 |
|------|------|------|
| Navbar | 自建 | 固定导航栏，含 AnimatedCTAButton |
| BackgroundEffects | 自建 | 固定光晕效果层 |

### 区域组件 (Sections)

| 组件 | 来源 | 说明 |
|------|------|------|
| HeroSection | 自建 | 两栏布局 + 浮动图片集群 |
| FeaturesSection | 自建 | 6 张功能卡片网格 |
| DashboardSection | 自建 | 完整仪表盘预览 |
| PricingSection | 自建 | 定价卡片 + 对比表格 |

### 可复用组件

| 组件 | 来源 | 说明 |
|------|------|------|
| AnimatedCTAButton | 自建 | 文字滑动 Hover 效果按钮（导航 + Dashboard 用） |
| GlassCard | 自建 | 玻璃态卡片容器 |
| FeatureCard | 自建 | 功能卡片（图形区域 + 文字区域） |
| ScrollReveal | 自建 | IntersectionObserver 滚动触发包装器 |

### 内嵌动画组件（功能卡片图形区）

| 组件 | 来源 | 说明 |
|------|------|------|
| Soc2Graphic | 自建 | SOC 2 合规 - 背景图 |
| SsoGraphic | 自建 | SSO 路由动画 - 登录框 + 路由点 + IDP 面板 |
| PermissionsGraphic | 自建 | 权限矩阵 - 浮动表格 + 行高亮 |
| RoleAccessGraphic | 自建 | 角色标签 - 用户卡片 + 弹出标签 |
| WorkspaceGraphic | 自建 | 工作区切换 - 下拉菜单动画 |
| OnPremiseGraphic | 自建 | 终端部署 - 命令行界面 + 进度条 |

## 动画实现方案

| 动画 | 实现方式 | 复杂度 |
|------|----------|--------|
| 滚动淡入 (animationIn) | CSS @keyframes + IntersectionObserver（原生 JS） | Low |
| 背景光晕 | 纯 CSS，固定定位元素 | Low |
| 图片集群 Hover | CSS transition（scale + z-index） | Low |
| CTA 按钮文字滑动 | CSS transition（translateY + opacity + blur） | Medium |
| SSO 路由点 | CSS @keyframes (routeDot) | Low |
| SSO IDP 滑入 | CSS @keyframes (slideIDP) | Low |
| 权限矩阵行高亮 | CSS @keyframes (highlightRow)，三行不同 delay | Low |
| 权限矩阵浮动 | CSS @keyframes (floatY) | Low |
| 角色标签弹出 | CSS @keyframes (popTag) + cubic-bezier 弹性 | Low |
| 工作区下拉 | CSS @keyframes (menuDropdown) | Low |
| 终端进度条 | CSS @keyframes (loadBarLoop) | Low |
| 终端文字淡入 | CSS @keyframes (fadeInOut) | Low |

## 关键决策

### 图标系统双轨制
- **Iconify Web Component**：用于 solar 图标集（导航、Hero、Dashboard 中的图标）
- **Lucide React**：用于功能卡片内嵌图形（数据表格、终端界面中的图标）

原因：原网站同时使用两套图标系统，需保持一致。

### 滚动动画实现
不使用 GSAP，直接使用原生 IntersectionObserver + CSS animation-play-state 控制。
原因：原网站已实现此方案，效果简单直接，无需额外库。

### UnicornStudio 背景
原网站使用 UnicornStudio 动态背景。由于无法直接复用，使用 CSS 渐变光晕效果替代，保持视觉氛围。

### 内嵌动画全部使用 CSS @keyframes
所有功能卡片的微动画均通过内联 CSS @keyframes 实现，不使用任何动画库。
