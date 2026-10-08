<template>
  <div class="seller-page">
   
    <div class="back-bar">
      <button @click="$router.back()">← 返回</button>
    </div>

    <div class="seller-card" v-if="seller.id">
  <img :src="`http://localhost:8080/avatar/${seller.avatar}`" class="avatar" @error="handleAvatarError" />
  <div>
    <h3>{{ seller.username }} <span class="auth-tag">已认证</span></h3>
    
    <!-- 性别和年龄并排显示 -->
    <div style="display: flex; align-items: center; gap: 10px; margin: 5px 0;">
      <span v-if="seller.gender === '男'">👨 男</span>
      <span v-if="seller.gender === '女'">👩 女</span>
      <span v-if="!seller.gender || seller.gender === '未设置'">👤 未设置</span>
      <span>{{ getAge(seller.birth) }}岁</span>
    </div>
    
    <p>{{ seller.university || '暂无描述' }}</p>
    <p>信用等级：{{ seller.creditLevel || '暂无描述' }}</p>
    <p>在售宝贝：{{ sellerGoods.length }} 件</p>
    <p>简介：{{ seller.description || '暂无描述' }}</p>
   
  </div>
 
  
</div>
    <div class="goods-title">📦 Ta的宝贝</div>

    <div class="goods-list">
      <div class="goods-item" v-for="item in sellerGoods" :key="item.id" @click="toDetail(item.id)">
        <img :src="`http://localhost:8080/products/${item.image}`" class="goods-img" @error="handleImageError" />
        <div class="name">{{ item.name }}</div>
        <div class="price">¥{{ item.price }}</div>
      </div>
    </div>

    <div v-if="sellerGoods.length === 0 && seller.id" class="empty">暂无商品</div>
    <div v-if="!seller.id" class="empty">加载中...</div>
  </div>
   <!-- 评价模块 -->
<div class="evaluation-section" v-if="evaluationList.length > 0">
  <div class="section-header">
    <div class="goods-title">⭐ 买家评价</div>
    <div class="rate-summary">
      <span class="rate-score">{{ goodRate }}%</span>
      <span class="rate-label">好评率</span>
      <span class="rate-count">({{ evaluationTotal }}条评价)</span>
    </div>
  </div>
  
  <div class="evaluation-list">
    <div class="evaluation-item" v-for="item in evaluationList" :key="item.id">
      <div class="eval-header">
        <img 
          :src="`http://localhost:8080/avatar/${item.fromUser?.avatar || 'default.jpg'}`" 
          class="eval-avatar"
          @error="handleAvatarError"
        />
        <div class="eval-user">
          <div class="eval-name">{{ item.fromUser?.username || '匿名用户' }}</div>
          <div class="eval-time">{{ formatDate(item.createTime) }}</div>
        </div>
        <div class="eval-stars">
          <span v-for="i in 5" :key="i" class="star" :class="{ active: i <= item.rating }">★</span>
        </div>
      </div>
      <div class="eval-content">
        <div class="eval-product">
          <img :src="`http://localhost:8080/products/${item.product?.image}`" class="eval-product-img" />
          <span>{{ item.product?.name }}</span>
        </div>
        <p class="eval-text">{{ item.content }}</p>
        <div v-if="item.reply" class="eval-reply">
          <span class="reply-label">卖家回复：</span>
          <span>{{ item.reply }}</span>
        </div>
      </div>
    </div>
  </div>
</div>

<div v-else-if="evaluationLoaded" class="empty-eval">
  ⭐ 暂无评价
</div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const sellerId = route.params.id  // 卖家ID

const seller = ref({})
const sellerGoods = ref([])

// 图片加载失败处理
const handleAvatarError = (e) => {
  e.target.src = 'http://localhost:8080/avatar/default.jpg'
}

const handleImageError = (e) => {
  e.target.src = 'http://localhost:8080/products/default.jpg'
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
// 评价相关
const evaluationList = ref([])
const evaluationTotal = ref(0)
const goodRate = ref(0)
const evaluationLoaded = ref(false)

// 获取卖家评价
const getSellerEvaluations = async () => {
  try {
    const res = await axios.get(`http://localhost:8080/evaluation/seller/${sellerId}`)
    if (res.data.code === 200) {
      evaluationList.value = res.data.data.list || []
      evaluationTotal.value = res.data.data.total || 0
      goodRate.value = res.data.data.goodRate || 0
    }
  } catch (err) {
    console.error('获取评价失败', err)
  } finally {
    evaluationLoaded.value = true
  }
}

// 格式化日期
const formatDate = (time) => {
  if (!time) return ''
  const date = new Date(time)
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`
}

// 获取卖家信息和商品
const getSellerInfo = async () => {
  try {
    // 1. 获取所有商品
    const res = await axios.get('http://localhost:8080/product/list')
    const all = res.data.data || []
    
    // 2. ✅ 修复：用 p.user.id 匹配卖家ID
    const list = all.filter(p => p.user && p.user.id == sellerId)
    sellerGoods.value = list
    
    // 3. 获取卖家信息（从第一个商品中取）
    if (list.length > 0 && list[0].user) {
      seller.value = list[0].user
    } else {
      // 如果该卖家没有商品，单独查询用户信息
      try {
        const userRes = await axios.get(`http://localhost:8080/user/${sellerId}`)
        if (userRes.data && userRes.data.data) {
          seller.value = userRes.data.data
        }
      } catch (err) {
        console.error('获取卖家信息失败', err)
      }
    }
    
    console.log('卖家信息:', seller.value)
    console.log('卖家商品数量:', sellerGoods.value.length)
  } catch (err) {
    console.error('获取数据失败', err)
  }
}
// 计算年龄（加在 script 里，其他函数旁边）
const getAge = (birthDate) => {
  if (!birthDate) return '?'
  const birth = new Date(birthDate)
  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  const monthDiff = now.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age--
  }
  return age
}

const toDetail = (id) => {
  router.push(`/product/detail/${id}`)
}

// 在 onMounted 中调用
onMounted(() => {
  getSellerInfo()
  getSellerEvaluations()  // 添加这行
})


</script>

<style scoped>
.seller-page {
  min-height: 100vh;
  background: linear-gradient(145deg, #e8f4ff 0%, #d4e8ff 100%);
  padding: 20px;
  padding-top: 0;
  margin-top: 0;
}

.back-bar {
  margin-bottom: 24px;
  margin-top: 16px;
}

.back-bar button {
  padding: 8px 20px;
  background: rgba(37, 99, 235, 0.1);
  border: none;
  border-radius: 30px;
  color: #2563eb;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.back-bar button:hover {
  background: rgba(37, 99, 235, 0.2);
  transform: translateX(-2px);
}

.seller-card {
  display: flex;
  align-items: center;
  gap: 24px;
  background: white;
  padding: 24px;
  border-radius: 28px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(37, 99, 235, 0.1);
}

.avatar {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.seller-card h3 {
  margin: 0 0 8px 0;
  font-size: 22px;
  font-weight: 600;
  color: #1f2937;
}

.auth-tag {
  background: linear-gradient(135deg, #2563eb, #1e40af);
  color: white;
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 20px;
  font-weight: 500;
}

.seller-card p {
  margin: 6px 0;
  font-size: 14px;
  color: #4b5563;
}

.seller-card p:first-of-type {
  margin-top: 8px;
}

.goods-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
  padding-left: 12px;
  border-left: 4px solid #2563eb;
  color: #1f2937;
}

.goods-list {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
}

.goods-item {
  width: 170px;
  background: white;
  padding: 14px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(37, 99, 235, 0.08);
}

.goods-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.1);
}

.goods-img {
  width: 100%;
  height: 140px;
  object-fit: cover;
  border-radius: 14px;
}

.name { 
  margin: 10px 0 6px;
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.price { 
  color: #2563eb;
  font-weight: bold;
  font-size: 16px;
}

.empty { 
  text-align: center;
  color: #6b7280;
  padding: 60px;
  background: white;
  border-radius: 24px;
  font-size: 16px;
  border: 1px solid rgba(37, 99, 235, 0.08);
}

/* 评价模块 */
.evaluation-section {
  margin-top: 30px;
  background: white;
  border-radius: 28px;
  padding: 24px;
  border: 1px solid rgba(37, 99, 235, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.rate-summary {
  text-align: right;
}

.rate-score {
  font-size: 28px;
  font-weight: bold;
  color: #2563eb;
}

.rate-label {
  font-size: 14px;
  color: #6b7280;
  margin-left: 6px;
}

.rate-count {
  font-size: 12px;
  color: #9ca3af;
  margin-left: 6px;
}

.evaluation-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.evaluation-item {
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 16px;
}

.evaluation-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.eval-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 12px;
}

.eval-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
}

.eval-user {
  flex: 1;
}

.eval-name {
  font-weight: 600;
  color: #1f2937;
  font-size: 14px;
}

.eval-time {
  font-size: 11px;
  color: #9ca3af;
  margin-top: 2px;
}

/* 修复星星样式 - 覆盖全局背景星星 */
.eval-stars {
  display: flex;
  gap: 4px;
}

.eval-stars .star {
  font-size: 16px !important;
  color: #d1d5db !important;
  background: transparent !important;
  position: static !important;
  animation: none !important;
  box-shadow: none !important;
  width: auto !important;
  height: auto !important;
  display: inline-block !important;
  border-radius: 0 !important;
  margin: 0 !important;
  padding: 0 !important;
}

.eval-stars .star.active {
  color: #fbbf24 !important;
}

.eval-content {
  padding-left: 58px;
}

.eval-product {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  padding: 8px 12px;
  background: #f8fafc;
  border-radius: 12px;
  display: inline-flex;
}

.eval-product-img {
  width: 30px;
  height: 30px;
  border-radius: 6px;
  object-fit: cover;
}

.eval-product span {
  font-size: 12px;
  color: #6b7280;
}

.eval-text {
  font-size: 14px;
  color: #4b5563;
  line-height: 1.5;
  margin-bottom: 8px;
}

.eval-reply {
  padding: 10px 14px;
  background: #eff6ff;
  border-radius: 12px;
  font-size: 13px;
  margin-top: 8px;
}

.reply-label {
  color: #2563eb;
  font-weight: 600;
  margin-right: 6px;
}

.empty-eval {
  text-align: center;
  padding: 40px;
  background: white;
  border-radius: 28px;
  color: #9ca3af;
  margin-top: 20px;
  border: 1px solid rgba(37, 99, 235, 0.08);
}
</style>