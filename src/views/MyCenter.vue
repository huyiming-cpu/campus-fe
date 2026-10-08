<template>
  <div class="back-nav" @click="goHome">← 返回首页</div>

  <div class="my-center">
    <!-- 顶部个人信息 -->
    <div class="top-card">
       <div class="avatar" @click="changeAvatar">
  <div class="avatar-wrapper">
    <img :src="getAvatarUrl(user.avatar)" alt="头像" />
    <div class="avatar-pendant" :class="'pendant-' + getLevelClass(user.creditLevel)">
      {{ getPendantIcon(user.creditLevel) }}
    </div>
  </div>
  <div class="avatar-mask"></div>
</div>
      <div class="info">
        <div class="name">
          {{ user.username }} 
          <span class="auth-tag">已认证</span>
        </div>
        <div class="school">🎓{{ user.university }}</div>
        <div class="student-id">学号：{{ user.studentId }}</div>    
      <div class="gender">
  <span v-if="user.gender === '男'">👨 男</span>
  <span v-if="user.gender === '女'">👩 女</span>
  <span v-if="user.gender === '未设置'">👤 未设置</span>
  &nbsp;&nbsp;
  <span class="age">{{ getAge(user.birth) }}岁</span>
</div>
        

        <div class="description">📚个人描述：{{ user.description }}</div>
      </div>
    </div>
<!-- 清空搜索记录按钮 -->

    <div class="credit-card">
      <div>
        <div class="label">✨信用分</div>
        <div class="score">{{ user.creditScore }}</div>
      </div>
      <div>
        <div class="label">💎信用等级</div>
        <div class="level">{{ user.creditLevel }}</div>
      </div>
    </div>

    <div class="menu-grid">
     <div class="item" @click="goMyOrder">
  <div class="icon">📋</div>
  <div class="text">我的订单</div>
  <div v-if="pendingOrderCount > 0" class="badge-order">{{ pendingOrderCount > 99 ? '99+' : pendingOrderCount }}</div>
</div>
      <div class="item" @click="goMyProduct">
        <div class="icon">🧸</div>
        <div class="text">我的宝贝</div>
      </div>
      <div class="item" @click="goMyCollect">
        <div class="icon">⭐</div>
        <div class="text">我的收藏</div>
      </div>
      <div class="item" @click="goMyWallet">
  <div class="icon">💰</div>
  <div class="text">我的钱包</div>
</div>
      <div class="item" @click="goMyCart">
        <div class="icon">🛒</div>
        <div class="text">购物车</div>
      </div>
      <div class="item" @click="goMyChat">
        <div class="icon">💬</div>
        <div class="text">聊天Chat</div>
        <div v-if="totalUnreadCount > 0" class="badge">{{ totalUnreadCount > 99 ? '99+' : totalUnreadCount }}</div>
      </div>
      <div class="item" @click="goCredit">
        <div class="icon">📊</div>
        <div class="text">信用中心</div>
      </div>
       <div class="item" @click="goMyCoupons">
  <div class="icon">🎟️</div>
  <div class="text">我的优惠券</div>
</div>
    <div class="item" @click="goNeedSquare">
  <div class="icon">🎯</div>
  <div class="text">需求广场</div>
</div>
    </div>

    <div class="bottom-menu">
      <div class="item" @click="goEdit">✏️账户信息</div>
    </div>
  </div>
   <input type="file" ref="avatarInput" accept="image/*" style="display: none" @change="uploadAvatar" />
</template>

<script setup>
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { onUnmounted } from 'vue' 
import axios from 'axios' 
// 待处理订单数量（用于红点提示）
const pendingOrderCount = ref(0)
const router = useRouter()
const totalUnreadCount = ref(0)
// 初始化用户信息（严格匹配你的字段名）
const user = ref({
  username: '加载中...',
  university: '加载中...',
  studentId: '',
  avatar: 'hym.jpg',
  creditScore: 0,
  creditLevel: '加载中...',
  description: '个人描述：无'
})
const avatarInput = ref(null)

// 点击头像触发文件选择
const changeAvatar = () => {
  avatarInput.value?.click()
}

// 随机生成星星样式
const getStarStyle = () => {
  const size = Math.random() * 3 + 1
  const left = Math.random() * 100
  const top = Math.random() * 100
  const duration = Math.random() * 3 + 1
  const delay = Math.random() * 5
  return {
    left: left + '%',
    top: top + '%',
    width: size + 'px',
    height: size + 'px',
    animationDuration: duration + 's',
    animationDelay: delay + 's'
  }
}
// 上传头像
const uploadAvatar = async (e) => {
  const file = e.target.files[0]
  if (!file) return
  
  const formData = new FormData()
  formData.append('avatar', file)
  
  try {
    const res = await axios.post(`${API_BASE}/user/uploadAvatar`, formData, {
      withCredentials: true,
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    if (res.data.code === 200) {
      alert('头像修改成功')
      // ✅ 重新从后端获取最新用户信息
      const infoRes = await axios.get(`${API_BASE}/user/getMyInfo`, {
        withCredentials: true
      })
      if (infoRes.data && infoRes.data.data) {
        const newUserInfo = infoRes.data.data
        // 更新 user.value
        user.value = {
          ...user.value,
          ...newUserInfo
        }
        // ✅ 更新 sessionStorage
        sessionStorage.setItem("loginUser", JSON.stringify(newUserInfo))
      }
    } else {
      alert(res.data.msg)
    }
  } catch (err) {
    console.error('上传失败', err)
    alert('上传失败')
  }
}
// 获取个人信息
const getUserInfo = () => {
  const loginUserStr = sessionStorage.getItem("loginUser")
  if (!loginUserStr) {
    ElMessage.error("请先登录")
    router.push("/login")
    return
  }
  // 解析登录时存的用户信息
  const loginUser = JSON.parse(loginUserStr)
   console.log('登录用户信息：', loginUser) 
  user.value = {
    ...user.value,
    ...loginUser
  }
}

// 头像路径自动匹配
const getAvatarUrl = (avatar) => {
  if (!avatar) return `${API_BASE}/avatar/default.jpg`
  return `${API_BASE}/avatar/${avatar}`
}

onMounted(() => {
  getUserInfo()
})
// 计算年龄
function getAge(birthDate) {
  if (!birthDate) return 0
  const birth = new Date(birthDate)
  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  if (now < new Date(now.getFullYear(), birth.getMonth(), birth.getDate())) {
    age--
  }
  return age
}
// 获取等级样式
const getLevelClass = (level) => {
  if (level === '极好') return 'excellent'
  if (level === '优秀') return 'good'
  if (level === '良好') return 'fine'
  if (level === '一般') return 'normal'
  return 'bad'
}

// 获取挂件图标
const getPendantIcon = (level) => {
  if (level === '极好') return '👑'
  if (level === '优秀') return '⭐'
  if (level === '良好') return '🌿'
  if (level === '一般') return '🌱'
  return '💧'
}// 返回主页
const goHome = () => router.push('/productHome')
// 账户信息编辑页
const goEdit = () => router.push('/user/edit')
// 我的宝贝页
const goMyProduct = () => router.push('/my/product')
// 我的订单
const goMyOrder = () => router.push('/my-orders')
// 我的收藏
const goMyCollect = () => router.push('/my/collect')
// 我的钱包
const goMyWallet = () => router.push('/my-wallet')
// 购物车
const goMyCart = () => router.push('/my/cart')
// 聊天消息
const goMyChat = () => router.push('/chat')
// 信用中心
const goCredit = () => router.push('/credit-center')
// 需求广场
const goNeedSquare = () => router.push('/need-square')
//我的优惠券
const goMyCoupons = () => router.push('/my-coupons')
// 获取未读消息总数
const getUnreadCount = async () => {
  if (!user.value.id) {
    console.log('user.id 为空', user.value)
    return
  }
  try {
    const res = await axios.get(`${API_BASE}/msg/my?userId=${user.value.id}`)
    const list = res.data.data || []
    totalUnreadCount.value = list.reduce((sum, item) => sum + (item.unreadCount || 0), 0)
    console.log('未读消息总数：', totalUnreadCount.value)
  } catch (e) {
    console.error('获取未读数量失败', e)
  }
}
// 获取待处理订单数量
// 获取待处理订单数量
const getPendingOrderCount = async () => {
  try {
    const loginUser = JSON.parse(sessionStorage.getItem("loginUser"))
    if (!loginUser) return
    
    let totalPending = 0
    
    // 获取卖家订单
    const sellRes = await axios.get(`${API_BASE}/order/mySell`, {
      params: { status: '' },
      withCredentials: true
    })
    const sellOrders = sellRes.data.data || []
    
    for (let order of sellOrders) {
      // 1. 待设置自提点（线下订单，pending状态）
      if (order.tradeType === 'offline' && order.orderStatus === 'pending') {
        totalPending++
      }
      // 2. 待发货（线上订单，paid状态）
      else if (order.orderStatus === 'paid') {
        totalPending++
      }
      // 3. 待处理退款申请
      else if (order.refundStatus === 'pending') {
        totalPending++
      }
    }
    
    // 获取买家订单
    const buyRes = await axios.get(`${API_BASE}/order/myBuy`, {
      params: { status: '' },
      withCredentials: true
    })
    const buyOrders = buyRes.data.data || []
    
    for (let order of buyOrders) {
      // 1. 待收货
      if (order.orderStatus === 'shipped') {
        totalPending++
      }
      // 2. 退款被拒（需要买家重新处理）
      else if (order.refundStatus === 'rejected') {
        totalPending++
      }
    }
    
    pendingOrderCount.value = totalPending
    
  } catch (err) {
    console.error('获取待处理订单失败', err)
  }
}

// 定时刷新待处理数量
let refreshTimer = null
const startPolling = () => {
  refreshTimer = setInterval(() => {
    getPendingOrderCount()
  }, 10000) // 每10秒刷新一次
}

onMounted(() => {
  getUserInfo()
getPendingOrderCount()  // 添加这行
  startPolling()          // 添加这行
  setTimeout(() => {
    getUnreadCount()
  }, 300)
})
onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
})

</script>

<style scoped>
/* 图标悬浮跳动效果 */
.menu-grid .item .icon {
  display: inline-block;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.menu-grid .item:hover .icon {
  transform: translateY(-8px) scale(1.1);
}

/* 底部菜单悬浮效果 */
.bottom-menu .item {
  transition: all 0.3s ease;
}

.bottom-menu .item:hover {
  transform: translateX(8px);
  background: linear-gradient(90deg, rgba(37, 99, 235, 0.1), transparent);
}

/* 信用卡片悬浮 */
.credit-card {
  transition: all 0.3s ease;
}

.credit-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
}

/* 顶部卡片悬浮 */
.top-card {
  transition: all 0.3s ease;
}

.top-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}

.back-nav {
  background: linear-gradient(145deg, #e8f4ff 0%, #d4e8ff 100%);
  color: #2563eb;
  padding: 12px 20px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  border-bottom: 1px solid rgba(37, 99, 235, 0.1);
  margin: 0;
  line-height: 1;
}

.back-nav:hover {
  color: #1e40af;
}

.my-center {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(145deg, #e8f4ff 0%, #d4e8ff 100%);
  padding-top: 0;
  padding-bottom: 40px;
  margin-top: -1px;  /* 关键：向上偏移1px消除缝隙 */
}
.top-card {
  background: white;
  padding: 20px 30px;
  display: flex;
  align-items: center;
  margin: 15px 15px 15px 15px;
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(37, 99, 235, 0.1);
}

.avatar {
  position: relative;
  cursor: pointer;
}

.avatar-wrapper {
  position: relative;
  display: inline-block;
}

.avatar-wrapper img {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #2563eb;
}

/* 挂件样式 - 右上角 */
.avatar-pendant {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
  border: 2px solid white;
  z-index: 10;
}

.pendant-excellent {
  background: linear-gradient(135deg, #ffd700, #ffb347);
}

.pendant-good {
  background: linear-gradient(135deg, #ffd700, #ffb347);
}

.pendant-fine {
  background: linear-gradient(135deg, #a8e6cf, #d4edda);
}

.pendant-normal {
  background: linear-gradient(135deg, #ffecb3, #ffe0b2);
}

.pendant-bad {
  background: linear-gradient(135deg, #e0e0e0, #bdbdbd);
}

/* 订单红点样式 */
.badge-order {
  position: absolute;
  top: -5px;
  right: 35%;
  background: #ff4444;
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
  z-index: 10;
  font-weight: bold;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.avatar img {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  margin-right: 15px;
  background: #fff;
  object-fit: cover;
  margin-top: 30px;
}

.name {
  color: #1f2937;
  font-size: 25px;
  font-weight: bold;
  display: flex;
  gap: 8px;
}

.auth-tag {
  background: #e0e7ff;
  color: #2563eb;
  font-size: 12px;
  padding: 2px 10px;
  border-radius: 20px;
  margin-top: 13px;      /* 往下移 */
  display: inline-block; /* 确保 margin 生效 */
}

.school {
  color: #2563eb;
  margin-top: 4px;
  font-size: 15px;
}

.gender {
  color: #4b5563;
  margin-top: 4px;
  font-size: 12px;
}

.age {
  color: #4b5563;
  margin-top: 4px;
  font-size: 12px;
}

.student-id {
  color: #4b5563;
  margin-top: 4px;
  font-size: 14px;
}

.description {
  color: #4b5563;
  margin-top: 4px;
  font-size: 14px;
}

.credit-card {
  background: white;
  margin: 15px;
  padding: 20px;
  border-radius: 20px;
  display: flex;
  justify-content: space-around;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(37, 99, 235, 0.1);
}

.label {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 6px;
}

.score, .level {
  font-size: 28px;
  font-weight: bold;
  color: #2563eb;
  margin-top: 4px;
}

.menu-grid {
  background: white;
  margin: 15px;
  border-radius: 20px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  padding: 15px 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(37, 99, 235, 0.1);
}

.icon {
  font-size: 40px;
  margin-bottom: 6px;
}

.text {
  font-size: 13px;
  color: #4b5563;
}

.bottom-menu {
  background: white;
  margin: 15px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(37, 99, 235, 0.1);
}

.bottom-menu .item {
  padding: 15px 20px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  font-size: 16px;
  color: #4b5563;
}

.bottom-menu .item:last-child {
  border-bottom: none;
}

/* 修改 .item 样式，让图标和文字可以相对定位 */
.item {
  text-align: center;
  padding: 12px 0;
  cursor: pointer;
  position: relative;
}

/* 把红点放在图标右上角 */
.badge {
  position: absolute;
  top: 0px;
  right: 40%;
  background: #ff4444;
  color: white;
  font-size: 10px;
  padding: 2px 5px;
  border-radius: 10px;
  min-width: 16px;
  text-align: center;
  z-index: 10;
}
</style>