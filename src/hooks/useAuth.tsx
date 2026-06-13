import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface AuthContextType {
  /** 当前是否已认证 */
  isAuthenticated: boolean;
  /** 是否正在检查认证状态 */
  loading: boolean;
  /** 尝试 PIN 登录，返回是否成功 */
  login: (pin: string) => boolean;
  /** 登出 */
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  loading: true,
  login: () => false,
  logout: () => {},
});

const AUTH_KEY = 'gold_calc_auth';

// PIN 来自环境变量，构建时注入
const APP_PIN = import.meta.env.VITE_APP_PIN || '';

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // 检查是否已有有效会话
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(AUTH_KEY);
      if (stored === '1') {
        setIsAuthenticated(true);
      }
    } catch {
      // sessionStorage 不可用时降级
    }
    setLoading(false);
  }, []);

  // PIN 验证
  const login = useCallback((pin: string): boolean => {
    if (!APP_PIN || pin === APP_PIN) {
      setIsAuthenticated(true);
      try {
        sessionStorage.setItem(AUTH_KEY, '1');
      } catch {
        // 忽略
      }
      return true;
    }
    return false;
  }, []);

  // 登出
  const logout = useCallback(() => {
    setIsAuthenticated(false);
    try {
      sessionStorage.removeItem(AUTH_KEY);
    } catch {
      // 忽略
    }
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
