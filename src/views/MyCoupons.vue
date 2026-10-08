<template>
  <div class="my-coupons-page">
   
    <div class="page-container">
      <div class="header">
        <div class="back" @click="$router.back()">
          <span class="back-icon">←</span> 返回
        </div>
        <h2>🎫 我的优惠券</h2>
        <div class="header-placeholder"></div>
      </div>

      <div v-if="loading" class="loading">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>
      
      <div v-else-if="couponList.length === 0" class="empty">
        <div class="empty-icon">🎁</div>
        <p>暂无优惠券</p>
        <a @click="goToGiftPack">去抽奖</a>
      </div>
      
      <div v-else class="coupon-list">
        <div class="coupon-card" v-for="item in couponList" :key="item.id" :class="getCouponClass(item.coupon)">
          <div class="coupon-left">
            <div class="coupon-value">
              <span v-if="item.coupon.type === 'discount'">
                {{ (item.coupon.value * 10).toFixed(1) }}折
              </span>
              <span v-else-if="item.coupon.type === 'cash'">
                ¥{{ item.coupon.value }}
              </span>
              <span v-else>
                🎉 免单
              </span>
            </div>
            <div class="coupon-condition" v-if="item.coupon.minAmount > 0">
              满¥{{ item.coupon.minAmount }}可用
            </div>
          </div>
          <div class="coupon-right">
            <div class="coupon-name">{{ item.coupon.name }}</div>
            <div class="coupon-expire">
              <span class="expire-label">有效期至</span>
              {{ formatDate(item.expireTime) }}
            </div>
            <button class="use-btn" @click="useCoupon(item.coupon)">立即使用 →</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const couponList = ref([])
const loading = ref(false)

const loadCoupons = async () => {
  loading.value = true
  try {
    const res = await axios.get('http://localhost:8080/coupon/my', {
      withCredentials: true
    })
    couponList.value = res.data.data || []
  } catch (err) {
    console.error('加载优惠券失败', err)
  } finally {
    loading.value = false
  }
}

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getFullYear()}.${(d.getMonth()+1).toString().padStart(2,'0')}.${d.getDate().toString().padStart(2,'0')}`
}

const getCouponClass = (coupon) => {
  if (coupon.type === 'discount') {
    if (coupon.value === 0) return 'coupon-free'
    return 'coupon-discount'
  }
  return 'coupon-cash'
}
//星星随机生成样式
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

const useCoupon = (coupon) => {
  router.push({
    path: '/giftPack',
    query: {
      type: 'graduation',
      couponId: coupon.id,
      couponValue: coupon.value,
      couponType: coupon.type,
      couponMinAmount: coupon.minAmount
    }
  })
}

const goToGiftPack = () => {
  router.push('/giftPack?type=graduation')
}

onMounted(() => {
  loadCoupons()
})
</script>

<style scoped>
.my-coupons-page {
  min-height: 100vh;
  background: linear-gradient(145deg, #e8f4ff 0%, #d4e8ff 100%);
  padding: 20px;
  padding-top: 0;
  margin-top: 0;
}

.page-container {
  max-width: 1000px;
  margin: 0 auto;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  margin-top: 16px;
  color: #1f2937;
}

.back {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  padding: 8px 16px;
  background: rgba(37, 99, 235, 0.1);
  border-radius: 30px;
  transition: all 0.3s;
  color: #2563eb;
}

.back:hover {
  background: rgba(37, 99, 235, 0.2);
  transform: translateX(-2px);
}

.back-icon {
  font-size: 16px;
}

.header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
}

.header-placeholder {
  width: 70px;
}

/* 优惠券列表 */
.coupon-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.coupon-card {
  display: flex;
  border-radius: 20px;
  overflow: hidden;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  transition: all 0.3s;
  width: 100%;
  border: 1px solid rgba(37, 99, 235, 0.08);
}

.coupon-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.1);
}

/* 优惠券左侧 */
.coupon-left {
  width: 150px;
  padding: 20px 12px;
  text-align: center;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.coupon-discount .coupon-left {
  background: linear-gradient(135deg, #2563eb, #1e40af);
}

.coupon-cash .coupon-left {
  background: linear-gradient(135deg, #10b981, #059669);
}

.coupon-free .coupon-left {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.coupon-value {
  font-size: 28px;
  font-weight: bold;
  line-height: 1.2;
}

.coupon-condition {
  font-size: 10px;
  margin-top: 6px;
  opacity: 0.9;
}

/* 优惠券右侧 */
.coupon-right {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: white;
}

.coupon-name {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
}

.coupon-expire {
  font-size: 11px;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 6px;
}

.expire-label {
  color: #9ca3af;
}

.use-btn {
  align-self: flex-end;
  background: linear-gradient(135deg, #2563eb, #1e40af);
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 30px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.3s;
  margin-top: 4px;
}

.use-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
}

/* 加载和空状态 */
.loading, .empty {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 24px;
  color: #9ca3af;
  border: 1px solid rgba(37, 99, 235, 0.08);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top-color: #2563eb;
  border-radius: 50%;
  margin: 0 auto 16px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty a {
  color: #2563eb;
  cursor: pointer;
  text-decoration: none;
  font-weight: 500;
}

.empty a:hover {
  text-decoration: underline;
}
</style>