import React, { useState } from 'react';
import { Card, Input, Button, DatePicker, Toast } from 'antd-mobile';
import styles from './BuyForm.module.css';
import { formatMoney } from '../utils/calculator';

interface BuyFormProps {
  onSubmit: (data: {
    type: 'buy';
    date: string;
    weight: number;
    price: number;
    laborCost: number;
    note?: string;
  }) => void;
}

export const BuyForm: React.FC<BuyFormProps> = ({ onSubmit }) => {
  const [date, setDate] = useState<Date>(new Date());
  const [weight, setWeight] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [laborCost, setLaborCost] = useState<string>('0');
  const [note, setNote] = useState<string>('');

  const weightNum = parseFloat(weight) || 0;
  const priceNum = parseFloat(price) || 0;
  const laborCostNum = parseFloat(laborCost) || 0;
  const totalCost = weightNum * priceNum + laborCostNum;

  const handleSubmit = () => {
    if (weightNum <= 0) {
      Toast.show({ content: '请输入重量', icon: 'fail' });
      return;
    }
    if (priceNum <= 0) {
      Toast.show({ content: '请输入金价', icon: 'fail' });
      return;
    }

    onSubmit({
      type: 'buy',
      date: date.toISOString().split('T')[0],
      weight: weightNum,
      price: priceNum,
      laborCost: laborCostNum,
      note: note.trim() || undefined,
    });

    setWeight('');
    setPrice('');
    setLaborCost('0');
    setNote('');
    Toast.show({ content: '记录成功', icon: 'success' });
  };

  return (
    <Card className={styles.card}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <span className={styles.label}>记录买入</span>
          <span className={styles.badge}>BUY</span>
        </div>
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

        <div className={styles.field}>
          <label className={styles.fieldLabel}>工费（元）</label>
          <Input
            className={styles.input}
            type="number"
            placeholder="0.00"
            value={laborCost}
            onChange={setLaborCost}
          />
        </div>

        {weightNum > 0 && priceNum > 0 && (
          <div className={styles.total}>
            <span className={styles.totalLabel}>总花费</span>
            <span className={styles.totalValue}>¥{formatMoney(totalCost)}</span>
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
          保存记录
        </Button>
      </div>
    </Card>
  );
};
