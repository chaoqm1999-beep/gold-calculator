import { useMemo, useState, useEffect } from 'react';
import { TabBar, Toast } from 'antd-mobile';
import {
  AppOutline,
  AddCircleOutline,
  MinusCircleOutline,
  UnorderedListOutline,
  SetOutline,
} from 'antd-mobile-icons';
import { PriceTrend } from './components/PriceTrend';
import { HoldingsCard } from './components/HoldingsCard';
import { BuyForm } from './components/BuyForm';
import { SellForm } from './components/SellForm';
import { RecordList } from './components/RecordList';
import { ImportExport } from './components/ImportExport';
import { useRecords } from './hooks/useRecords';
import { useSettings } from './hooks/useSettings';
import { calculateHoldings } from './utils/calculator';
import { getGoldPrice, type GoldPriceData } from './services/goldPriceAPI';
import styles from './App.module.css';

function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const { records, loading: recordsLoading, addRecord, deleteRecord } = useRecords();
  const {
    currentBuyPrice,
    currentSellPrice,
    priceHistory,
    loading: settingsLoading,
    updatePrices,
    addPriceHistory,
  } = useSettings();

  // 实时金价 API 数据（用于买入/卖出表单的价格建议）
  const [realtimeGold, setRealtimeGold] = useState<GoldPriceData | null>(null);
  const [goldPriceLoading, setGoldPriceLoading] = useState(false);

  // 加载并写入实时金价
  const fetchAndUpdateGoldPrice = async (silent = false) => {
    setGoldPriceLoading(true);
    try {
      const data = await getGoldPrice(!silent); // silent 时用缓存，否则强制刷新
      setRealtimeGold(data);

      if (data.avgBankGoldBarPrice > 0 && data.recyclePrice24K > 0) {
        await updatePrices(data.avgBankGoldBarPrice, data.recyclePrice24K);
        await addPriceHistory({
          date: new Date().toISOString(),
          buyPrice: data.avgBankGoldBarPrice,
          sellPrice: data.recyclePrice24K,
          source: 'api',
        });
        if (!silent) {
          Toast.show({ content: '金价已刷新', icon: 'success' });
        }
      }
    } catch {
      if (!silent) {
        Toast.show({ content: '获取金价失败，请稍后重试', icon: 'fail' });
      }
    } finally {
      setGoldPriceLoading(false);
    }
  };

  // 首次加载：自动获取并写入实时金价
  useEffect(() => {
    fetchAndUpdateGoldPrice(true);
  }, []);

  const holdings = useMemo(
    () => calculateHoldings(records, currentSellPrice, priceHistory),
    [records, currentSellPrice, priceHistory]
  );

  const availableWeight = useMemo(() => {
    const buyTotal = records
      .filter(r => r.type === 'buy')
      .reduce((sum, r) => sum + r.weight, 0);
    const sellTotal = records
      .filter(r => r.type === 'sell')
      .reduce((sum, r) => sum + r.weight, 0);
    return buyTotal - sellTotal;
  }, [records]);

  const handlePriceUpdate = async (buyPrice: number, sellPrice: number) => {
    await updatePrices(buyPrice, sellPrice);
    await addPriceHistory({
      date: new Date().toISOString(),
      buyPrice,
      sellPrice,
      source: 'manual',
    });
  };

  const tabs = [
    { key: 'home', title: '首页', icon: <AppOutline /> },
    { key: 'buy', title: '买入', icon: <AddCircleOutline /> },
    { key: 'sell', title: '卖出', icon: <MinusCircleOutline /> },
    { key: 'records', title: '记录', icon: <UnorderedListOutline /> },
    { key: 'settings', title: '设置', icon: <SetOutline /> },
  ];

  if (recordsLoading || settingsLoading) {
    return (
      <div className={styles.app}>
        <div className={styles.header}>
          <h1 className={styles.title}>Gold</h1>
        </div>
        <div className={styles.content} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: 'var(--gray-400)', fontSize: '14px' }}>加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.app}>
      <div className={styles.header}>
        <h1 className={styles.title}>Gold</h1>
      </div>

      <div className={styles.content}>
        {activeTab === 'home' && (
          <>
            <HoldingsCard holdings={holdings} />
            <PriceTrend
              buyPrice={currentBuyPrice}
              sellPrice={currentSellPrice}
              priceHistory={priceHistory}
              onUpdate={handlePriceUpdate}
              goldPriceLoading={goldPriceLoading}
              onRefresh={() => fetchAndUpdateGoldPrice(false)}
            />
          </>
        )}

        {activeTab === 'buy' && (
          <BuyForm
            onSubmit={addRecord}
            suggestedPrice={realtimeGold?.avgBankGoldBarPrice ?? 0}
          />
        )}

        {activeTab === 'sell' && (
          <SellForm
            availableWeight={availableWeight}
            onSubmit={(data) => addRecord({ ...data, laborCost: 0 })}
            suggestedPrice={realtimeGold?.recyclePrice24K ?? 0}
          />
        )}

        {activeTab === 'records' && (
          <RecordList records={records} onDelete={deleteRecord} />
        )}

        {activeTab === 'settings' && (
          <ImportExport onImportSuccess={() => window.location.reload()} />
        )}
      </div>

      <div className={styles.footer}>
        <TabBar activeKey={activeTab} onChange={setActiveTab}>
          {tabs.map(item => (
            <TabBar.Item key={item.key} icon={item.icon} title={item.title} />
          ))}
        </TabBar>
      </div>
    </div>
  );
}

export default App;
