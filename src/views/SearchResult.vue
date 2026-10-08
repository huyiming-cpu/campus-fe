<template>
  <div class="search-page">
    <!-- 导航栏（与首页完全一致） -->
    <nav class="navbar">
      <div class="nav-container">
        <div class="logo" @click="toggleFilter">
          <span class="logo-icon">{{ showAll ? '🌍' : '🏫' }}</span>
          <span class="logo-text">校园宝</span>
        </div>
        <div class="nav-menu">
          <a href="#" @click.prevent="goToRecommend">首页</a>
          <a href="#" @click.prevent="goToCategory('学习用品')">学习用品</a>
          <a href="#" @click.prevent="goToCategory('生活用品')">生活用品</a>
          <a href="#" @click.prevent="goToCategory('数码产品')">数码产品</a>
          <a href="#" @click.prevent="goToCategory('服饰')">服饰</a>
          <a href="#" @click.prevent="goToCategory('运动器材')">运动器材</a>
          <a href="#" @click.prevent="goToCategory('小家电')">小家电</a>
          <a href="#" @click.prevent="goToCategory('交通出行')">交通出行</a>
          <a href="#" @click.prevent="goToCategory('其他')">其他</a>
        </div>
        <div class="nav-right">
          <div class="search-wrapper">
            <input 
              type="text" 
              v-model="searchKey" 
              placeholder="搜索商品..." 
              @input="onSearchInput"
              @keyup.enter="doSearch" 
            />
            <ul v-if="suggestions.length > 0" class="suggestions-list">
              <li v-for="item in suggestions" :key="item" @click="selectSuggestion(item)">
                🔍 {{ item }}
              </li>
            </ul>
          </div>
          <button @click="doSearch">搜索</button>
          <div class="user-actions" v-if="isLoggedIn">
            <img :src="getAvatarUrl(userAvatar)" class="user-avatar" @click="goMyCenter" />
            <span class="logout-btn" @click="goLogin">退出</span>
          </div>
          <div class="user-actions" v-else>
            <button class="login-btn" @click="goLogin">登录</button>
            <button class="register-btn" @click="goRegister">注册</button>
          </div>
        </div>
      </div>
    </nav>

    <!-- 搜索结果区域 -->
    <div class="search-result-section">
      <h3 class="result-title">搜索结果（共 {{ searchResultList.length }} 件）</h3>
      
      <!-- 排序栏（移到下面，与首页一致） -->
      <div class="sort-bar">
        <span class="sort-item" :class="{ active: sortType === 'default' }" @click="sortType = 'default'; applySort()">默认</span>
        <span class="sort-item" :class="{ active: sortType === 'price_asc' }" @click="sortType = 'price_asc'; applySort()">价格 ↑</span>
        <span class="sort-item" :class="{ active: sortType === 'price_desc' }" @click="sortType = 'price_desc'; applySort()">价格 ↓</span>
      </div>

      <div class="product-grid">
        <div class="product-card" v-for="item in displayList" :key="item.id" @click="goDetail(item.id)">
          <div class="product-image">
            <img :src="`${API_BASE}/products/${item.image}`" @error="handleImageError" />
            <span v-if="item.hot === 1" class="hot-badge">🔥 热门</span>
          </div>
          <div class="product-info">
            <h3 class="product-name">{{ item.name }}</h3>
            <div class="product-footer">
              <span class="product-price">¥{{ item.price }}</span>
              <div class="seller-info">
                <img :src="getAvatarUrl(item.user?.avatar)" class="seller-avatar" />
                <span class="seller-name">{{ item.user?.username || '匿名' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="displayList.length === 0" class="empty-state">暂无商品</div>
    </div>
  </div>
</template>

<script setup>
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080'
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const searchKey = ref('')
const productList = ref([])
const searchResultList = ref([])
const userId = sessionStorage.getItem("userId")
const isLoggedIn = ref(false)
const userAvatar = ref('')

// 检查登录状态
const checkLoginStatus = () => {
  const user = sessionStorage.getItem("loginUser")
  if (user) {
    isLoggedIn.value = true
    const userData = JSON.parse(user)
    userAvatar.value = userData.avatar
  }
}

const getAvatarUrl = (avatar) => {
  if (!avatar) return `\${API_BASE}/avatar/default.jpg`
  return `${API_BASE}/avatar/${avatar}`
}

const goRegister = () => {
  router.push('/register')
}

document.onkeydown = (e) => {
  if (e.key === 'Escape') {
    window.history.back()
    setTimeout(() => window.location.reload(), 100)
  }
}

const sortType = ref('default')
const displayList = ref([])
const showAll = ref(false)

const toggleFilter = () => {
  showAll.value = !showAll.value
  if (searchResultListOriginal.value.length > 0) {
    applyFilter()
  }
}

const suggestions = ref([])
let searchTimer = null

const onSearchInput = async () => {
  const keyword = searchKey.value.trim()
  if (keyword.length < 1) {
    suggestions.value = []
    return
  }
  
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(async () => {
    try {
      const res = await axios.get(`\${API_BASE}/product/search/suggest`, {
        params: { keyword }
      })
      suggestions.value = res.data.data || []
    } catch (err) {
      console.error('获取联想失败', err)
      suggestions.value = []
    }
  }, 200)
}

const selectSuggestion = (item) => {
  searchKey.value = item
  suggestions.value = []
  doSearch()
}

const searchResultListOriginal = ref([])

const applyFilter = () => {
  const currentUserId = sessionStorage.getItem("userId")
  let filtered = [...searchResultListOriginal.value]
  
  filtered = filtered.filter(item => item.user?.id != currentUserId)
  
  if (!showAll.value) {
    const myUniversity = sessionStorage.getItem("university")
    filtered = filtered.filter(item => item.user?.university === myUniversity)
  }
  
  searchResultList.value = filtered
  applySort()
}

const doSearch = () => {
  const key = searchKey.value.trim().toLowerCase()
  if (!key || !userId) {
    searchResultListOriginal.value = []
    searchResultList.value = []
    displayList.value = []
    return
  }

  const result = productList.value.filter(item =>
    (item.name || '').toLowerCase().includes(key)
  )
  
  searchResultListOriginal.value = result
  applyFilter()
  
  const old = JSON.parse(localStorage.getItem("searchedItems_" + userId)) || []
  const existIds = new Set(old.map(x => x.id))
  const toAdd = result.filter(x => !existIds.has(x.id)).slice(0, 3)
  const final = [...old, ...toAdd]
  localStorage.setItem("searchedItems_" + userId, JSON.stringify(final))
}

const applySort = () => {
  let list = [...searchResultList.value]
  if (sortType.value === 'price_asc') {
    list.sort((a, b) => a.price - b.price)
  } else if (sortType.value === 'price_desc') {
    list.sort((a, b) => b.price - a.price)
  } else {
    list = [...searchResultList.value]
  }
  displayList.value = list
}

const getProductList = async () => {
  try {
    const res = await axios.get(`\${API_BASE}/product/list`)
    productList.value = res.data.data
    console.log('商品列表加载成功:', productList.value)
  } catch (err) {
    console.error('加载商品列表失败:', err)
  }
}

onMounted(() => {
  checkLoginStatus()
  getProductList().then(() => {
    const key = route.query.key
    if (key) {
      searchKey.value = decodeURIComponent(key)
      doSearch()
    }
  })
})

const goDetail = (id) => {
  if (!id) {
    console.error('商品ID为空，无法跳转')
    return
  }
  console.log('跳转到商品详情，ID:', id)
  router.push(`/product/detail/${id}`)
}

const goToRecommend = () => {
  router.push('/productHome')
}

const goToCategory = (type) => {
  router.push(`/productHome?type=${type}`)
}

const goMyCenter = () => router.push('/myCenter')
const goLogin = () => {
  sessionStorage.clear()
  router.push('/login')
}

const handleImageError = (e) => {
  e.target.src = `\${API_BASE}/products/default.jpg`
}
</script>

<style scoped>
.search-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f0f4ff 0%, #ffffff 100%);
}

/* 导航栏 */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.05);
  z-index: 1000;
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 5%;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  flex-shrink: 0;
}

.logo-icon {
  font-size: 28px;
}

.logo-text {
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, #2563eb, #1e40af);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.nav-menu {
  display: flex;
  gap: 24px;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding: 0 20px;
}

.nav-menu::-webkit-scrollbar {
  display: none;
}

.nav-menu a {
  text-decoration: none;
  color: #4b5563;
  font-weight: 500;
  transition: color 0.2s;
  white-space: nowrap;
  font-size: 15px;
  cursor: pointer;
}

.nav-menu a:hover {
  color: #2563eb;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

/* 搜索框容器（带联想） */
.search-wrapper {
  position: relative;
}

.search-wrapper input {
  width: 180px;
  height: 40px;
  padding: 0 16px;
  border: 1px solid #e5e7eb;
  border-radius: 40px;
  background: #f9fafb;
  font-size: 14px;
  outline: none;
  transition: all 0.2s;
}

.search-wrapper input:focus {
  border-color: #2563eb;
  background: white;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

/* 联想下拉列表 */
.suggestions-list {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  margin-top: 8px;
  padding: 8px 0;
  list-style: none;
  z-index: 1000;
  max-height: 250px;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.suggestions-list li {
  padding: 10px 16px;
  cursor: pointer;
  font-size: 14px;
  color: #1f2937;
  transition: background 0.2s;
}

.suggestions-list li:hover {
  background: #f3f4f6;
}

.nav-right button {
  height: 40px;
  padding: 0 24px;
  background: linear-gradient(135deg, #2563eb, #1e40af);
  color: white;
  border: none;
  border-radius: 40px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  white-space: nowrap;
}

.nav-right button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}
/* 排序栏 */
.sort-bar {
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  margin-bottom: 24px;
  padding: 0 20px;
}

.sort-item {
  cursor: pointer;
  color: #6b7280;
  transition: color 0.2s;
  font-size: 14px;
}

.sort-item:hover,
.sort-item.active {
  color: #2563eb;
  font-weight: 500;
}
/* 排序下拉 */
.sort-select {
  height: 40px;
  padding: 0 16px;
  border: 1px solid #e5e7eb;
  border-radius: 40px;
  background: white;
  cursor: pointer;
  font-size: 13px;
  color: #4b5563;
  outline: none;
  transition: all 0.2s;
}

.sort-select:hover {
  border-color: #2563eb;
}

.sort-select:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  object-fit: cover;
}

.logout-btn {
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  color: #ef4444;
  transition: all 0.2s;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.1);
}

.login-btn, .register-btn {
  padding: 8px 20px;
  border-radius: 30px;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
}

.login-btn {
  background: transparent;
  border: 1px solid #2563eb;
  color: #2563eb;
}

.register-btn {
  background: linear-gradient(135deg, #2563eb, #1e40af);
  border: none;
  color: white;
}

/* 搜索结果区域 */
.search-result-section {
  padding-top: 90px;
  max-width: 1200px;
  margin: 0 auto;
}

.result-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 24px;
  color: #1f2937;
  text-align: center;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  padding: 0 20px 40px;
}

.product-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

.product-image {
  position: relative;
  padding-top: 100%;
  overflow: hidden;
}

.product-image img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hot-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: linear-gradient(135deg, #f97316, #ea580c);
  color: white;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
}

.product-info {
  padding: 16px;
}

.product-name {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-price {
  font-size: 18px;
  font-weight: 700;
  color: #2563eb;
}

.seller-info {
  display: flex;
  align-items: center;
  gap: 6px;
}

.seller-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
}

.seller-name {
  font-size: 11px;
  color: #6b7280;
}

.empty-state {
  text-align: center;
  padding: 60px;
  color: #9ca3af;
}

/* 响应式 */
@media (max-width: 1200px) {
  .product-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .nav-container {
    flex-wrap: wrap;
    height: auto;
    padding: 10px 5%;
    gap: 10px;
  }
  
  .nav-menu {
    order: 3;
    width: 100%;
    justify-content: center;
  }
  
  .nav-right {
    order: 2;
    flex-wrap: wrap;
  }
  
  .product-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .search-wrapper input {
    width: 140px;
  }
}
</style>