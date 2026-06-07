import React, { useRef } from 'react';
import { Card, Button, Toast } from 'antd-mobile';
import { DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import styles from './ImportExport.module.css';
import { exportData, importData } from '../utils/storage';

interface ImportExportProps {
  onImportSuccess: () => void;
}

export const ImportExport: React.FC<ImportExportProps> = ({ onImportSuccess }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    try {
      const data = await exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `gold-records-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      Toast.show({ content: '导出成功', icon: 'success' });
    } catch (error) {
      Toast.show({ content: '导出失败', icon: 'fail' });
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = event.target?.result as string;
        await importData(data);
        onImportSuccess();
        Toast.show({ content: '导入成功', icon: 'success' });
      } catch (error) {
        Toast.show({ content: '导入失败，请检查文件格式', icon: 'fail' });
      }
    };
    reader.readAsText(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className={styles.card}>
      <div className={styles.header}>
        <span className={styles.label}>数据管理</span>
      </div>

      <div className={styles.actions}>
        <Button
          className={styles.btn}
          onClick={handleExport}
        >
          <DownloadOutlined /> 导出数据
        </Button>

        <Button
          className={styles.btn}
          onClick={handleImportClick}
        >
          <UploadOutlined /> 导入数据
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>
    </Card>
  );
};
