#!/bin/bash
# 部署到GitHub Pages

echo "开始部署到GitHub Pages..."

# 添加base路径到vite.config.ts
cd "C:/Users/HUAWEI/.qclaw/workspace-agents/engineer/gold-calculator"

# 构建
npm run build

# 创建404.html用于SPA路由
cp dist/index.html dist/404.html

echo "构建完成！"
echo "请手动将dist目录推送到gh-pages分支"
