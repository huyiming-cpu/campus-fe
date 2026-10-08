# 校园宝 · 前端 (Campus-Bao Frontend)

> 「校园宝」校园二手交易平台 —— **前端仓库**

[![Vue](https://img.shields.io/badge/Vue-3.5-42b883)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.3-646cff)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6)](https://www.typescriptlang.org/)
[![Element Plus](https://img.shields.io/badge/Element_Plus-2.13-409eff)](https://element-plus.org/)
[![License](https://img.shields.io/badge/license-MIT-green)]()

## 项目简介

面向高校学生的二手商品交易平台。卖家发布闲置商品，买家下单支付，平台介入担保交易，
买卖双方互评形成信用体系；并集成 **AI 智能客服**、需求广场、礼券抽奖、信用中心等模块。

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Vue 3 (Composition API + `<script setup>`) |
| 构建工具 | Vite 7 |
| 类型 | TypeScript 5.9 |
| 路由 | Vue Router 4 |
| UI 库 | Element Plus 2.13 |
| 图表 | ECharts 6 |
| HTTP | Axios |
| 包管理 | npm（`package-lock.json`） |

## 功能模块

- **首页**：商品瀑布流、搜索、分类筛选、商品详情
- **用户系统**：注册 / 登录 / 忘记密码 / 个人中心 / 资料编辑
- **商品交易**：发布商品 / 购物车 / 下单 / 支付 / 订单管理 / 收藏
- **信用体系**：信用中心、信用分变化记录
- **钱包 / 礼券**：余额管理、优惠券、礼券包、抽奖
- **需求广场**：发布需求、需求匹配
- **AI 客服**：百度千帆大模型接入
- **即时通讯**：聊天室
- **管理员后台**：商品 / 订单 / 用户审核

## 启动

```bash
# 环境要求
node -v    # 需 v20.19+ 或 v22.12+

# 安装依赖
npm install

# 启动开发服务器（默认 http://localhost:5173）
npm run dev

# 构建生产版本（输出到 dist/）
npm run build

# 预览生产构建
npm run preview
```

## 后端仓库

https://github.com/huyiming-cpu/campus-bao

Spring Boot 4 + MyBatis + JPA + MySQL（端口 3307，库名 `campus_db`）。
完整启动说明见项目根目录的 `CloudStudio协作与本地启动指南.md`。

## 目录结构

```
campus-fe/
├── public/                       # 静态资源（favicon、二维码）
├── src/
│   ├── api/                      # 后端调用封装
│   │   └── user.js
│   ├── assets/                   # 图片、头像、商品图
│   ├── components/               # 公共组件
│   ├── router/                   # 路由配置
│   │   └── index.ts
│   ├── utils/                    # 工具函数
│   │   └── request.js            # axios 封装
│   ├── views/                    # 页面（24 个）
│   │   ├── Login.vue / Register.vue / Forget.vue
│   │   ├── ProductHome.vue / ProductDetail.vue / SearchResult.vue
│   │   ├── MyCart.vue / MyOrders.vue / MyCollect.vue
│   │   ├── MyCenter.vue / MyProduct.vue / UserEdit.vue
│   │   ├── MyWallet.vue / MyCoupons.vue
│   │   ├── CreditCenter.vue
│   │   ├── GiftPackList.vue / GiftPackDetail.vue
│   │   ├── NeedSquare.vue
│   │   ├── AIChat.vue            # AI 客服
│   │   ├── ChatRoom.vue          # 即时聊天
│   │   ├── SellerHome.vue
│   │   ├── CreateOrder.vue
│   │   ├── Admin.vue             # 管理员后台
│   │   └── About.vue
│   ├── App.vue
│   ├── main.ts
│   └── vite-env.d.ts
├── index.html
├── vite.config.ts
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
├── env.d.ts
├── package.json / package-lock.json
└── .gitignore
```

## 协作与提交

```bash
git pull
git add .
git commit -m "描述改了什么"
git push
```

> 详细协作流程见仓库同目录的 `CloudStudio协作与本地启动指南.md`。

## License

MIT