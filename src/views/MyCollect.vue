<template>
  <div class="my-collect">
    
    <div class="collect-container">
      <!-- 头部 -->
      <div class="collect-header">
        <div class="back" @click="$router.back()">
          <span class="back-icon">←</span> 返回
        </div>
        <h2>⭐ 我的收藏</h2>
        <div class="header-placeholder"></div>
      </div>

      <!-- 收藏列表 -->
      <div v-if="collectList.length === 0" class="empty-collect">
        <div class="empty-icon">⭐</div>
        <p>还没有收藏任何商品</p>
        <button class="go-shop-btn" @click="$router.push('/productHome')">去逛逛</button>
      </div>

      <div v-else class="collect-list">
        <div class="collect-item" v-for="item in collectList" :key="item.id">
          <!-- 点击商品区域跳转详情 -->
          <div class="item-content" @click="goToDetail(item.product.id)">
            <img 
              :src="`${API_BASE}/products/${item.product.image}`" 
              class="item-img"
              @error="handleImageError"
            >
            <div class="item-info">
              <h4>{{ item.product.name }}</h4>
              <div class="item-price">¥{{ item.product.price }}</div>
              <div class="item-seller">
                <img :src="`${API_BASE}/avatar/${item.product.user?.avatar || 'default.jpg'}`" class="seller-avatar" />
                <span>{{ item.product.user?.username || '匿名用户' }}</span>
              </div>
            </div>
          </div>
          <!-- 取消收藏按钮，阻止冒泡避免触发展开 -->
          <button class="cancel-btn" @click.stop="del(item.id)">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
            取消收藏
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'  // 添加这行
import axios from 'axios'

const router = useRouter()  // 添加这行

const collectList = ref([])
const userId = sessionStorage.getItem('userId')

// 跳转到商品详情页
// 跳转到商品详情页
const goToDetail = (productId) => {
  router.push(`/product/detail/${productId}`)
}
const handleImageError = (e) => {
  e.target.src = `\${API_BASE}/products/default.jpg`
}

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

onMounted(() => {
  axios.get(`\${API_BASE}/product/collect/my`, {
    params: { userId }
  }).then(res => {
    collectList.value = res.data.data || []
  })
})

const del = (id) => {
  axios.get(`\${API_BASE}/product/collect/deleteCollect`, {
    params: { id }
  }).then(() => {
    collectList.value = collectList.value.filter(i => i.id !== id)
  })
}
</script>

<style scoped>
.my-collect {
  min-height: 100vh;
  background: linear-gradient(145deg, #e8f4ff 0%, #d4e8ff 100%);
  padding: 20px;
  padding-top: 0;
  margin-top: 0;
}

.collect-container {
  max-width: 1000px;
  margin: 0 auto;
}

/* 头部 */
.collect-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  margin-top: 16px;
}

.back {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  font-size: 14px;
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

.collect-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
}

.header-placeholder {
  width: 70px;
}

/* 收藏列表 */
.collect-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.collect-item {
  display: flex;
  align-items: center;
  gap: 16px;
  background: white;
  padding: 16px;
  border-radius: 20px;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(37, 99, 235, 0.08);
}

.collect-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.1);
}

.item-img {
  width: 90px;
  height: 90px;
  border-radius: 14px;
  object-fit: cover;
  flex-shrink: 0;
}

.item-info {
  flex: 1;
}

.item-info h4 {
  margin: 0 0 6px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.item-price {
  color: #2563eb;
  font-weight: bold;
  font-size: 18px;
  margin-bottom: 6px;
}

.item-seller {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #6b7280;
}

.seller-avatar {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  object-fit: cover;
}

.cancel-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: 1px solid #ef4444;
  color: #ef4444;
  padding: 8px 16px;
  border-radius: 30px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.3s;
  flex-shrink: 0;
}

.cancel-btn:hover {
  background: #ef4444;
  color: white;
}

/* 空状态 */
.empty-collect {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(37, 99, 235, 0.08);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-collect p {
  color: #6b7280;
  margin-bottom: 20px;
}

.go-shop-btn {
  background: linear-gradient(135deg, #2563eb, #1e40af);
  color: white;
  border: none;
  padding: 10px 30px;
  border-radius: 30px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.go-shop-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

/* 商品内容区域 - 可点击 */
.item-content {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 15px;
  cursor: pointer;
  transition: all 0.2s;
}

.item-content:hover {
  opacity: 0.8;
}
</style>