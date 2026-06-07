import { supabase } from '../lib/supabase';
import type { GoldRecord, Settings, PriceRecord } from '../types';

// ========== 交易记录 ==========

// 获取交易记录
export async function getRecords(): Promise<GoldRecord[]> {
  const { data, error } = await supabase
    .from('gold_records')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    console.error('读取交易记录失败:', error);
    return [];
  }

  return (data || []).map(mapRecordFromDb);
}

// 保存交易记录（全量覆盖，用于导入）
export async function saveRecords(records: GoldRecord[]): Promise<void> {
  // 先清空再插入
  const { error: deleteError } = await supabase
    .from('gold_records')
    .delete()
    .neq('id', ''); // 删除所有行

  if (deleteError) {
    console.error('清空交易记录失败:', deleteError);
    throw new Error('保存失败');
  }

  if (records.length === 0) return;

  const rows = records.map(mapRecordToDb);
  const { error: insertError } = await supabase
    .from('gold_records')
    .insert(rows);

  if (insertError) {
    console.error('保存交易记录失败:', insertError);
    throw new Error('保存失败');
  }
}

// 添加单条记录
export async function addRecord(record: GoldRecord): Promise<void> {
  const row = mapRecordToDb(record);
  const { error } = await supabase
    .from('gold_records')
    .insert(row);

  if (error) {
    console.error('添加记录失败:', error);
    throw new Error('添加失败');
  }
}

// 删除记录
export async function deleteRecord(id: string): Promise<void> {
  const { error } = await supabase
    .from('gold_records')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('删除记录失败:', error);
    throw new Error('删除失败');
  }
}

// ========== 设置 ==========

// 获取设置
export async function getSettings(): Promise<Settings> {
  const [settingsRes, historyRes] = await Promise.all([
    supabase.from('gold_settings').select('*').eq('id', 1).single(),
    supabase.from('gold_price_history').select('*').order('date', { ascending: false }),
  ]);

  if (settingsRes.error) {
    console.error('读取设置失败:', settingsRes.error);
    return { currentBuyPrice: 0, currentSellPrice: 0, currency: 'CNY', priceHistory: [] };
  }

  const priceHistory: PriceRecord[] = (historyRes.data || []).map(mapPriceFromDb);

  return {
    currentBuyPrice: Number(settingsRes.data.current_buy_price) || 0,
    currentSellPrice: Number(settingsRes.data.current_sell_price) || 0,
    currency: (settingsRes.data.currency as 'CNY') || 'CNY',
    priceHistory,
  };
}

// 保存设置
export async function saveSettings(settings: Settings): Promise<void> {
  const { error } = await supabase
    .from('gold_settings')
    .upsert({
      id: 1,
      current_buy_price: settings.currentBuyPrice,
      current_sell_price: settings.currentSellPrice,
      currency: settings.currency,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    console.error('保存设置失败:', error);
    throw new Error('保存失败');
  }
}

// 添加金价记录
export async function addPriceRecord(record: PriceRecord): Promise<void> {
  const { error } = await supabase
    .from('gold_price_history')
    .insert({
      id: record.id,
      date: record.date,
      buy_price: record.buyPrice,
      sell_price: record.sellPrice,
      source: record.source,
    });

  if (error) {
    console.error('添加金价记录失败:', error);
    throw new Error('添加金价记录失败');
  }
}

// ========== 工具函数 ==========

// 导出数据为JSON
export async function exportData(): Promise<string> {
  const [records, settings] = await Promise.all([getRecords(), getSettings()]);
  return JSON.stringify({ records, settings, exportTime: new Date().toISOString() }, null, 2);
}

// 导入数据
export async function importData(jsonStr: string): Promise<void> {
  try {
    const data = JSON.parse(jsonStr);
    if (data.records && Array.isArray(data.records)) {
      await saveRecords(data.records);
    }
    if (data.settings) {
      // 先保存设置
      await saveSettings({
        currentBuyPrice: data.settings.currentBuyPrice ?? 0,
        currentSellPrice: data.settings.currentSellPrice ?? 0,
        currency: data.settings.currency ?? 'CNY',
        priceHistory: [],
      });
      // 再保存价格历史
      if (data.settings.priceHistory && Array.isArray(data.settings.priceHistory)) {
        for (const record of data.settings.priceHistory) {
          await addPriceRecord(record);
        }
      }
    }
  } catch (error) {
    console.error('导入数据失败:', error);
    throw new Error('导入失败，请检查文件格式是否正确');
  }
}

// 获取历史金价（按时间范围过滤）
export function getPriceHistoryByRange(
  history: PriceRecord[],
  range: 'realtime' | '1month' | '3months' | '6months' | '1year'
): PriceRecord[] {
  const now = new Date();
  const ranges = {
    realtime: 1,
    '1month': 30,
    '3months': 90,
    '6months': 180,
    '1year': 365,
  };

  const days = ranges[range];
  const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  return history.filter((record) => {
    const recordDate = new Date(record.date);
    return recordDate >= cutoff;
  });
}

// ========== 数据库映射 ==========

function mapRecordToDb(record: GoldRecord) {
  return {
    id: record.id,
    type: record.type,
    date: record.date,
    weight: record.weight,
    price: record.price,
    labor_cost: record.laborCost,
    total_cost: record.totalCost,
    note: record.note || null,
  };
}

function mapRecordFromDb(row: Record<string, unknown>): GoldRecord {
  return {
    id: row.id as string,
    type: row.type as 'buy' | 'sell',
    date: row.date as string,
    weight: Number(row.weight),
    price: Number(row.price),
    laborCost: Number(row.labor_cost),
    totalCost: Number(row.total_cost),
    note: (row.note as string) || undefined,
  };
}

function mapPriceFromDb(row: Record<string, unknown>): PriceRecord {
  return {
    id: row.id as string,
    date: row.date as string,
    buyPrice: Number(row.buy_price),
    sellPrice: Number(row.sell_price),
    source: row.source as 'manual' | 'api',
  };
}
