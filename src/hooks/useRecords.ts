import { useState, useEffect, useCallback } from 'react';
import type { GoldRecord } from '../types';
import { getRecords, addRecord as storageAdd, deleteRecord as storageDelete } from '../utils/storage';
import { v4 as uuidv4 } from 'uuid';

export function useRecords() {
  const [records, setRecords] = useState<GoldRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // 初始化加载
  useEffect(() => {
    getRecords().then((data) => {
      setRecords(data);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, []);

  // 添加记录
  const addRecord = useCallback(async (record: Omit<GoldRecord, 'id' | 'totalCost'>) => {
    const totalCost = record.type === 'buy'
      ? record.weight * record.price + record.laborCost
      : record.weight * record.price;

    const newRecord: GoldRecord = {
      ...record,
      id: uuidv4(),
      totalCost
    };

    await storageAdd(newRecord);
    setRecords(prev => [newRecord, ...prev]);
  }, []);

  // 删除记录
  const deleteRecord = useCallback(async (id: string) => {
    await storageDelete(id);
    setRecords(prev => prev.filter(r => r.id !== id));
  }, []);

  return {
    records,
    loading,
    addRecord,
    deleteRecord
  };
}
