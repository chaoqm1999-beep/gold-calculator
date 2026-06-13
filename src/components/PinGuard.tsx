import React, { useState } from 'react';
import { Input, Button, Toast } from 'antd-mobile';
import { useAuth } from '../hooks/useAuth';
import styles from './PinGuard.module.css';

export const PinGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading, login } = useAuth();
  const [pin, setPin] = useState('');

  if (loading) return null;

  if (isAuthenticated) {
    return <>{children}</>;
  }

  const handleSubmit = () => {
    if (pin.length < 4) {
      Toast.show({ content: 'PIN 至少 4 位', icon: 'fail' });
      return;
    }
    const ok = login(pin);
    if (!ok) {
      Toast.show({ content: 'PIN 不正确', icon: 'fail' });
      setPin('');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.icon}>🪙</div>
        <h2 className={styles.title}>黄金持仓计算器</h2>
        <p className={styles.desc}>请输入访问密码</p>

        <div className={styles.inputGroup}>
          <Input
            className={styles.pinInput}
            type="password"
            maxLength={6}
            placeholder="输入 PIN 码"
            value={pin}
            onChange={setPin}
            onEnterPress={handleSubmit}
          />
          <Button
            block
            color="primary"
            size="large"
            onClick={handleSubmit}
            disabled={pin.length < 4}
          >
            解锁
          </Button>
        </div>
      </div>
    </div>
  );
};
