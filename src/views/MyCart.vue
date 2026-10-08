<template>
  <div class="my-cart">
     
      <div class="cart-container">
      <!-- 头部 -->
      <div class="cart-header">
        <div class="back" @click="$router.back()">
          <span class="back-icon">←</span> 返回
        </div>
        <h2>🛒 我的购物车</h2>
        <div class="header-placeholder"></div>
      </div>

      <!-- 全选栏 -->
      <div class="select-all">
        <label class="checkbox-label">
          <input type="checkbox" v-model="selectAll" @change="toggleSelectAll" />
          <span class="checkmark"></span>
          <span>全选</span>
        </label>
        <span class="selected-count">已选 {{ selectedIds.length }} 件</span>
      </div>

      <!-- 商品列表 -->
      <div v-if="cartList.length === 0" class="empty-cart">
        <div class="empty-icon">🛒</div>
        <p>购物车还是空的</p>
        <button class="go-shop-btn" @click="$router.push('/productHome')">去逛逛</button>
      </div>

      <div v-else class="cart-list">
        <div class="cart-item" v-for="item in cartList" :key="item.id" :class="{ invalid: item.product?.status !== 0 }">
          <label class="item-checkbox">
            <input type="checkbox" v-model="selectedIds" :value="item.id" :disabled="item.product?.status !== 0" />
            <span class="checkmark"></span>
          </label>
          
          <img :src="`${API_BASE}/products/${item.product?.image}`" class="item-img" @error="handleImageError" />
          
          <div class="item-info">
            <h4>{{ item.product?.name }}</h4>
            <div class="item-price">¥{{ item.product?.price }}</div>
            <div v-if="item.product?.status !== 0" class="invalid-tag">已失效</div>
          </div>
          
          <button class="delete-btn" @click="del(item.id)">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- 底部结算 -->
      <div class="cart-footer" v-if="cartList.length > 0">
        <div class="total-info">
          <span class="total-label">合计</span>
          <span class="total-price">¥{{ selectedTotal }}</span>
        </div>
        <button class="checkout-btn" @click="goToCheckout" :disabled="selectedIds.length === 0">
          去结算 ({{ selectedIds.length }})
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080'
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const cartList = ref([])
const userId = sessionStorage.getItem('userId')
const selectedIds = ref([])
const selectAll = ref(false)

const validItems = computed(() => {
  return cartList.value.filter(item => item.product?.status === 0)
})

const selectedTotal = computed(() => {
  return cartList.value
    .filter(item => selectedIds.value.includes(item.id) && item.product?.status === 0)
    .reduce((sum, item) => sum + (item.product?.price || 0), 0)
    .toFixed(2)
})

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


const handleImageError = (e) => {
  e.target.src = `${API_BASE}/products/default.jpg`
}

const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedIds.value = validItems.value.map(item => item.id)
  } else {
    selectedIds.value = []
  }
}

const updateSelectAll = () => {
  const validIds = validItems.value.map(item => item.id)
  selectAll.value = selectedIds.value.length === validIds.length && validIds.length > 0
}

onMounted(() => {
  axios.get(`${API_BASE}/product/cart/my`, {
    params: { userId }
  }).then(res => {
    cartList.value = res.data.data || []
    selectedIds.value = validItems.value.map(item => item.id)
    selectAll.value = true
  }).catch(err => {
    console.error('加载购物车失败', err)
  })
})

const del = (id) => {
  axios.get(`${API_BASE}/product/cart/delete`, {
    params: { id: id }
  }).then(() => {
    cartList.value = cartList.value.filter(c => c.id !== id)
    selectedIds.value = selectedIds.value.filter(sid => sid !== id)
    updateSelectAll()
  }).catch(err => {
    alert('删除失败')
  })
}

const goToCheckout = () => {
  const selectedValid = cartList.value.filter(item => 
    selectedIds.value.includes(item.id) && item.product?.status === 0
  )
  
  if (selectedValid.length === 0) return
  
  const sellerMap = new Map()
  for (const item of selectedValid) {
    const sellerId = item.product?.user?.id
    if (!sellerMap.has(sellerId)) {
      sellerMap.set(sellerId, {
        sellerId: sellerId,
        sellerName: item.product?.user?.username || '卖家',
        products: []
      })
    }
    sellerMap.get(sellerId).products.push({
      productId: item.product.id,
      productName: item.product.name,
      productPrice: item.product.price,
      productImage: item.product.image,
      sellerId: sellerId,
      cartId: item.id
    })
  }
  
  const checkoutGroups = Array.from(sellerMap.values())
  sessionStorage.setItem('checkoutGroups', JSON.stringify(checkoutGroups))
  router.push('/create-order')
}
</script>

<style scoped>
.my-cart {
  min-height: 100vh;
  background: linear-gradient(145deg, #e8f4ff 0%, #d4e8ff 100%);
  padding: 20px;
}

/* 云朵背景（可选，不要可删除） */
.my-cart {
  position: relative;
  overflow-x: hidden;
}

.cart-container {
  max-width: 1000px;
  margin: 0 auto;
}

/* 头部 */
.cart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  color: #1f2937;
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

.cart-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
}

.header-placeholder {
  width: 70px;
}

/* 全选栏 */
.select-all {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: white;
  border-radius: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(37, 99, 235, 0.1);
}

/* 自定义复选框容器 */
.item-checkbox .checkmark {
  width: 20px;
  height: 20px;
  border: 2px solid #d1d5db;
  border-radius: 6px;
  display: inline-block;
  position: relative;
  cursor: pointer;
  transition: all 0.2s;
}

.item-checkbox input:checked + .checkmark {
  background: linear-gradient(135deg, #2563eb, #1e40af);
  border-color: #2563eb;
}

.item-checkbox input:checked + .checkmark::after {
  content: "✓";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #4b5563;
}

.checkbox-label input {
  display: none;
}

.checkmark {
  width: 18px;
  height: 18px;
  border: 2px solid #d1d5db;
  border-radius: 6px;
  display: inline-block;
  position: relative;
  transition: all 0.2s;
}

.checkbox-label input:checked + .checkmark {
  background: linear-gradient(135deg, #2563eb, #1e40af);
  border-color: #2563eb;
}

.checkbox-label input:checked + .checkmark::after {
  content: "✓";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 11px;
}

.selected-count {
  font-size: 13px;
  color: #6b7280;
}

/* 商品列表 */
.cart-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background: white;
  padding: 16px;
  border-radius: 20px;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(37, 99, 235, 0.08);
}

.cart-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.1);
}

.cart-item.invalid {
  opacity: 0.6;
  background: #f9fafb;
}

.item-checkbox {
  flex-shrink: 0;
}

.item-checkbox input {
  display: none;
}

.item-checkbox .checkmark {
  width: 20px;
  height: 20px;
  border-radius: 8px;
  display: inline-block;
  cursor: pointer;
}

.item-img {
  width: 70px;
  height: 70px;
  border-radius: 12px;
  object-fit: cover;
  flex-shrink: 0;
}

.item-info {
  flex: 1;
}

.item-info h4 {
  margin: 0 0 6px 0;
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
}

.item-price {
  color: #2563eb;
  font-weight: bold;
  font-size: 16px;
}

.invalid-tag {
  display: inline-block;
  background: #f97316;
  color: white;
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 12px;
  margin-top: 6px;
}

.delete-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  color: #9ca3af;
}

.delete-btn:hover {
  background: #fee2e2;
  color: #ef4444;
}

/* 空购物车 */
.empty-cart {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(37, 99, 235, 0.1);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-cart p {
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

/* 底部结算 */
.cart-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 16px 20px;
  border-radius: 20px;
  margin-top: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(37, 99, 235, 0.1);
}

.total-info {
  display: flex;
  flex-direction: column;
}

.total-label {
  font-size: 12px;
  color: #6b7280;
}

.total-price {
  font-size: 24px;
  font-weight: bold;
  color: #2563eb;
}

.checkout-btn {
  background: linear-gradient(135deg, #2563eb, #1e40af);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 30px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  transition: all 0.3s;
}

.checkout-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
}

.checkout-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}
</style>