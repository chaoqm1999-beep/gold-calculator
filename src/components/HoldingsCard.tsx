import React from 'react';
import { Card } from 'antd-mobile';
import { formatMoney, formatPercent } from '../utils/calculator';
import type { Holdings as HoldingsType } from '../types';
import styles from './HoldingsCard.module.css';

interface HoldingsCardProps {
  holdings: HoldingsType;
}

export const HoldingsCard: React.FC<HoldingsCardProps> = ({ holdings }) => {
  const { totalWeight, avgCost, currentValue, profit, profitRate, todayProfit, todayProfitRate } = holdings;
  const isProfit = profit >= 0;
  const isTodayProfit = todayProfit >= 0;

  return (
    <Card className={styles.card}>
      <div className={styles.header}>
        <span className={styles.label}>持仓总览</span>
      </div>

      {/* 主金额区 */}
      <div className={styles.mainValue}>
        ¥{formatMoney(currentValue)}
      </div>

      {/* 副标题：克重 + 均价 */}
      <div className={styles.subtitle}>
        持仓 {totalWeight.toFixed(2)}g · 均价 ¥{formatMoney(avgCost)}/克
      </div>

      {/* 横向收益指标 */}
      <div className={styles.metrics}>
        <div className={styles.metricItem}>
          <div className={styles.metricLabel}>今日收益</div>
          <div className={`${styles.metricValue} ${isTodayProfit ? styles.profit : styles.loss}`}>
            {isTodayProfit ? '+' : ''}¥{formatMoney(Math.abs(todayProfit))}
          </div>
          <div className={`${styles.metricRate} ${isTodayProfit ? styles.profit : styles.loss}`}>
            {formatPercent(todayProfitRate)}
          </div>
        </div>

        <div className={styles.metricDivider} />

        <div className={styles.metricItem}>
          <div className={styles.metricLabel}>持仓收益</div>
          <div className={`${styles.metricValue} ${isProfit ? styles.profit : styles.loss}`}>
            {isProfit ? '+' : ''}¥{formatMoney(Math.abs(profit))}
          </div>
          <div className={`${styles.metricRate} ${isProfit ? styles.profit : styles.loss}`}>
            {formatPercent(profitRate)}
          </div>
        </div>

        <div className={styles.metricDivider} />

        <div className={styles.metricItem}>
          <div className={styles.metricLabel}>总投入</div>
          <div className={styles.metricValue}>
            ¥{formatMoney(holdings.totalCost)}
          </div>
          <div className={styles.metricSub}>
            {totalWeight.toFixed(2)} 克
          </div>
        </div>
      </div>
    </Card>
  );
};
