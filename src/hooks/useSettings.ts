import { useState, useEffect, useCallback } from 'react';
import type { Settings, PriceRecord } from '../types';
import { getSettings, saveSettings, addPriceRecord as addPrice } from '../utils/storage';

export function useSettings() {
  const [settings, setSettings] = useState<Settings>({
    currentBuyPrice: 0,
    currentSellPrice: 0,
    currency: 'CNY',
    priceHistory: []
  });
  const [loading, setLoading] = useState(true);

  // 初始化加载
  useEffect(() => {
    getSettings().then((data) => {
      setSettings(data);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, []);

  // 更新买入价
  const updateBuyPrice = useCallback(async (price: number) => {
    const newSettings = { ...settings, currentBuyPrice: price };
    await saveSettings(newSettings);
    setSettings(newSettings);
  }, [settings]);

  // 更新卖出价
  const updateSellPrice = useCallback(async (price: number) => {
    const newSettings = { ...settings, currentSellPrice: price };
    await saveSettings(newSettings);
    setSettings(newSettings);
  }, [settings]);

  // 同时更新买卖价
  const updatePrices = useCallback(async (buyPrice: number, sellPrice: number) => {
    const newSettings = { ...settings, currentBuyPrice: buyPrice, currentSellPrice: sellPrice };
    await saveSettings(newSettings);
    setSettings(newSettings);
  }, [settings]);

  // 添加历史金价记录
  const addPriceHistory = useCallback(async (record: Omit<PriceRecord, 'id'>) => {
    const newRecord: PriceRecord = {
      ...record,
      id: Date.now().toString()
    };
    await addPrice(newRecord);
    setSettings(prev => ({
      ...prev,
      priceHistory: [newRecord, ...prev.priceHistory]
    }));
  }, []);

  return {
    currentBuyPrice: settings.currentBuyPrice,
    currentSellPrice: settings.currentSellPrice,
    priceHistory: settings.priceHistory,
    loading,
    updateBuyPrice,
    updateSellPrice,
    updatePrices,
    addPriceHistory
  };
}
