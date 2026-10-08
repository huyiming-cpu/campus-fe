import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import type { RouteRecordRaw } from 'vue-router'

const routes = [
  // 登录页和注册页的路由配置
  {
    path: '/',
    name: 'Login',
    component: Login
  },
  // 登录页的路由配置
  {
    path: '/login',
    component: Login
  },
  // 注册页的路由配置
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  // 忘记密码页的路由配置
  {
  path: '/forget',
  component: () => import('../views/Forget.vue')
},
// 商品详情页的路由配置
{
  path: '/productHome',
  component: () => import('../views/ProductHome.vue')
},
// 个人中心页的路由配置
{
  path: '/myCenter',
  component: () => import('../views/MyCenter.vue')
},
// 编辑个人信息页的路由配置
{
  path: '/user/edit',
  name: 'UserEdit',
  component: () => import('@/views/UserEdit.vue')
},
{
  path: '/my/product',
  name: 'MyProduct',
  component: () => import('@/views/MyProduct.vue')
},
//客服页的路由配置
  {
    path: '/ai-chat',
    name: 'AIChat',
    component: () => import('@/views/AIChat.vue')
  },
//商品详情页的路由配置
{
  path: '/product/detail/:id',
  name: 'ProductDetail',
  component: () => import('@/views/ProductDetail.vue'),
   key: (route: RouteRecordRaw) => route.path

},
//搜索页的路由配置
{
  path: '/search',
  name: 'SearchResult',
  component: () => import('@/views/SearchResult.vue')
},
//购物车页的路由配置
{
  path: '/my/cart',
  name: 'MyCart',
  component: () => import('@/views/MyCart.vue')
},
//收藏页的路由配置
{
  path: '/my/collect',
  name: 'MyCollect',
  component: () => import('@/views/MyCollect.vue')
},
//卖家主页的路由配置
{
  path: '/seller/:id',
  name: 'SellerHome',
  component: () => import('@/views/SellerHome.vue')
},
//聊天页的路由配置
{
  path: '/chat',
  name: 'Chat',
  component: () => import('@/views/ChatRoom.vue')
},
//订单页的路由配置
{
  path: '/create-order',
  name: 'CreateOrder',
  component: () => import('@/views/CreateOrder.vue')
},
{
  path: '/my-orders',
  name: 'MyOrders',
  component: () => import('@/views/MyOrders.vue')
},
//钱包
{
  path: "/my-wallet",
  name: "MyWallet",
  component: () => import("@/views/MyWallet.vue")
},
//信用中心
{
  path: "/credit-center",
  name: "CreditCenter",
  component: () => import("@/views/CreditCenter.vue")
},
{
  path: "/admin",
  name: "Admin",
  component: () => import("@/views/Admin.vue")
},
//校园广场
{
  path: "/need-square",
  name: "NeedSquare",
  component: () => import("@/views/NeedSquare.vue")
},
{
  path: "/giftPack",
  name: "GiftPackList",
  component: () => import("@/views/GiftPackList.vue")
},
{
  path: "/giftPack/detail/:id",
  name: "GiftPackDetail",
  component: () => import("@/views/GiftPackDetail.vue")
},
{
  path: "/my-coupons",
  name: "MyCoupons",
  component: () => import("@/views/MyCoupons.vue")
},
//关于我们
{
  path: "/about",
  name: "About",
  component: () => import("@/views/About.vue")
}
]
// 创建路由实例并传递 `routes` 配置
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
   scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

export default router