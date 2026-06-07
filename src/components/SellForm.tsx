import React, { useState } from 'react';
import { Card, Input, Button, DatePicker, Toast } from 'antd-mobile';
import styles from './SellForm.module.css';
import { formatMoney } from '../utils/calculator';

interface SellFormProps {
  availableWeight: number;
  onSubmit: (data: {
    type: 'sell';
    date: string;
    weight: number;
    price: number;
    note?: string;
  }) => void;
}

export const SellForm: React.FC<SellFormProps> = ({ availableWeight, onSubmit }) => {
  const [date, setDate] = useState<Date>(new Date());
  const [weight, setWeight] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [note, setNote] = useState<string>('');

  const weightNum = parseFloat(weight) || 0;
  const priceNum = parseFloat(price) || 0;
  const income = weightNum * priceNum;

  const handleSubmit = () => {
    if (weightNum <= 0) {
      Toast.show({ content: '请输入重量', icon: 'fail' });
      return;
    }
    if (weightNum > availableWeight) {
      Toast.show({ content: `可卖克重不足，当前可卖 ${availableWeight.toFixed(2)} 克`, icon: 'fail' });
      return;
    }
    if (priceNum <= 0) {
      Toast.show({ content: '请输入金价', icon: 'fail' });
      return;
    }

    onSubmit({
      type: 'sell',
      date: date.toISOString().split('T')[0],
      weight: weightNum,
      price: priceNum,
      note: note.trim() || undefined,
    });

    setWeight('');
    setPrice('');
    setNote('');
    Toast.show({ content: '记录成功', icon: 'success' });
  };

  return (
    <Card className={styles.card}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <span className={styles.label}>卖出/置换</span>
          <span className={styles.badge}>SELL</span>
        </div>
      </div>

      <div className={styles.available}>
        <span className={styles.availableLabel}>可卖克重</span>
        <span className={styles.availableValue}>{availableWeight.toFixed(2)} 克</span>
      </div>

      <div className={styles.form}>
        <div className={styles.field}>
          <label className={styles.fieldLabel}>日期</label>
          <DatePicker
            value={date}
            onConfirm={setDate}
            max={new Date()}
          >
            {(value) => (
              <Button className={styles.dateBtn}>
                {(value ?? new Date()).toLocaleDateString('zh-CN')}
              </Button>
            )}
          </DatePicker>
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel}>重量（克）</label>
          <Input
            className={styles.input}
            type="number"
            placeholder="0.00"
            value={weight}
            onChange={setWeight}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel}>金价（元/克）</label>
          <Input
            className={styles.input}
            type="number"
            placeholder="0.00"
            value={price}
            onChange={setPrice}
          />
        </div>

        {weightNum > 0 && priceNum > 0 && (
          <div className={styles.total}>
            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>预估收入</span>
              <span className={styles.totalValue}>¥{formatMoney(income)}</span>
            </div>
          </div>
        )}

        <div className={styles.field}>
          <label className={styles.fieldLabel}>备注（可选）</label>
          <Input
            className={styles.input}
            placeholder="添加备注"
            value={note}
            onChange={setNote}
          />
        </div>

        <Button
          className={styles.submitBtn}
          block
          onClick={handleSubmit}
        >
          确认卖出
        </Button>
      </div>
    </Card>
  );
};
