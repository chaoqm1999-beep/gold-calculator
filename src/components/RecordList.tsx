import React from 'react';
import { Card, Button, Dialog, Empty } from 'antd-mobile';
import styles from './RecordList.module.css';
import type { GoldRecord } from '../types';
import { formatMoney } from '../utils/calculator';

interface RecordListProps {
  records: GoldRecord[];
  onDelete: (id: string) => void;
}

export const RecordList: React.FC<RecordListProps> = ({ records, onDelete }) => {
  const handleDelete = (record: GoldRecord) => {
    Dialog.confirm({
      content: '确定要删除这条记录吗？',
      onConfirm: () => {
        onDelete(record.id);
      },
    });
  };

  if (records.length === 0) {
    return (
      <Card className={styles.card}>
        <div className={styles.header}>
          <span className={styles.label}>交易记录</span>
        </div>
        <Empty description="暂无记录" />
      </Card>
    );
  }

  return (
    <Card className={styles.card}>
      <div className={styles.header}>
        <span className={styles.label}>交易记录</span>
        <span className={styles.count}>{records.length} 条</span>
      </div>

      <div className={styles.list}>
        {records.map(record => (
          <div key={record.id} className={styles.item}>
            <div className={styles.itemHeader}>
              <span className={`${styles.typeBadge} ${record.type === 'buy' ? styles.buyBadge : styles.sellBadge}`}>
                {record.type === 'buy' ? 'BUY' : 'SELL'}
              </span>
              <span className={styles.itemDate}>{record.date}</span>
              <Button
                className={styles.deleteBtn}
                size="small"
                fill="none"
                onClick={() => handleDelete(record)}
              >
                删除
              </Button>
            </div>

            <div className={styles.itemBody}>
              <div className={styles.itemInfo}>
                <span className={styles.itemWeight}>{record.weight.toFixed(2)} 克</span>
                <span className={styles.itemPrice}>@ ¥{record.price.toFixed(0)}/克</span>
                {record.type === 'buy' && record.laborCost > 0 && (
                  <span className={styles.itemLabor}>+¥{record.laborCost} 工费</span>
                )}
              </div>

              <div className={styles.itemTotal}>
                ¥{formatMoney(record.totalCost)}
              </div>

              {record.note && (
                <div className={styles.itemNote}>{record.note}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
