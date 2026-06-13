# Changelog

本文件记录 Gold Calculator 黄金持仓盈亏计算器的所有重要变更。

## [0.2.0] — 2026-06-13

### 新增

- **实时金价 API 集成** — 接入 ruseo.cn 免费金价接口，价格卡片直接展示实时银行金条价、回收价、品牌金价，支持手动刷新，localStorage 30 分钟缓存
- **PIN 访问控制** — 前端门控机制，默认 PIN `888888`，深色玻璃拟态解锁界面，sessionStorage 缓存登录态
- **安全 HTTP 头** — vercel.json 配置 X-Content-Type-Options / X-Frame-Options / XSS-Protection / HSTS / CSP
- **Vercel 一键部署** — 自动构建 + 环境变量注入 + 安全头策略

### 修复

- 买入/卖出表单日期选择器点击无弹窗问题（改用 visible state 控制）

### 变更

- 移除独立"市场参考价"区域，价格直接融入金价趋势卡片
- `.gitignore` 新增 `docs/` 排除，已追踪 docs 文件从仓库移除
- 买入/卖出表单新增参考提示（suggestedPrice prop）

### 部署

- 生产地址：`https://gold-calculator-inky.vercel.app`
- 分支策略：`main`（稳定）← `v0.2`（开发）

## [0.1.0] — 2026-06-07

### 新增

- **持仓总览卡片** — 重构为首位展示，大字体突出持仓金额，小字显示克重 / 成本均价摘要，横向布局今日收益、持仓收益、总投入三项指标
- **金价趋势卡片** — 集成实时买入价 / 卖出价显示，涨跌额 / 涨跌幅标注（红色涨、绿色跌，中国金融惯例），底部提供实时 / 1月 / 3月 / 半年 / 1年时间维度切换
- **今日收益计算** — 基于最近两次金价记录变化 × 持仓克重自动计算今日收益金额及收益率
- **Supabase 云数据库** — 接入 gold_records、gold_settings、gold_price_history 三张数据表，交易记录云端持久化
- **设计系统** — Vercel 黑白极简风，shadow-as-border、Pill badge、多层阴影，金融语义色（金色 = 买入、红色 = 盈利、绿色 = 亏损）

### 变更

- 首页组件顺序：持仓总览 → 金价趋势（原顺序相反）
- 移除独立 PriceCard 组件，功能合并至 PriceTrend
- `calculateHoldings` 函数新增 `priceHistory` 参数，集成今日收益计算

### 技术栈

- Vite 8 + React 19 + TypeScript 6
- antd-mobile 5.x（UI 组件库）
- Recharts（图表可视化）
- Supabase（云数据库）
- CSS Modules + CSS 变量（样式方案）
