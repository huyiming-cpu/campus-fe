<template>
  <div class="gift-pack-detail" :class="pageClass" v-if="giftPack.id">
  <div class="star-bg">
      <div v-for="i in 100" :key="i" class="star" :style="getStarStyle(i)"></div>
    </div>
    <div class="back-bar">
      <button @click="$router.back()">← 返回</button>
    </div>

    <div class="detail-container">
      <!-- 封面图（2x2网格） -->
      <div class="cover-section">
        <div class="cover-grid" v-if="giftPack.products && giftPack.products.length >= 4">
          <div class="grid-item" v-for="(p, idx) in giftPack.products.slice(0,4)" :key="idx">
            <img :src="`http://localhost:8080/products/${p.image}`" />
          </div>
        </div>
        <img v-else :src="`http://localhost:8080/products/${giftPack.products?.[0]?.image || 'default.jpg'}`" class="cover-img" />
        <div class="discount-badge">{{ giftPack.type === 'graduation' ? '8.5折' : '9折' }}</div>
      </div>

      <!-- 信息区 -->
      <div class="info-section">
        <h1>{{ giftPack.name }}</h1>
        <p class="desc">{{ giftPack.description }}</p>
        
        <div class="price-section">
          <div class="original-price">原价 ¥{{ originalTotal.toFixed(2) }}</div>
          <div class="discount-price">礼包价 ¥{{ discountTotal.toFixed(2) }}</div>
          <div class="save">省 ¥{{ (originalTotal - discountTotal).toFixed(2) }}</div>
        </div>

        <!-- 卖家信息 -->
        <div class="seller-info" @click="goToSeller">
          <img :src="`http://localhost:8080/avatar/${giftPack.seller?.avatar || 'default.jpg'}`" class="seller-avatar" />
          <div>
            <div class="seller-name">{{ giftPack.seller?.username }}</div>
            <div class="seller-credit">信用：{{ giftPack.seller?.creditLevel || '普通' }}</div>
          </div>
        </div>

        <!-- 商品列表 -->
        <div class="products-title">📦 礼包包含商品</div>
        <div class="products-list">
          <div class="product-item" v-for="product in giftPack.products" :key="product.id">
            <img :src="`http://localhost:8080/products/${product.image}`" class="product-img" />
            <div class="product-info">
              <div class="product-name">{{ product.name }}</div>
              <div class="product-price">¥{{ product.price }}</div>
              <div class="product-desc">{{ product.info?.substring(0, 60) }}...</div>
            </div>
          </div>
        </div>

        <!-- 按钮 -->
        <div class="action-buttons" v-if="giftPack.seller?.id != currentUserId">
          <button class="chat-btn" @click="goToChat">💬 聊一聊</button>
          <button class="buy-btn" @click="goToBuy">💰 立即购买</button>
        </div>
        
        <div v-else class="self-tip">
          ⚠️ 这是您自己的礼包，不能购买
        </div>
        <div class="owner-actions" v-if="giftPack.seller?.id == currentUserId">
          <button class="delete-btn" @click="deletePack">🗑 删除礼包</button>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="loading">加载中...</div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const giftPackId = route.params.id
const type = route.query.type || 'graduation'
const giftPack = ref({})
const currentUserId = sessionStorage.getItem("userId")

const pageClass = computed(() => type === 'graduation' ? 'graduation-page' : 'freshman-page')

const originalTotal = computed(() => {
  if (!giftPack.value.products) return 0
  return giftPack.value.products.reduce((sum, p) => sum + p.price, 0)
})

const discountTotal = computed(() => {
  return originalTotal.value * (giftPack.value.discount || 1)
})
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
const loadDetail = async () => {
  try {
    const res = await axios.get(`http://localhost:8080/giftPack/detail/${giftPackId}`, {
      withCredentials: true
    })
    giftPack.value = res.data.data
  } catch (err) {
    console.error('加载失败', err)
    alert('礼包不存在')
  }
}

const deletePack = async () => {
  if (!confirm('确定删除该礼包吗？')) return
  try {
    const res = await axios.delete(`http://localhost:8080/giftPack/delete/${giftPackId}`, {
      withCredentials: true
    })
    if (res.data.code === 200) {
      alert('删除成功')
      router.push('/giftPack?type=' + type)
    } else {
      alert(res.data.msg)
    }
  } catch (err) {
    alert('删除失败')
  }
}

const goToSeller = () => {
  if (giftPack.value.seller?.id) {
    router.push(`/seller/${giftPack.value.seller.id}`)
  }
}

const goToChat = () => {
  if (!giftPack.value.seller?.id) return
  router.push({
    path: '/chat',
    query: { sellerId: giftPack.value.seller.id }
  })
}

const goToBuy = () => {
  const productsParam = giftPack.value.products.map(p => ({
    productId: p.id,
    productName: p.name,
    productPrice: p.price,
    productImage: p.image
  }))
  
  sessionStorage.setItem('giftPackProducts', JSON.stringify(productsParam))
  
  router.push({
    path: '/create-order',
    query: {
      type: 'giftPack',
      giftPackId: giftPack.value.id,
      totalAmount: discountTotal.value,
      sellerId: giftPack.value.seller?.id,
      discount: giftPack.value.discount
    }
  })
}

onMounted(() => {
  loadDetail()
})
</script>

<style scoped>
.gift-pack-detail {
  min-height: 100vh;
  padding: 20px;
}
.star-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;
  pointer-events: none;
}

.star {
  position: absolute;
  background: white;
  border-radius: 50%;
  animation: twinkle 2s infinite alternate;
  box-shadow: 0 0 4px rgba(255,255,255,0.8);
}

@keyframes twinkle {
  0% {
    opacity: 0.2;
    transform: scale(1);
  }
  100% {
    opacity: 1;
    transform: scale(1.2);
  }
}

/* 确保内容在星星上面 */
.gift-pack-detail > *:not(.star-bg) {
  position: relative;
  z-index: 1;
}

.graduation-page {
  background: linear-gradient(135deg, #1a237e 0%, #283593 100%);
}

.freshman-page {
  background: linear-gradient(135deg, #43a047 0%, #2e7d32 100%);
}

.back-bar {
  margin-bottom: 24px;
}

.back-bar button {
  padding: 8px 20px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: none;
  border-radius: 30px;
  color: white;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.back-bar button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateX(-2px);
}

.detail-container {
  display: flex;
  gap: 50px;
  flex-wrap: wrap;
}

.cover-section {
  flex: 1;
  min-width: 350px;
  position: relative;
}

.cover-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  width: 100%;
  aspect-ratio: 1 / 1;
  gap: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
}

.grid-item {
  overflow: hidden;
}

.grid-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.grid-item:hover img {
  transform: scale(1.05);
}

.cover-img {
  width: 100%;
  border-radius: 24px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
}

.discount-badge {
  position: absolute;
  top: 20px;
  right: 20px;
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: white;
  padding: 8px 18px;
  border-radius: 40px;
  font-size: 18px;
  font-weight: bold;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.info-section {
  flex: 2;
  color: white;
}

.info-section h1 {
  margin: 0 0 12px 0;
  font-size: 32px;
  font-weight: 700;
}

.desc {
  font-size: 15px;
  opacity: 0.9;
  margin-bottom: 25px;
  line-height: 1.6;
}

.price-section {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 20px 25px;
  margin-bottom: 25px;
}

.original-price {
  font-size: 15px;
  text-decoration: line-through;
  opacity: 0.7;
}

.discount-price {
  font-size: 36px;
  font-weight: bold;
  margin: 8px 0;
  color: #ffd700;
}

.save {
  font-size: 14px;
  color: #ffd700;
}

.seller-info {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  margin-bottom: 25px;
  cursor: pointer;
  transition: all 0.3s;
}

.seller-info:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateX(5px);
}

.seller-avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid white;
}

.seller-name {
  font-weight: bold;
  font-size: 17px;
  margin-bottom: 4px;
}

.seller-credit {
  font-size: 12px;
  opacity: 0.8;
}

.products-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 18px;
}

.products-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 35px;
}

.product-item {
  display: flex;
  gap: 16px;
  padding: 14px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  align-items: center;
  transition: all 0.3s;
}

.product-item:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateX(5px);
}

.product-img {
  width: 75px;
  height: 75px;
  border-radius: 14px;
  object-fit: cover;
  flex-shrink: 0;
}

.product-info {
  flex: 1;
}

.product-name {
  font-weight: 600;
  margin-bottom: 6px;
  font-size: 16px;
}

.product-price {
  color: #ffd700;
  font-size: 15px;
  font-weight: 500;
}

.product-desc {
  font-size: 12px;
  opacity: 0.7;
  margin-top: 5px;
}

.action-buttons {
  display: flex;
  gap: 16px;
}

.chat-btn, .buy-btn {
  flex: 1;
  padding: 14px 20px;
  border: none;
  border-radius: 50px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.chat-btn {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  color: white;
}

.chat-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.buy-btn {
  background: linear-gradient(135deg, #ff9f00, #ff6b00);
  color: white;
  box-shadow: 0 4px 15px rgba(255, 107, 0, 0.3);
}

.buy-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 107, 0, 0.4);
}

.self-tip {
  text-align: center;
  padding: 14px 20px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 50px;
  color: #ffd700;
  font-size: 14px;
}

.owner-actions {
  margin-top: 16px;
}

.delete-btn {
  width: 100%;
  padding: 14px 20px;
  border: none;
  border-radius: 50px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  background: rgba(255, 77, 79, 0.8);
  backdrop-filter: blur(10px);
  color: white;
  transition: all 0.3s;
}

.delete-btn:hover {
  background: #ff4d4f;
  transform: translateY(-2px);
}

.loading {
  text-align: center;
  padding: 50px;
  font-size: 18px;
  color: rgba(255, 255, 255, 0.7);
}

@media (max-width: 768px) {
  .detail-container {
    flex-direction: column;
  }
  .cover-section {
    min-width: auto;
  }
  .info-section h1 {
    font-size: 24px;
  }
  .discount-price {
    font-size: 28px;
  }
}
</style>