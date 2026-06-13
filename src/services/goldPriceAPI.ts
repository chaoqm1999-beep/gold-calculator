/**
 * 实时金价 API 服务
 * 数据来源：https://api.ruseo.cn/api/goldprice（免费，无需 API Key）
 *
 * 返回数据包含：
 * - bank_gold_bar_price：银行投资金条价格（买入参考价）
 * - gold_recycle_price：黄金回收价格（卖出参考价）
 * - precious_metal_price：品牌金店价格
 *
 * 缓存策略：localStorage 缓存 30 分钟，避免频繁请求
 */

const API_URL = 'https://api.ruseo.cn/api/goldprice';
const CACHE_KEY = 'gold_price_cache';
const CACHE_DURATION_MS = 30 * 60 * 1000; // 30 分钟

export interface BankGoldBarPrice {
  bank: string;
  price: string; // 元/克
}

export interface GoldRecyclePrice {
  gold_type: string;
  recycle_price: string; // 元/克
  updated_date: string; // YYYY-MM-DD
}

export interface BrandGoldPrice {
  brand: string;
  bullion_price: string;
  gold_price: string;
  platinum_price: string;
  updated_date: string;
}

export interface GoldPriceData {
  bankGoldBarPrices: BankGoldBarPrice[];
  goldRecyclePrices: GoldRecyclePrice[];
  brandPrices: BrandGoldPrice[];
  /** 银行投资金条均价（元/克），作为买入参考价 */
  avgBankGoldBarPrice: number;
  /** 24K金回收价（元/克），作为卖出参考价 */
  recyclePrice24K: number;
  /** 数据更新时间 */
  updatedAt: string;
}

interface CacheEntry {
  data: GoldPriceData;
  timestamp: number;
}

/**
 * 从 API 获取原始数据
 */
async function fetchRawData() {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error(`金价 API 请求失败: ${response.status}`);
  }

  const json = await response.json();

  // 兼容两种响应格式
  const payload = json.data ?? json;
  if (!payload) {
    throw new Error('金价 API 返回数据为空');
  }

  return payload;
}

/**
 * 从原始 JSON 中提取并转换数据
 */
function parseGoldPriceData(raw: Record<string, unknown>): GoldPriceData {
  const bankGoldBarPrices: BankGoldBarPrice[] = (
    raw.bank_gold_bar_price as Array<{ bank: string; price: string }> | undefined
  )?.map(item => ({
    bank: item.bank,
    price: item.price,
  })) ?? [];

  const goldRecyclePrices: GoldRecyclePrice[] = (
    raw.gold_recycle_price as Array<{
      gold_type: string;
      recycle_price: string;
      updated_date: string;
    }> | undefined
  )?.map(item => ({
    gold_type: item.gold_type,
    recycle_price: item.recycle_price,
    updated_date: item.updated_date,
  })) ?? [];

  const brandPrices: BrandGoldPrice[] = (
    raw.precious_metal_price as Array<{
      brand: string;
      bullion_price: string;
      gold_price: string;
      platinum_price: string;
      updated_date: string;
    }> | undefined
  )?.map(item => ({
    brand: item.brand,
    bullion_price: item.bullion_price,
    gold_price: item.gold_price,
    platinum_price: item.platinum_price,
    updated_date: item.updated_date,
  })) ?? [];

  // 银行金条均价（买入参考价）
  const avgBankGoldBarPrice =
    bankGoldBarPrices.length > 0
      ? Number(
          (
            bankGoldBarPrices.reduce((sum, item) => {
              const p = parseFloat(item.price);
              return isNaN(p) ? sum : sum + p;
            }, 0) / bankGoldBarPrices.length
          ).toFixed(2)
        )
      : 0;

  // 24K金回收价（卖出参考价）
  const recycle24K = goldRecyclePrices.find(
    item => item.gold_type === '24K金回收' || item.gold_type.includes('24K')
  );
  const recyclePrice24K = recycle24K ? parseFloat(recycle24K.recycle_price) || 0 : 0;

  const latestDate =
    goldRecyclePrices.length > 0
      ? goldRecyclePrices[0].updated_date
      : new Date().toISOString().split('T')[0];

  return {
    bankGoldBarPrices,
    goldRecyclePrices,
    brandPrices,
    avgBankGoldBarPrice,
    recyclePrice24K,
    updatedAt: latestDate,
  };
}

/**
 * 获取实时金价（带缓存）
 *
 * 优先级：localStorage 缓存（30分钟） > 远程 API
 */
export async function getGoldPrice(forceRefresh = false): Promise<GoldPriceData> {
  // 检查缓存
  if (!forceRefresh) {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const entry: CacheEntry = JSON.parse(cached);
        if (Date.now() - entry.timestamp < CACHE_DURATION_MS) {
          return entry.data;
        }
      }
    } catch {
      // 缓存解析失败，忽略
    }
  }

  // 请求远程
  const raw = await fetchRawData();
  const data = parseGoldPriceData(raw);

  // 写入缓存
  try {
    const entry: CacheEntry = { data, timestamp: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    // localStorage 写入失败，忽略
  }

  return data;
}

/**
 * 获取买入参考价（银行金条均价）
 */
export async function getSuggestBuyPrice(): Promise<number> {
  const data = await getGoldPrice();
  return data.avgBankGoldBarPrice;
}

/**
 * 获取卖出参考价（24K金回收价）
 */
export async function getSuggestSellPrice(): Promise<number> {
  const data = await getGoldPrice();
  return data.recyclePrice24K;
}
