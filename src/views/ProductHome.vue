<template>
  <div class="home-page">
    <!-- 导航栏（官网风格） -->
    <nav class="navbar">
      <div class="nav-container">
        <div class="logo" @click="toggleFilter">
  <span class="logo-icon">{{ showAll ? '🌍' : '🏫' }}</span>
  <span class="logo-text">校园宝</span>
</div>
        <div class="nav-menu">
          <a href="#" @click.prevent="switchTab('all')" :class="{ active: currentTab === 'all' }">首页</a>
          <a href="#" @click.prevent="switchTab('学习用品')" :class="{ active: currentTab === '学习用品' }">学习用品</a>
          <a href="#" @click.prevent="switchTab('生活用品')" :class="{ active: currentTab === '生活用品' }">生活用品</a>
          <a href="#" @click.prevent="switchTab('数码产品')" :class="{ active: currentTab === '数码产品' }">数码产品</a>
          <a href="#" @click.prevent="switchTab('服饰')" :class="{ active: currentTab === '服饰' }">服饰</a>
          <a href="#" @click.prevent="switchTab('运动器材')" :class="{ active: currentTab === '运动器材' }">运动器材</a>
          <a href="#" @click.prevent="switchTab('小家电')" :class="{ active: currentTab === '小家电' }">小家电</a>
          <a href="#" @click.prevent="switchTab('交通出行')" :class="{ active: currentTab === '交通出行' }">交通出行</a>
          <a href="#" @click.prevent="switchTab('其他')" :class="{ active: currentTab === '其他' }">其他</a>
         
        </div>
        <div class="nav-right">
          <div class="search-box">
            <input type="text" v-model="searchKey" placeholder="搜索商品..." @keyup.enter="doSearch" />
            <button @click="doSearch">🔍</button>
          </div>
          <!-- 登录/用户区域 -->
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
     <!-- 活动入口（保留） -->
    <div class="activity-entrance" v-if="currentActivity" @click="goToActivity">
      <div class="activity-banner" :class="currentActivity.type">
        <div class="banner-left">
          <span class="banner-icon">{{ currentActivity.icon }}</span>
          <div class="banner-text">
            <div class="banner-title">{{ currentActivity.title }}</div>
            <div class="banner-subtitle">{{ currentActivity.subtitle }}</div>
          </div>
        </div>
        <div class="banner-right">
          <span class="days">{{ currentActivity.daysLeft }}</span>
          <span class="unit">天</span>
          <span class="arrow">→</span>
        </div>
      </div>
    </div>

    <!-- Hero 区域 -->
    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title">
          <span class="gradient-text">校园二手交易平台</span>
        </h1>
        <p class="hero-subtitle">让闲置流动起来，让校园更美好</p>
        <div class="hero-buttons">
          <button class="btn-primary" @click="scrollToProducts">开始使用</button>
          <button class="btn-outline" @click="scrollToAbout">了解更多</button>
        </div>
      </div>
      <div class="hero-stats">
        <div class="stat-item">
          <div class="stat-number">{{ stats.totalUsers }}</div>
          <div class="stat-label">注册用户</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ stats.totalOrders }}</div>
          <div class="stat-label">成交订单</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ stats.goodRate }}%</div>
          <div class="stat-label">好评率</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ stats.totalProducts }}</div>
          <div class="stat-label">在售商品</div>
        </div>
      </div>
    </section>

   

    <!-- 分类导航 -->
    <section class="categories">
      <div class="container">
        <h2 class="section-title">热门分类</h2>
        <div class="category-grid">
          <div class="category-card" v-for="cat in categories" :key="cat.name" @click="switchTab(cat.type)">
            <div class="category-icon">{{ cat.icon }}</div>
            <div class="category-name">{{ cat.name }}</div>
            <div class="category-desc">{{ cat.desc }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- 搜索结果（独立显示） -->
    <div v-if="isSearch" class="search-result-section">
      <h3 class="result-title">搜索结果（共 {{ searchResultList.length }} 件）</h3>
      <div class="product-grid">
        <div class="product-card" v-for="item in searchResultList" :key="item.id" @click="goToDetail(item.id)">
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
      <div v-if="searchResultList.length === 0" class="empty-state">暂无商品</div>
    </div>

    <!-- 推荐页（使用你的 showList 逻辑） -->
    <div v-else class="normal-section">
      <div class="section-header">
        <h2 class="section-title">
          <span class="title-icon">🔥</span>
          {{ currentTab === 'all' ? '为你推荐' : currentTab }}
        </h2>
        <div class="sort-bar">
          <span class="sort-item" :class="{ active: sortType === 'default' }" @click="sortType = 'default'">默认</span>
          <span class="sort-item" :class="{ active: sortType === 'price_asc' }" @click="sortType = 'price_asc'">价格 ↑</span>
          <span class="sort-item" :class="{ active: sortType === 'price_desc' }" @click="sortType = 'price_desc'">价格 ↓</span>
        </div>
      </div>
      <div class="product-grid">
        <div class="product-card" v-for="item in showList" :key="item.id" @click="goToDetail(item.id)">
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
      <div v-if="showList.length === 0" class="empty-state">暂无商品</div>
    </div>

    <!-- 特色服务 -->
    <section class="features">
      <div class="container">
        <h2 class="section-title">特色服务</h2>
        <div class="feature-grid">
          <div class="feature-card">
            <div class="feature-icon">🔒</div>
            <h3>实名认证</h3>
            <p>学号+一卡通双重认证，确保真实身份</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🤝</div>
            <h3>信用体系</h3>
            <p>交易评价影响信用分，诚信有保障</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">💬</div>
            <h3>实时聊天</h3>
            <p>买卖双方即时沟通，问题不过夜</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🚚</div>
            <h3>双模式交易</h3>
            <p>线上快递+线下自提，随心选择</p>
          </div>
        </div>
      </div>
    </section>

<!-- 下载区域 -->
<section class="download">
  <div class="container">
    <div class="download-content">
      <div class="download-text">
        <h2>随时随地逛校园</h2>
        <p>扫码下载校园宝APP，手机端也能轻松买卖</p>
        <div class="qrcode">
       <img src="/qrcode.png" alt="扫码下载" class="qrcode-img" />
          <span>扫码下载</span>
        </div>
      </div>
      <div class="download-phone">
        <div class="phone-mockup">📱</div>
      </div>
    </div>
  </div>
</section>

    <!-- 页脚 -->
<footer class="footer">
  <div class="container">
    <div class="footer-content">
      <div class="footer-logo">
        <span class="logo-icon">🎓</span>
        <span>校园宝</span>
      </div>
      <div class="footer-links">
        <a href="#" @click.prevent="goToAbout('about')">关于我们</a>
        <a href="#" @click.prevent="goToAbout('help')">帮助中心</a>
        <a href="#" @click.prevent="goToAbout('contact')">联系我们</a>
        <a href="#" @click.prevent="goToAbout('links')">友情链接</a>
      </div>
      <div class="footer-copyright">
        © 2026 校园宝 | 校园二手交易平台
      </div>
    </div>
  </div>
</footer>
  </div>
</template>

<script setup>
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080'
// ========== 你原来的 script 代码，完全不动 ==========
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const currentTab = ref('all')
const searchKey = ref('')
const productList = ref([])
const isSearch = ref(false)
const searchResultList = ref([])
const showAll = ref(false)

// 点击相关
const frequentClickTypes = ref([])
const frequentClickProductIds = ref([])

const toggleFilter = () => {
  showAll.value = !showAll.value
  getProductList()
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

const getProductList = async () => {
  try {
    const res = await axios.get(`\${API_BASE}/product/list`)
    productList.value = res.data.data
  } catch (err) {
    console.error(err)
  }
}

// 获取点击≥3次的类型
const loadFrequentClickTypes = async () => {
  const userId = sessionStorage.getItem("userId")
  if (!userId) return
  try {
    const res = await axios.get(`\${API_BASE}/product/click/types`, {
      params: { userId },
      withCredentials: true
    })
    if (res.data.code === 200) {
      frequentClickTypes.value = res.data.data || []
    }
  } catch (err) {
    console.error('获取点击类型失败', err)
  }
}

// 获取点击≥3次的商品ID
const loadFrequentClickProductIds = async () => {
  const userId = sessionStorage.getItem("userId")
  if (!userId) return
  try {
    const res = await axios.get(`\${API_BASE}/product/click/productIds`, {
      params: { userId },
      withCredentials: true
    })
    if (res.data.code === 200) {
      frequentClickProductIds.value = res.data.data || []
    }
  } catch (err) {
    console.error('获取点击商品ID失败', err)
  }
}

// 记录点击并跳转详情
const goToDetail = async (productId) => {
  try {
    await axios.post(`\${API_BASE}/product/click`, null, {
      params: { productId },
      withCredentials: true
    })
  } catch (err) {
    console.error('记录点击失败', err)
  }
  router.push(`/product/detail/${productId}`)
}

const switchTab = (type) => {
  currentTab.value = type
  isSearch.value = false
  searchKey.value = ''
  searchResultList.value = []
  if (type === 'all') {
    getProductList()
  }
}

const currentActivity = computed(() => {
  const savedActivity = localStorage.getItem('currentActivity')
  if (!savedActivity) return null
  
  const now = new Date()
  const year = now.getFullYear()
  
  if (savedActivity === 'graduation') {
    const target = new Date(year, 6,1)
    const diff = target - now
    const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24))
    return {
      type: 'graduation',
      icon: '🎓',
      title: '毕业季大甩卖',
      subtitle: '学长学姐带不走的青春',
      daysLeft: daysLeft > 0 ? daysLeft : 0,
      path: '/giftPack?type=graduation'
    }
  } else if (savedActivity === 'freshman') {
    const target = new Date(year, 8, 1)
    const diff = target - now
    const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24))
    return {
      type: 'freshman',
      icon: '📚',
      title: '开学季新生礼包',
      subtitle: '新学期新气象，好物伴你成长',
      daysLeft: daysLeft > 0 ? daysLeft : 0,
      path: '/giftPack?type=freshman'
    }
  }
  return null
})

const goToActivity = () => {
  if (currentActivity.value) {
    router.push(currentActivity.value.path)
  }
}

const sortType = ref('default')
const handleSort = () => {}

const showList = computed(() => {
  let data = [...productList.value]
  
  const currentUserId = sessionStorage.getItem("userId")
  let filtered = data.filter(item => item.user?.id != currentUserId)
  
  if (!showAll.value) {
    const myUniversity = sessionStorage.getItem("university")
    filtered = filtered.filter(item => item.user?.university === myUniversity)
  }
  
  if (currentTab.value === 'all') {
    const userId = sessionStorage.getItem("userId")
    let historyItems = userId
      ? JSON.parse(localStorage.getItem("searchedItems_" + userId) || "[]")
      : []

    if (!showAll.value) {
      const myUniversity = sessionStorage.getItem("university")
      historyItems = historyItems.filter(item => {
        const itemUniversity = item.university || item.user?.university
        return itemUniversity === myUniversity
      })
    }

    let relatedTypes = []
    historyItems.forEach(item => {
      if (item.type && !relatedTypes.includes(item.type)) relatedTypes.push(item.type)
    })

    let relatedItems = []
    relatedTypes.forEach(type => {
      const sameType = filtered.filter(p => p.type === type && !historyItems.some(h => h.id === p.id))
      relatedItems = relatedItems.concat(sameType.slice(0, 2))
    })

  // ========== 点击≥3次推荐 ==========
for (let type of frequentClickTypes.value) {
  // 1. 添加用户点击过的商品本身
  const clickedProducts = filtered.filter(p => 
    p.type === type && 
    frequentClickProductIds.value.includes(p.id) &&
    !historyItems.some(h => h.id === p.id) &&
    !relatedItems.some(r => r.id === p.id)
  )
  for (let product of clickedProducts) {
    if (!relatedItems.some(r => r.id === product.id)) {
      relatedItems.push(product)
    }
  }
  
  // 2. 再找该类型的另一件非热门商品
  const otherProducts = filtered.filter(p => 
    p.type === type && 
    p.hot !== 1 && 
    !frequentClickProductIds.value.includes(p.id) &&
    !historyItems.some(h => h.id === p.id) &&
    !relatedItems.some(r => r.id === p.id)
  )
  if (otherProducts.length > 0) {
    relatedItems.push(otherProducts[0])
  }
}

    const hotItems = filtered.filter(item => item.hot === 1)

    // 第一步：热门商品和搜索历史商品交替
    const mixed = []
    const maxLen = Math.max(hotItems.length, historyItems.length)
    for (let i = 0; i < maxLen; i++) {
      if (hotItems[i]) mixed.push(hotItems[i])
      if (historyItems[i]) mixed.push(historyItems[i])
    }

    // 第二步：把点击推荐商品也加入交替，实现三者混合
    const maxLen2 = Math.max(mixed.length, relatedItems.length)
    const mixedAll = []
    for (let i = 0; i < maxLen2; i++) {
      if (mixed[i]) mixedAll.push(mixed[i])
      if (relatedItems[i]) mixedAll.push(relatedItems[i])
    }

    const all = mixedAll
    const map = {}
    return all.filter(item => {
      if (map[item.id]) return false
      map[item.id] = true
      return true
    })
  }

  let result = filtered.filter(item => item.type === currentTab.value)
  if (sortType.value === 'price_asc') {
    result.sort((a, b) => a.price - b.price)
  } else if (sortType.value === 'price_desc') {
    result.sort((a, b) => b.price - a.price)
  }
  return result
})

const doSearch = () => {
  const key = searchKey.value.trim().toLowerCase()
  router.push(`/search?key=${encodeURIComponent(key)}`)
  const userId = sessionStorage.getItem("userId")
  if (!key || !userId) return

  const result = productList.value.filter(item =>
    (item.name || '').toLowerCase().includes(key)
  )

  const oldList = JSON.parse(localStorage.getItem("searchedItems_" + userId)) || []
  const existIds = oldList.map(i => i.id)

  const newItems = result.filter(item => !existIds.includes(item.id)).slice(0, 3)
  const finalList = [...oldList, ...newItems]

  const map = {}
  const final = finalList.filter(item => {
    if (map[item.id]) return false
    map[item.id] = true
    return true
  })

  localStorage.setItem("searchedItems_" + userId, JSON.stringify(final))
  searchResultList.value = result
  isSearch.value = true
}

// 清空所有个性化数据（包括点击记录）
const clearAllPersonalization = async () => {
  const userId = sessionStorage.getItem("userId")
  if (!userId) return
  
  // 清空本地搜索历史
  localStorage.removeItem("searchedItems_" + userId)
  
  // 清空后端的点击记录
  try {
    await axios.post(`\${API_BASE}/product/click/clear`, null, {
      params: { userId },
      withCredentials: true
    })
    console.log('点击记录已清除')
  } catch (err) {
    console.error('清除点击记录失败', err)
  }
  
  // 刷新页面
  window.location.reload()
}

// Ctrl + L 清空所有个性化数据
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.key === "l") {
    e.preventDefault()
    clearAllPersonalization()
  }
})

const goMyCenter = () => router.push('/myCenter')
const goLogin = () => {
  sessionStorage.clear()
  router.push('/login')
}

// ========== 新增的辅助变量/方法（补充官网风格需要） ==========
const isLoggedIn = ref(false)
const userAvatar = ref('')
const stats = ref({
  totalUsers: 0,
  totalOrders: 0,
  goodRate: 98,
  totalProducts: 0
})

const categories = [
  { name: '学习用品', type: '学习用品', icon: '📚', desc: '教材/文具/笔记' },
  { name: '生活用品', type: '生活用品', icon: '🏠', desc: '日用/收纳/装饰' },
  { name: '数码产品', type: '数码产品', icon: '💻', desc: '手机/电脑/耳机' },
  { name: '服饰', type: '服饰', icon: '👕', desc: '衣服/鞋子/包包' },
  { name: '运动器材', type: '运动器材', icon: '⚽', desc: '球类/健身/户外' },
  { name: '小家电', type: '小家电', icon: '🍳', desc: '吹风/台灯/风扇' },
  { name: '交通出行', type: '交通出行', icon: '🚲', desc: '自行车/滑板/代步' },
  { name: '其他', type: '其他', icon: '🎁', desc: '其他闲置物品' }
]

const getAvatarUrl = (avatar) => {
  if (!avatar) return `\${API_BASE}/avatar/default.jpg`
  return `${API_BASE}/avatar/${avatar}`
}

const handleImageError = (e) => {
  e.target.src = `\${API_BASE}/products/default.jpg`
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const scrollToProducts = () => {
  document.querySelector('.normal-section')?.scrollIntoView({ behavior: 'smooth' })
}

const scrollToAbout = () => {
  document.querySelector('.features')?.scrollIntoView({ behavior: 'smooth' })
}

const goToNeed = () => {
  router.push('/need-square')
}

const goRegister = () => {
  router.push('/register')
}

const loadStats = async () => {
  try {
    const userRes = await axios.get(`\${API_BASE}/user/admin/users`)
    const productRes = await axios.get(`\${API_BASE}/product/list`)
    const orderRes = await axios.get(`\${API_BASE}/order/admin/all`)
    stats.value.totalUsers = (userRes.data.data || []).length
    stats.value.totalProducts = (productRes.data.data || []).filter(p => p.status === 0).length
    stats.value.totalOrders = (orderRes.data.data || []).length
  } catch (err) {
    console.error('加载统计失败', err)
  }
}

const checkLoginStatus = () => {
  const user = sessionStorage.getItem("loginUser")
  if (user) {
    isLoggedIn.value = true
    const userData = JSON.parse(user)
    userAvatar.value = userData.avatar
  }
}

const goToAbout = (tab) => {
  router.push(`/about?tab=${tab}`)
}
onMounted(() => {
  checkLoginStatus()
  getProductList()
  loadFrequentClickTypes()
  loadFrequentClickProductIds()
  loadStats()
})
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f0f4ff 0%, #ffffff 100%);
}

/* ========== 导航栏 ========== */
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

.nav-menu a:hover,
.nav-menu a.active {
  color: #2563eb;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}

.search-box {
  display: flex;
  align-items: center;
  background: #f3f4f6;
  border-radius: 40px;
  padding: 4px 8px 4px 16px;
}

.search-box input {
  border: none;
  background: transparent;
  padding: 8px 0;
  outline: none;
  width: 180px;
  font-size: 14px;
}

.search-box button {
  background: linear-gradient(135deg, #2563eb, #1e40af);
  border: none;
  border-radius: 30px;
  padding: 8px 16px;
  color: white;
  cursor: pointer;
  font-size: 14px;
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 12px;
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

/* ========== Hero 区域 ========== */
.hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 120px 5% 80px;
  text-align: center;
  color: white;
  margin-top: 20px;  /* 70px → 20px，往上移动50px */
}

.hero-title {
  font-size: 48px;
  margin-bottom: 20px;
}

.gradient-text {
  background: linear-gradient(135deg, #fff, #e0e7ff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.hero-subtitle {
  font-size: 20px;
  margin-bottom: 32px;
  opacity: 0.9;
}

.hero-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 60px;
}

.btn-primary, .btn-outline {
  padding: 12px 32px;
  border-radius: 40px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary {
  background: white;
  border: none;
  color: #667eea;
}

.btn-outline {
  background: transparent;
  border: 2px solid white;
  color: white;
}

.hero-stats {
  display: flex;
  justify-content: center;
  gap: 60px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 32px;
  font-weight: 700;
}

.stat-label {
  font-size: 14px;
  opacity: 0.8;
  margin-top: 8px;
}

/* ========== 活动入口 ========== */
.activity-entrance {
  max-width: 1200px;
  margin: 100px auto 20px;  /* 40px → 100px，往下移动60px */
  padding: 0 20px;
}
.activity-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 32px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
  color: white;
}

.activity-banner:hover {
  transform: translateY(-4px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
}

.activity-banner.graduation {
  background: linear-gradient(135deg, #2563eb, #1e40af);
}

.activity-banner.freshman {
  background: linear-gradient(135deg, #059669, #047857);
}

.banner-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.banner-icon {
  font-size: 40px;
}

.banner-title {
  font-size: 24px;
  font-weight: bold;
}

.banner-subtitle {
  font-size: 13px;
  opacity: 0.9;
}

.banner-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.days {
  font-size: 36px;
  font-weight: bold;
}

.unit {
  font-size: 14px;
}

.arrow {
  font-size: 20px;
  margin-left: 10px;
}

/* ========== 分类区域 ========== */
.categories {
  padding: 60px 5%;
  background: white;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.section-title {
  text-align: center;
  font-size: 32px;
  margin-bottom: 40px;
  color: #1f2937;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 20px;
}

.category-card {
  background: #f8fafc;
  border-radius: 16px;
  padding: 24px 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.category-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.category-icon {
  font-size: 40px;
  margin-bottom: 12px;
}

.category-name {
  font-weight: 600;
  margin-bottom: 4px;
  color: #1f2937;
}

.category-desc {
  font-size: 12px;
  color: #6b7280;
}

/* ========== 商品区域 ========== */
.normal-section {
  padding: 0 5% 40px;
}

.search-result-section {
  padding: 0 5% 40px;
  margin-top: 20px;
}

.result-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 24px;
  color: #1f2937;
  text-align: center;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.title-icon {
  margin-right: 8px;
}

.sort-bar {
  display: flex;
  gap: 16px;
}

.sort-item {
  cursor: pointer;
  color: #6b7280;
  transition: color 0.2s;
}

.sort-item:hover,
.sort-item.active {
  color: #2563eb;
  font-weight: 500;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
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

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

/* ========== 特色服务 ========== */
.features {
  padding: 60px 5%;
  background: white;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30px;
}

.feature-card {
  text-align: center;
  padding: 30px;
}

.feature-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.feature-card h3 {
  font-size: 18px;
  margin-bottom: 8px;
  color: #1f2937;
}

.feature-card p {
  font-size: 14px;
  color: #6b7280;
}

/* ========== 下载区域 ========== */
.download {
  background: linear-gradient(135deg, #2563eb, #1e40af);
  padding: 60px 5%;
  color: white;
}

.download-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1000px;
  margin: 0 auto;
}

.download-text h2 {
  font-size: 32px;
  margin-bottom: 16px;
}

.download-text p {
  margin-bottom: 24px;
  opacity: 0.9;
}

.qrcode {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  background: white;
  padding: 16px;
  border-radius: 16px;
}

/* 新增：二维码图片样式 */
.qrcode-img {
  width: 100px;
  height: 100px;
  object-fit: contain;
}

.qrcode-placeholder {
  font-size: 48px;
}

.qrcode span {
  color: #1f2937;
  font-size: 12px;
}

.phone-mockup {
  font-size: 80px;
}

/* ========== 页脚 ========== */
.footer {
  background: #1f2937;
  padding: 40px 5%;
  color: #9ca3af;
}

.footer-content {
  text-align: center;
}

.footer-logo {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 16px;
  color: white;
}

.footer-links {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-bottom: 16px;
}

.footer-links a {
  color: #9ca3af;
  text-decoration: none;
  font-size: 14px;
}

.footer-links a:hover {
  color: white;
}

.footer-copyright {
  font-size: 12px;
}

/* ========== 响应式 ========== */
@media (max-width: 1200px) {
  .category-grid {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .product-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .feature-grid {
    grid-template-columns: repeat(2, 1fr);
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
  }
  
  .category-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .product-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .hero-title {
    font-size: 32px;
  }
  
  .hero-stats {
    flex-wrap: wrap;
    gap: 30px;
  }
  
  .section-title {
    font-size: 24px;
  }
  
  .download-content {
    flex-direction: column;
    text-align: center;
  }
}
</style>