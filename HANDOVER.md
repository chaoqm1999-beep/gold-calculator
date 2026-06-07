# 黄金持仓盈亏计算器 - 任务交接文档

**交接时间：** 2026-06-01 22:37
**项目状态：** ✅ V3版本已完成，设计系统升级 + Supabase 云数据库已接入

---

## 📦 项目概况

### 项目名称
黄金持仓盈亏计算器（Gold Calculator）

### 项目位置
```
C:\Users\HUAWEI\.qclaw\workspace-agents\engineer\gold-calculator\
```

### 技术栈
- **前端框架：** React 19 + TypeScript
- **构建工具：** Vite 8
- **UI组件库：** Ant Design Mobile 5
- **图表库：** Recharts 3
- **数据库：** Supabase（PostgreSQL 云数据库）
- **设计系统：** Vercel 黑白极简风格
- **样式方案：** CSS Modules + CSS 变量设计令牌

---

## 🛠️ 使用的 Skills

### 1. `anthropic-frontend-design`
- **用途：** 加载 Anthropic 官方前端设计系统指导
- **触发原因：** 用户反馈"APP设计太丑，需要设计系统"
- **输出：** 提供了结构化设计智能（无障碍、UX 规则、栈指南）与美学哲学

### 2. `awesome-design-md`
- **用途：** 从 54 个知名网站设计系统中选择参考模板
- **安装位置：** `C:\Users\HUAWEI\.agents\skills\awesome-design-md\`
- **参考资料：** `references/vercel.md` — Vercel 设计系统
- **选择结果：** 用户在 Revolut / Stripe / Coinbase / Kraken / Vercel 中选择了 **Vercel 黑白极简风**
- **核心设计元素应用到项目中：**
  - Vercel 灰阶色板 (`#171717` ~ `#fafafa`)
  - Shadow-as-border 技法（`box-shadow: 0px 0px 0px 1px` 替代传统 border）
  - Geist 风格字体（Inter + 等宽）+ 负字间距压缩感
  - Mono 大写 pill badge 体系（BUY/SELL/LIVE）
  - 多层阴影堆叠 + 内发光 `#fafafa` 环

### 3. `find-skills`
- **用途：** 搜索设计系统相关的可用 Skill
- **触发原因：** 用户要求"去找找有没有设计系统的 SKILL"
- **输出：** 找到了 `awesome-design-md` 和 `canvas-design` 两个候选

---

## ✅ 已完成功能

### V1 基础功能
- ✅ 今日金价输入
- ✅ 持仓总览（总克重、均价成本、当前价值、总盈亏、盈亏率）
- ✅ 记录买入（日期、重量、金价、工费、备注）
- ✅ 卖出/置换（限仓检查、预估收入）
- ✅ 交易记录列表（支持删除）
- ✅ 数据持久化（LocalStorage）
- ✅ 导入/导出功能（JSON备份）

### V2 升级功能
- ✅ 双金价体系（实时买入价 / 实时卖出价）
- ✅ 金价趋势图表（Recharts，5个时间维度）
- ✅ 导航结构优化（5个底部Tab）

### V3 设计系统 + 云数据库（本次新增）
- ✅ **Vercel 黑白极简设计系统重构**
  - 集中化设计令牌 `theme.css`（颜色、间距、圆角、阴影、字体 CSS 变量）
  - 全局样式重置 `index.css`（Inter 字体、负字间距、暗色主题基底）
  - 所有组件样式重写（shadow-as-border、pill badge、黑白按钮）
  - 移除所有 emoji 图标，改用纯文字 + badge
  - 清理废弃文件（App.css、PriceInput.tsx）
  - 修复按钮文字颜色问题（黑底白字）

- ✅ **Supabase 云数据库接入**
  - 3 张数据表：`gold_records`、`gold_settings`、`gold_price_history`
  - RLS 行级安全策略（当前为公开访问，生产环境需改为用户认证）
  - `storage.ts` 全面异步化（localStorage → Supabase API）
  - Hooks 适配异步 API（`useRecords` / `useSettings`）
  - 导入/导出功能适配异步
  - 加载状态处理

---

## 📐 项目结构

```
gold-calculator/
├── src/
│   ├── components/              # UI组件
│   │   ├── PriceCard.tsx            # 双金价卡片（Vercel 风格）
│   │   ├── PriceCard.module.css
│   │   ├── PriceTrend.tsx           # 金价趋势图表
│   │   ├── PriceTrend.module.css
│   │   ├── HoldingsCard.tsx         # 持仓总览卡片
│   │   ├── HoldingsCard.module.css
│   │   ├── BuyForm.tsx              # 买入表单
│   │   ├── BuyForm.module.css
│   │   ├── SellForm.tsx             # 卖出表单
│   │   ├── SellForm.module.css
│   │   ├── RecordList.tsx           # 交易记录列表
│   │   ├── RecordList.module.css
│   │   ├── ImportExport.tsx         # 导入导出管理
│   │   └── ImportExport.module.css
│   │
│   ├── hooks/                   # 自定义Hooks
│   │   ├── useRecords.ts            # 交易记录管理（异步）
│   │   └── useSettings.ts           # 用户设置管理（异步）
│   │
│   ├── lib/                     # 第三方库封装
│   │   └── supabase.ts              # Supabase 客户端 🆕
│   │
│   ├── utils/                   # 工具函数
│   │   ├── storage.ts               # Supabase 数据操作（异步）🔄重写
│   │   └── calculator.ts            # 计算函数
│   │
│   ├── types/                   # TypeScript类型定义
│   │   └── index.ts                 # 数据类型
│   │
│   ├── App.tsx                  # 主应用（加载状态 + 异步操作）
│   ├── App.module.css           # 主应用样式（Vercel 风格）
│   ├── theme.css                # 设计令牌 🆕
│   ├── main.tsx                 # 入口文件
│   └── index.css                # 全局样式（Vercel 风格）
│
├── supabase/                    # Supabase 配置 🆕
│   └── migrations/
│       └── 001_init.sql             # 建表 SQL 迁移
│
├── .env                         # 环境变量（Supabase 凭证）🆕
├── dist/                        # 构建产物
├── docs/                        # 文档
├── index.html                   # HTML模板
├── package.json                 # 项目配置
├── vite.config.ts               # Vite配置
└── tsconfig.json                # TypeScript配置
```

---

## 🗄️ Supabase 数据库

### 连接信息
- **Project URL：** `https://ohcwwrtjuwvyatbgeaxz.supabase.co`
- **Anon Key：** 在 `.env` 文件中的 `VITE_SUPABASE_ANON_KEY`
- **个人访问令牌：** `sbp_` 前缀（仅用于 Management API）

### 数据表结构

#### 1. `gold_records` — 交易记录
| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT PK | 唯一ID |
| type | TEXT | 'buy' 或 'sell' |
| date | TEXT | 交易日期 YYYY-MM-DD |
| weight | NUMERIC | 克重（克） |
| price | NUMERIC | 金价（元/克） |
| labor_cost | NUMERIC | 工费（元） |
| total_cost | NUMERIC | 总花费 |
| note | TEXT | 备注 |
| created_at | TIMESTAMPTZ | 创建时间 |

#### 2. `gold_settings` — 全局设置（单行）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER PK | 固定为 1 |
| current_buy_price | NUMERIC | 当前买入价 |
| current_sell_price | NUMERIC | 当前卖出价 |
| currency | TEXT | 货币（CNY） |
| updated_at | TIMESTAMPTZ | 更新时间 |

#### 3. `gold_price_history` — 金价历史
| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT PK | 唯一ID |
| date | TEXT | 记录时间 |
| buy_price | NUMERIC | 买入价 |
| sell_price | NUMERIC | 卖出价 |
| source | TEXT | 'manual' 或 'api' |
| created_at | TIMESTAMPTZ | 创建时间 |

### RLS 策略
- 当前所有表均为公开访问（`USING (true) WITH CHECK (true)`）
- **生产环境必须改为基于用户认证的策略**

### 索引
- `idx_gold_records_date` — 交易记录按日期降序
- `idx_gold_price_history_date` — 金价历史按日期降序

---

## 🎨 设计系统（Vercel 黑白极简风）

### 设计令牌（`src/theme.css`）
- **色板：** Vercel 灰阶 `#171717` ~ `#fafafa`
- **语义色：** 金色（买入/badge）、红色（盈利）、绿色（亏损）
- **圆角：** `--radius-sm: 6px` / `--radius-md: 12px` / `--radius-pill: 9999px`
- **阴影：** shadow-as-border（`0px 0px 0px 1px rgba(0,0,0,0.06)`）
- **字体：** Inter（UI）+ 等宽（badge/数字），负字间距

### 关键设计技法
1. **Shadow-as-border** — 用 `box-shadow` 替代 `border`，视觉更精致
2. **Pill badge** — Mono 大写文字 + 小圆角背景（BUY/SELL/LIVE）
3. **多层阴影** — 卡片使用 3 层阴影堆叠 + 内发光 `#fafafa`
4. **黑白按钮** — 主按钮 `#171717` 底 + 白字，统一视觉
5. **金融语义色** — 金色用于买入/金价，红绿用于盈亏

---

## 🔧 核心业务逻辑

### 数据流（Supabase 版）
```
用户操作 → Hook（useRecords/useSettings）
         → storage.ts（异步函数）
         → supabase.ts（Supabase 客户端）
         → Supabase PostgreSQL
```

### 金价更新流程
```typescript
handlePriceUpdate = async (buyPrice, sellPrice) => {
  // 1. 保存到 gold_settings 表
  await updatePrices(buyPrice, sellPrice);
  // 2. 插入到 gold_price_history 表
  await addPriceHistory({ date, buyPrice, sellPrice, source: 'manual' });
}
```

### 持仓计算逻辑
```typescript
// 总克重 = 买入总量 - 卖出总量
const totalWeight = buyTotal - sellTotal;
// 均价成本 = 总花费 / 总克重
const avgCost = totalCost / totalWeight;
// 当前价值 = 当前卖出价 × 总克重
const currentValue = currentSellPrice * totalWeight;
// 盈亏 = 当前价值 - 总花费
const profit = currentValue - totalCost;
```

---

## 🚀 使用方式

### 开发预览
```bash
cd C:\Users\HUAWEI\.qclaw\workspace-agents\engineer\gold-calculator
npm run dev
```
访问：http://localhost:5173

### 生产构建
```bash
npm run build
```

### 环境变量
在 `.env` 文件中配置：
```
VITE_SUPABASE_URL=https://ohcwwrtjuwvyatbgeaxz.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

---

## ⚠️ 注意事项

### 1. Supabase 安全
- ⚠️ RLS 当前为公开访问，**任何人都可读写数据**
- 生产环境必须接入用户认证，修改 RLS 策略
- `.env` 中的 key 不要提交到 Git

### 2. React 版本兼容
- `antd-mobile` v5 官方支持 React 16~18，当前使用 React 19
- 会出现 `unmountComponentAtNode is not a function` 等警告
- 部分组件（如 Dialog）可能因兼容性问题导致功能异常
- **建议：** 降级 React 至 18.x，或等待 antd-mobile 适配 React 19

### 3. 数据迁移
- 旧版 localStorage 数据需手动迁移到 Supabase
- 可通过导出 → 导入流程迁移：先从旧版导出 JSON，再在新版导入

### 4. 构建体积
- recharts 库较大，建议使用动态导入 code-splitting

---

## 📊 测试清单

### 功能测试
- [x] 双金价输入和展示
- [x] 金价历史记录自动保存到 Supabase
- [x] 趋势图表5个时间维度切换
- [x] 买入记录功能（Supabase 异步存储）
- [x] 卖出记录功能（限仓检查）
- [x] 交易记录删除（Supabase 异步删除）
- [x] 数据导入/导出（异步）
- [x] 移动端适配
- [x] 盈亏计算准确性
- [x] 设计系统一致性（Vercel 风格）
- [x] 按钮文字可见性（黑底白字）
- [ ] React 19 兼容性（Dialog 等组件）

---

## 📈 后续优化建议

### 紧急
1. **降级 React 至 18.x** — 解决 antd-mobile 兼容性问题
2. **接入用户认证** — Supabase Auth，修改 RLS 策略
3. **.env 加入 .gitignore** — 防止密钥泄露

### 功能扩展
1. 接入第三方金价 API（上海黄金交易所）
2. 金价预警推送通知
3. 数据统计（月度/年度）
4. 图表增强（K线图、技术指标）

### 性能优化
1. recharts code-splitting
2. 历史数据分页加载
3. PWA 离线支持

---

## 🎯 交接要点

### 核心文件（需重点查看）
1. `src/theme.css` — 设计令牌（所有颜色、间距、阴影变量）
2. `src/lib/supabase.ts` — Supabase 客户端
3. `src/utils/storage.ts` — 所有数据库操作（异步）
4. `src/App.tsx` — 主应用入口（加载状态 + 异步流程）
5. `src/types/index.ts` — 数据类型定义

### 关键决策
1. **设计系统：** 用户选择 Vercel 黑白极简风，金融语义色（金色=买入、红=盈利、绿=亏损）
2. **数据库：** 从 localStorage 迁移到 Supabase，所有操作异步化
3. **React 版本：** 当前使用 React 19，与 antd-mobile v5 存在兼容性问题，建议降级

### 待解决问题
- [ ] React 19 与 antd-mobile 兼容性问题（Dialog、Toast 等）
- [ ] Supabase RLS 策略（当前公开访问）
- [ ] 接入用户认证
- [ ] 优化构建体积（code-splitting）
- [ ] 添加单元测试

---

**祝交接顺利！**
