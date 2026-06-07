import type { GoldRecord, Holdings, PriceRecord } from '../types';

// 计算今日收益（基于最近两次金价记录变化 × 持仓克重）
export function calculateTodayProfit(
  currentSellPrice: number,
  totalWeight: number,
  totalCost: number,
  priceHistory: PriceRecord[]
): { todayProfit: number; todayProfitRate: number } {
  if (priceHistory.length < 2 || totalWeight <= 0) {
    return { todayProfit: 0, todayProfitRate: 0 };
  }

  // 按时间降序排列，找上一次记录
  const sorted = [...priceHistory].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // 第一条是当前记录，第二条是上一次记录
  const previousSellPrice = sorted[1].sellPrice;

  // 今日收益 = (当前卖出价 - 上一次卖出价) × 总持仓克重
  const todayProfit = (currentSellPrice - previousSellPrice) * totalWeight;
  const todayProfitRate = totalCost > 0 ? (todayProfit / totalCost) * 100 : 0;

  return { todayProfit, todayProfitRate };
}

// 求和辅助函数
function sum(records: GoldRecord[], field: keyof GoldRecord): number {
  return records.reduce((acc, record) => acc + (Number(record[field]) || 0), 0);
}

// 计算持仓总览（使用卖出价计算当前价值）
export function calculateHoldings(
  records: GoldRecord[],
  currentSellPrice: number,
  priceHistory: PriceRecord[] = []
): Holdings {
  const buyRecords = records.filter(r => r.type === 'buy');
  const sellRecords = records.filter(r => r.type === 'sell');

  // 总克重 = 买入总量 - 卖出总量
  const totalWeight = sum(buyRecords, 'weight') - sum(sellRecords, 'weight');

  // 总花费 = 买入总花费 - 卖出回款
  const buyTotalCost = sum(buyRecords, 'totalCost');
  const sellIncome = sellRecords.reduce((acc, r) => acc + r.weight * r.price, 0);
  const totalCost = buyTotalCost - sellIncome;

  // 均价成本 = 总花费 / 总克重
  const avgCost = totalWeight > 0 ? totalCost / totalWeight : 0;

  // 当前价值 = 当前卖出价 × 总克重
  const currentValue = currentSellPrice * totalWeight;

  // 盈亏 = 当前价值 - 总花费
  const profit = currentValue - totalCost;

  // 盈亏率 = 盈亏 / 总花费 × 100%
  const profitRate = totalCost > 0 ? (profit / totalCost) * 100 : 0;

  // 今日收益
  const { todayProfit, todayProfitRate } = calculateTodayProfit(
    currentSellPrice, totalWeight, totalCost, priceHistory
  );

  return {
    totalWeight,
    avgCost,
    totalCost,
    currentValue,
    profit,
    profitRate,
    todayProfit,
    todayProfitRate,
  };
}

// 计算单笔交易总花费
export function calculateTotalCost(
  weight: number,
  price: number,
  laborCost: number = 0
): number {
  return weight * price + laborCost;
}

// 格式化金额
export function formatMoney(amount: number): string {
  return amount.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// 格式化克重
export function formatWeight(weight: number): string {
  return weight.toFixed(2);
}

// 格式化百分比
export function formatPercent(rate: number): string {
  const sign = rate >= 0 ? '+' : '';
  return `${sign}${rate.toFixed(2)}%`;
}

// 计算金价变化
export function calculatePriceChange(
  current: number,
  previous: number
): { change: number; percent: number } {
  const change = current - previous;
  const percent = previous > 0 ? (change / previous) * 100 : 0;
  return { change, percent };
}

// 准备图表数据
export function prepareChartData(priceHistory: PriceRecord[]) {
  return priceHistory
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(record => ({
      date: new Date(record.date).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }),
      buyPrice: record.buyPrice,
      sellPrice: record.sellPrice
    }));
}
