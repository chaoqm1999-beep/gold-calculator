// 交易记录类型
export interface GoldRecord {
  id: string;              // 唯一ID
  type: 'buy' | 'sell';    // 买入/卖出
  date: string;            // 交易日期 YYYY-MM-DD
  weight: number;          // 克重（克）
  price: number;           // 金价（元/克）
  laborCost: number;       // 工费（元）
  totalCost: number;       // 总花费（自动计算）
  note?: string;           // 备注
}

// 金价记录（新增）
export interface PriceRecord {
  id: string;
  date: string;            // YYYY-MM-DD HH:mm
  buyPrice: number;        // 买入价
  sellPrice: number;       // 卖出价
  source: 'manual' | 'api'; // 来源
}

// 用户设置
export interface Settings {
  currentBuyPrice: number;   // 当前买入价
  currentSellPrice: number;  // 当前卖出价
  currency: 'CNY';
  priceHistory: PriceRecord[]; // 历史金价
}

// 持仓信息
export interface Holdings {
  totalWeight: number;     // 总克重
  avgCost: number;         // 均价成本
  totalCost: number;       // 总花费
  currentValue: number;    // 当前价值
  profit: number;          // 持仓盈亏金额
  profitRate: number;      // 持仓盈亏率
  todayProfit: number;     // 今日收益金额
  todayProfitRate: number; // 今日收益率
}

// 趋势时间范围
export type TrendRange = 'realtime' | '1month' | '3months' | '6months' | '1year';
