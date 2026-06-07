import React, { useState, useMemo } from 'react';
import { Card, Input, Modal } from 'antd-mobile';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { PriceRecord, TrendRange } from '../types';
import { calculatePriceChange, prepareChartData, formatMoney } from '../utils/calculator';
import styles from './PriceTrend.module.css';

interface PriceTrendProps {
  buyPrice: number;
  sellPrice: number;
  priceHistory: PriceRecord[];
  onUpdate: (buyPrice: number, sellPrice: number) => void;
}

export const PriceTrend: React.FC<PriceTrendProps> = ({ buyPrice, sellPrice, priceHistory, onUpdate }) => {
  const [range, setRange] = useState<TrendRange>('realtime');
  const [editVisible, setEditVisible] = useState(false);
  const [tempBuyPrice, setTempBuyPrice] = useState('');
  const [tempSellPrice, setTempSellPrice] = useState('');

  const ranges = [
    { label: '实时', value: 'realtime' as TrendRange },
    { label: '1月', value: '1month' as TrendRange },
    { label: '3月', value: '3months' as TrendRange },
    { label: '半年', value: '6months' as TrendRange },
    { label: '1年', value: '1year' as TrendRange },
  ];

  // 计算金价涨跌（基于最近两次记录）
  const buyPriceChange = useMemo(() => {
    if (priceHistory.length < 2) {
      return { change: 0, percent: 0 };
    }
    const sorted = [...priceHistory].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    const previousBuyPrice = sorted[1].buyPrice;
    return calculatePriceChange(buyPrice, previousBuyPrice);
  }, [buyPrice, priceHistory]);

  const isPriceUp = buyPriceChange.change >= 0;

  // 图表数据过滤
  const filteredData = useMemo(() => {
    if (priceHistory.length === 0) return [];

    const now = new Date();
    const rangeDays: Record<TrendRange, number> = {
      realtime: 1,
      '1month': 30,
      '3months': 90,
      '6months': 180,
      '1year': 365,
    };

    const days = rangeDays[range];
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const filtered = priceHistory.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= cutoff;
    });

    return prepareChartData(filtered);
  }, [priceHistory, range]);

  const handleEditOpen = () => {
    setTempBuyPrice(buyPrice ? buyPrice.toString() : '');
    setTempSellPrice(sellPrice ? sellPrice.toString() : '');
    setEditVisible(true);
  };

  const handleEditSave = () => {
    const buy = parseFloat(tempBuyPrice) || 0;
    const sell = parseFloat(tempSellPrice) || 0;
    onUpdate(buy, sell);
    setEditVisible(false);
  };

  return (
    <>
      <Card className={styles.card}>
        {/* 顶部：实时金价标题 */}
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <span className={styles.label}>实时金价</span>
            <span className={styles.badge}>LIVE</span>
          </div>
          <span className={styles.editBtn} onClick={handleEditOpen}>编辑</span>
        </div>

        {/* 金价展示区域 */}
        <div className={styles.priceArea}>
          {/* 买入价 */}
          <div className={styles.priceBox}>
            <div className={styles.priceLabel}>买入价</div>
            <div className={styles.priceRow}>
              <span className={styles.priceValue}>
                {buyPrice > 0 ? `¥${buyPrice.toFixed(2)}` : '—'}
              </span>
              {buyPrice > 0 && priceHistory.length >= 2 && (
                <span className={`${styles.changeTag} ${isPriceUp ? styles.changeUp : styles.changeDown}`}>
                  {isPriceUp ? '▲' : '▼'} {buyPriceChange.change >= 0 ? '+' : ''}{formatMoney(buyPriceChange.change)}
                  ({buyPriceChange.percent >= 0 ? '+' : ''}{buyPriceChange.percent.toFixed(2)}%)
                </span>
              )}
            </div>
            <div className={styles.priceUnit}>元/克</div>
          </div>

          <div className={styles.priceDivider} />

          {/* 卖出价 */}
          <div className={styles.priceBox}>
            <div className={styles.priceLabel}>卖出价</div>
            <div className={styles.priceValue}>
              {sellPrice > 0 ? `¥${sellPrice.toFixed(2)}` : '—'}
            </div>
            <div className={styles.priceUnit}>元/克</div>
          </div>
        </div>

        {/* 时间切换标签 */}
        <div className={styles.tabs}>
          {ranges.map(r => (
            <span
              key={r.value}
              className={`${styles.tab} ${range === r.value ? styles.activeTab : ''}`}
              onClick={() => setRange(r.value)}
            >
              {r.label}
            </span>
          ))}
        </div>

        {/* 图表 */}
        {priceHistory.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyText}>暂无历史金价数据</div>
            <div className={styles.emptyHint}>点击编辑输入金价后将显示趋势图</div>
          </div>
        ) : (
          <div className={styles.chart}>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ebebeb" vertical={false} />
                <XAxis dataKey="date" stroke="#808080" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#808080" fontSize={11} tickLine={false} axisLine={false} width={45} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: 'rgba(0,0,0,0.08) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 2px',
                    fontSize: '13px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="buyPrice"
                  name="买入价"
                  stroke="#171717"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: '#171717' }}
                />
                <Line
                  type="monotone"
                  dataKey="sellPrice"
                  name="卖出价"
                  stroke="#a3a3a3"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: '#a3a3a3' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {/* 编辑金价弹窗 */}
      <Modal
        visible={editVisible}
        content={
          <div className={styles.modal}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>买入价（元/克）</label>
              <Input
                className={styles.input}
                type="number"
                placeholder="输入买入价"
                value={tempBuyPrice}
                onChange={setTempBuyPrice}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>卖出价（元/克）</label>
              <Input
                className={styles.input}
                type="number"
                placeholder="输入卖出价"
                value={tempSellPrice}
                onChange={setTempSellPrice}
              />
            </div>
          </div>
        }
        closeOnMaskClick
        onClose={() => setEditVisible(false)}
        actions={[
          {
            key: 'cancel',
            text: '取消',
            onClick: () => setEditVisible(false),
          },
          {
            key: 'save',
            text: '保存',
            onClick: handleEditSave,
          },
        ]}
      />
    </>
  );
};
