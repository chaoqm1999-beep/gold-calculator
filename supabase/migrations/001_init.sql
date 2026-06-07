-- Gold Calculator 数据库建表 SQL
-- 在 Supabase Dashboard → SQL Editor 中执行

-- 1. 交易记录表
CREATE TABLE IF NOT EXISTS gold_records (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('buy', 'sell')),
  date TEXT NOT NULL,
  weight NUMERIC NOT NULL,
  price NUMERIC NOT NULL,
  labor_cost NUMERIC NOT NULL DEFAULT 0,
  total_cost NUMERIC NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. 金价设置表（单行记录）
CREATE TABLE IF NOT EXISTS gold_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  current_buy_price NUMERIC NOT NULL DEFAULT 0,
  current_sell_price NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'CNY',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. 金价历史表
CREATE TABLE IF NOT EXISTS gold_price_history (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  buy_price NUMERIC NOT NULL,
  sell_price NUMERIC NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('manual', 'api')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 初始化设置单行（如果不存在）
INSERT INTO gold_settings (id, current_buy_price, current_sell_price, currency)
VALUES (1, 0, 0, 'CNY')
ON CONFLICT (id) DO NOTHING;

-- 4. 开启 RLS（行级安全）
ALTER TABLE gold_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE gold_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE gold_price_history ENABLE ROW LEVEL SECURITY;

-- 5. 公开访问策略（当前无用户认证，允许全部操作）
-- 生产环境应改为基于用户认证的策略
CREATE POLICY "Allow all on gold_records" ON gold_records FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on gold_settings" ON gold_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on gold_price_history" ON gold_price_history FOR ALL USING (true) WITH CHECK (true);

-- 6. 索引优化
CREATE INDEX IF NOT EXISTS idx_gold_records_date ON gold_records(date DESC);
CREATE INDEX IF NOT EXISTS idx_gold_price_history_date ON gold_price_history(date DESC);
