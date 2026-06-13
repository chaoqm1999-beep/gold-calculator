import React, { useState, useEffect } from 'react';
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
  /** 实时金价参考（24K回收价），用于自动填充 */
  suggestedPrice: number;
}

export const SellForm: React.FC<SellFormProps> = ({ availableWeight, onSubmit, suggestedPrice }) => {
  const [date, setDate] = useState<Date>(new Date());
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [weight, setWeight] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [priceAutoFilled, setPriceAutoFilled] = useState(false);

  // 自动填充实时金价（仅首次、价格为空时）
  useEffect(() => {
    if (suggestedPrice > 0 && !priceAutoFilled && price === '') {
      setPrice(suggestedPrice.toFixed(2));
      setPriceAutoFilled(true);
    }
  }, [suggestedPrice, priceAutoFilled, price]);

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
            visible={datePickerVisible}
            value={date}
            onClose={() => setDatePickerVisible(false)}
            onConfirm={(val) => {
              setDate(val);
              setDatePickerVisible(false);
            }}
            max={new Date()}
          >
            {() => null}
          </DatePicker>
          <Button className={styles.dateBtn} onClick={() => setDatePickerVisible(true)}>
            {date.toLocaleDateString('zh-CN')}
          </Button>
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
          <label className={styles.fieldLabel}>
            金价（元/克）
            {suggestedPrice > 0 && (
              <span className={styles.refHint}>回收参考 ¥{suggestedPrice.toFixed(2)}</span>
            )}
          </label>
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
