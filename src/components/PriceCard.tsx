import React, { useState } from 'react';
import { Card, Input, Modal } from 'antd-mobile';
import styles from './PriceCard.module.css';

interface PriceCardProps {
  buyPrice: number;
  sellPrice: number;
  onUpdate: (buyPrice: number, sellPrice: number) => void;
}

export const PriceCard: React.FC<PriceCardProps> = ({ buyPrice, sellPrice, onUpdate }) => {
  const [visible, setVisible] = useState(false);
  const [tempBuyPrice, setTempBuyPrice] = useState<string>('');
  const [tempSellPrice, setTempSellPrice] = useState<string>('');

  const handleOpen = () => {
    setTempBuyPrice(buyPrice ? buyPrice.toString() : '');
    setTempSellPrice(sellPrice ? sellPrice.toString() : '');
    setVisible(true);
  };

  const handleSave = () => {
    const buy = parseFloat(tempBuyPrice) || 0;
    const sell = parseFloat(tempSellPrice) || 0;
    onUpdate(buy, sell);
    setVisible(false);
  };

  return (
    <>
      <Card className={styles.card}>
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <span className={styles.label}>实时金价</span>
            <span className={styles.badge}>LIVE</span>
          </div>
          <span className={styles.editBtn} onClick={handleOpen}>
            编辑
          </span>
        </div>

        <div className={styles.prices}>
          <div className={styles.priceBox}>
            <div className={styles.priceLabel}>买入价</div>
            <div className={styles.priceValue}>
              {buyPrice > 0 ? `¥${buyPrice.toFixed(2)}` : '—'}
            </div>
            <div className={styles.priceUnit}>元/克</div>
          </div>

          <div className={styles.divider} />

          <div className={styles.priceBox}>
            <div className={styles.priceLabel}>卖出价</div>
            <div className={styles.priceValue}>
              {sellPrice > 0 ? `¥${sellPrice.toFixed(2)}` : '—'}
            </div>
            <div className={styles.priceUnit}>元/克</div>
          </div>
        </div>
      </Card>

      <Modal
        visible={visible}
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
        onClose={() => setVisible(false)}
        actions={[
          {
            key: 'cancel',
            text: '取消',
            onClick: () => setVisible(false),
          },
          {
            key: 'save',
            text: '保存',
            onClick: handleSave,
          },
        ]}
      />
    </>
  );
};
