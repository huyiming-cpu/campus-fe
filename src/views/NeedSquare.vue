<template>
  <div class="need-square">
    <div class="page-container">
      <div class="header">
        <div class="back" @click="$router.back()">
          <span class="back-icon">←</span> 返回
        </div>
        <h2>🎯 校园需求广场</h2>
        <button class="publish-btn" @click="showPublish = true">+ 发布</button>
      </div>

      <!-- 筛选 -->
 <!-- 筛选 -->
<div class="filter-bar">
  <span :class="{ active: filterType === 'school' }" @click="filterType = 'school'">🏫 本校</span>
  <span :class="{ active: filterType === 'all' }" @click="filterType = 'all'">🌍 全部</span>
  <span :class="{ active: filterType === 'my' }" @click="filterType = 'my'">👤 我的帖子</span>
</div>

      <!-- ========== 为你匹配（需求帖子） ========== -->
      <div v-if="matchList.length > 0" class="match-section">
        <div class="match-header">
          <span class="match-icon">🔥</span>
          <span class="match-title">为你匹配</span>
        </div>
        <div class="match-list">
        <div class="match-card" v-for="item in matchList" :key="item.id">
  <div class="match-left">
    <div class="match-user">
      <img :src="`${API_BASE}/avatar/${item.avatar || 'default.jpg'}`" class="match-avatar" />
      <div>
        <div class="match-username">{{ item.username }}</div>
        <div class="match-university">{{ item.university }}</div>
      </div>
     
    </div>
    <div class="match-content">
      <div class="match-title">{{ item.title }}</div>
      <div class="match-desc">{{ item.content }}</div>
    </div>
    <div class="match-actions">
      <button class="match-chat-btn" @click="goToChat(item.userId)">💬 联系TA</button>
       <div class="match-type" :class="item.type === 'have' ? 'have' : 'exchange'">
        {{ item.type === 'have' ? '📦 有闲置' : '🔄 以物换物' }}
      </div>
    </div>
  </div>
  <img v-if="item.image" :src="`${API_BASE}/need/${item.image}`" class="match-img" />
   <div class="match-time">{{ formatTime(item.createTime) }}</div>
</div>
        </div>
      </div>

      <!-- ========== 推荐商品（从商品表匹配） ========== -->
      <div v-if="recommendProducts.length > 0" class="recommend-section">
        <div class="recommend-header">
          <span class="recommend-icon">🛒</span>
          <span class="recommend-title">推荐商品</span>
          <span class="recommend-desc">根据你的需求推荐</span>
        </div>
        <div class="recommend-list">
          <div class="recommend-card" v-for="product in recommendProducts" :key="product.id" @click="goToProduct(product.id)">
            <img :src="`${API_BASE}/products/${product.image}`" class="recommend-img" />
            <div class="recommend-info">
              <div class="recommend-name">{{ product.name }}</div>
              <div class="recommend-price">¥{{ product.price }}</div>
              <div class="recommend-seller">
                <img :src="`${API_BASE}/avatar/${product.user?.avatar || 'default.jpg'}`" class="recommend-avatar" />
                <span>{{ product.user?.username || '匿名' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 需求列表 -->
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="needList.length === 0" class="empty">
        <div class="empty-icon">📭</div>
        <p>暂无需求，快来发布第一条吧~</p>
      </div>
      <div v-else class="need-list">
        <div class="need-card" v-for="item in needList" :key="item.id">
          <div class="need-left">
            <div class="user-info" @click="goToUser(item.userId)">
              <img :src="`${API_BASE}/avatar/${item.avatar || 'default.jpg'}`" class="avatar" />
              <div>
                <div class="username">{{ item.username }}</div>
                <div class="university">{{ item.university }}</div>
              </div>
            </div>
            
            <div class="need-content">
              <div class="need-title">{{ item.title }}</div>
              <div class="need-desc">{{ item.content }}</div>
              <div class="need-type" :class="item.type === 'want' ? 'want' : item.type === 'have' ? 'have' : 'exchange'">
                {{ item.type === 'want' ? '🙏 想要' : item.type === 'have' ? '📦 有闲置' : '🔄 以物换物' }}
              </div>
            </div>
            
            <div class="need-actions">
              <button class="chat-btn" @click="goToChat(item.userId)">💬 聊一聊</button>
              <button v-if="item.userId == currentUserId" class="delete-btn" @click="deleteNeed(item.id)">🗑 删除</button>
            </div>
          </div>
          
          <img v-if="item.image" :src="`${API_BASE}/need/${item.image}`" class="need-img" />
          
          <div class="need-time">{{ formatTime(item.createTime) }}</div>
        </div>
      </div>
    </div>

    <!-- 发布弹窗 -->
    <div v-if="showPublish" class="dialog-overlay" @click="showPublish = false">
      <div class="dialog-content" @click.stop>
        <div class="dialog-header">
          <div class="header-icon">📝</div>
          <h3>发布需求/闲置</h3>
          <span class="close" @click="showPublish = false">×</span>
        </div>
        <div class="form-item">
          <label>类型</label>
          <select v-model="publishForm.type">
            <option value="want">🙏 我想要</option>
            <option value="have">📦 我有闲置</option>
            <option value="exchange">🔄 以物换物</option>
          </select>
        </div>
        <div class="form-item">
          <label>分类</label>
          <select v-model="publishForm.category">
            <option value="">请选择分类</option>
            <option value="学习用品">📚 学习用品</option>
            <option value="生活用品">🏠 生活用品</option>
            <option value="数码产品">💻 数码产品</option>
            <option value="服饰">👕 服饰</option>
            <option value="运动器材">⚽ 运动器材</option>
            <option value="小家电">🍳 小家电</option>
            <option value="交通出行">🚲 交通出行</option>
            <option value="其他">🎁 其他</option>
          </select>
        </div>
        <div class="form-item">
          <label>标题</label>
          <input v-model="publishForm.title" placeholder="一句话概括..." />
        </div>
        <div class="form-item">
          <label>图片（选填）</label>
          <input type="file" accept="image/*" @change="uploadImage" />
          <img v-if="previewImage" :src="previewImage" class="preview-img" />
        </div>
        <div class="form-item">
          <label>详细描述</label>
          <textarea v-model="publishForm.content" rows="4" placeholder="详细说明..."></textarea>
        </div>
        <div class="btns-row">
          <button @click="showPublish = false">取消</button>
          <button @click="submitNeed">发布</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080'
import { ref, onMounted, watch } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()

const filterType = ref('school')
const needList = ref([])
const loading = ref(false)
const showPublish = ref(false)
const publishForm = ref({
  type: 'want',
  category: '',
  title: '',
  content: ''
})

// 匹配列表（需求帖子）
const matchList = ref([])
// 推荐商品列表
const recommendProducts = ref([])

const previewImage = ref('')
const currentUserId = sessionStorage.getItem("userId")

// 加载需求列表
// 加载需求列表
// 加载需求列表
const loadNeeds = async () => {
  loading.value = true
  try {
    let url = `\${API_BASE}/need/list`
    let params = {}
    
    if (filterType.value === 'school') {
      params.filter = 'school'
    }
    
    const res = await axios.get(url, {
      params: params,
      withCredentials: true
    })
    let data = res.data.data || []
    
    // 如果是"我的"，过滤出当前用户发布的需求
    if (filterType.value === 'my') {
      data = data.filter(item => item.userId == currentUserId)
      // 我的模式下清空推荐区域
      matchList.value = []
      recommendProducts.value = []
    } else {
      // 非我的模式下，加载匹配和推荐（避免重复加载）
      if (matchList.value.length === 0) loadMatch()
      if (recommendProducts.value.length === 0) loadRecommendProducts()
    }
    
    needList.value = data
  } catch (err) {
    console.error('加载失败', err)
  } finally {
    loading.value = false
  }
}

// 加载智能匹配（需求帖子）
const loadMatch = async () => {
  try {
    const res = await axios.get(`\${API_BASE}/need/match`, {
      withCredentials: true
    })
    matchList.value = res.data.data || []
  } catch (err) {
    console.error('加载匹配失败', err)
  }
}

// 加载推荐商品（根据用户需求匹配商品）
const loadRecommendProducts = async () => {
  try {
    const res = await axios.get(`\${API_BASE}/need/recommend/byNeed`, {
      withCredentials: true
    })
    recommendProducts.value = res.data.data || []
  } catch (err) {
    console.error('加载推荐商品失败', err)
  }
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

const uploadImage = async (e) => {
  const file = e.target.files[0]
  if (!file) return
  
  const formData = new FormData()
  formData.append('file', file)
  
  try {
    const res = await axios.post(`\${API_BASE}/need/upload`, formData)
    publishForm.value.image = res.data.data
    previewImage.value = URL.createObjectURL(file)
  } catch (err) {
    console.error('上传失败', err)
  }
}

const submitNeed = async () => {
  if (!publishForm.value.title) {
    alert('请输入标题')
    return
  }
  try {
    const res = await axios.post(`\${API_BASE}/need/publish`, {
      type: publishForm.value.type,
      category: publishForm.value.category,
      title: publishForm.value.title,
      content: publishForm.value.content,
      image: publishForm.value.image || null
    }, {
      withCredentials: true
    })
    if (res.data.code === 200) {
      alert('发布成功')
      showPublish.value = false
      publishForm.value = { type: 'want', category: '', title: '', content: '' }
      loadNeeds()
      loadMatch()
      loadRecommendProducts()
    } else {
      alert(res.data.msg)
    }
  } catch (err) {
    console.error('发布失败', err)
    alert('发布失败')
  }
}

const deleteNeed = async (id) => {
  if (!confirm('确定删除吗？')) return
  try {
    await axios.delete(`${API_BASE}/need/delete/${id}`, {
      withCredentials: true
    })
    alert('删除成功')
    loadNeeds()
    loadMatch()
    loadRecommendProducts()
  } catch (err) {
    alert('删除失败')
  }
}

const goToUser = (userId) => {
  router.push(`/seller/${userId}`)
}

const goToChat = (userId) => {
  router.push(`/chat?sellerId=${userId}`)
}

const goToProduct = (productId) => {
  router.push(`/product/detail/${productId}`)
}

const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diff = now - date
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  return `${date.getMonth()+1}/${date.getDate()}`
}

watch(filterType, () => {
  loadNeeds()
})

onMounted(() => {
  loadNeeds()
  loadMatch()
  loadRecommendProducts()
})
</script>

<style scoped>
.need-square {
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
}

.back {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  padding: 8px 16px;
  background: rgba(37, 99, 235, 0.1);
  border-radius: 30px;
  color: #2563eb;
  transition: all 0.3s;
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

.publish-btn {
  background: linear-gradient(135deg, #2563eb, #1e40af);
  color: white;
  border: none;
  padding: 8px 24px;
  border-radius: 30px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s;
}

.publish-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.filter-bar span {
  padding: 8px 24px;
  background: white;
  border-radius: 30px;
  cursor: pointer;
  font-size: 14px;
  color: #4b5563;
  transition: all 0.3s;
  border: 1px solid rgba(37, 99, 235, 0.1);
}

.filter-bar span:hover {
  background: rgba(37, 99, 235, 0.05);
}

.filter-bar span.active {
  background: linear-gradient(135deg, #2563eb, #1e40af);
  color: white;
  border-color: transparent;
}

/* ========== 为你匹配（需求帖子）样式 ========== */
.match-section {
  background: linear-gradient(135deg, #fff9eb, #fff3e0);
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 24px;
  border: 1px solid #fcd34d;
}

.match-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #fde68a;
}

.match-icon {
  font-size: 24px;
}

.match-title {
  font-size: 18px;
  font-weight: 700;
  color: #d97706;
}

.match-desc {
  font-size: 12px;
  color: #b45309;
  margin-left: auto;
}

.match-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.match-card {
  background: white;
  border-radius: 16px;
  padding: 16px;
  transition: all 0.2s;
  border: 1px solid #fde68a;
  display: flex;
  gap: 16px;
  position: relative;
}

.match-left {
  flex: 1;
}

.match-user {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.match-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.match-username {
  font-weight: 600;
  font-size: 14px;
  color: #1f2937;
}

.match-university {
  font-size: 11px;
  color: #6b7280;
}

.match-type {

  padding: 4px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 500;
}

.match-type.have {
  background: #d1fae5;
  color: #059669;
}

.match-type.exchange {
  background: #dbeafe;
  color: #2563eb;
}

.match-content {
  margin-bottom: 12px;
}

.match-title {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.match-desc {
  font-size: 13px;
  color: #6b7280;
}

.match-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
}

.match-chat-btn {
  background: linear-gradient(135deg, #2563eb, #1e40af);
  color: white;
  border: none;
  padding: 6px 20px;
  border-radius: 30px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.match-type {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 500;
}

.match-type.have {
  background: #d1fae5;
  color: #059669;
}

.match-type.exchange {
  background: #dbeafe;
  color: #2563eb;
}

.match-img {
  width: 180px;
  height: 180px;
  object-fit: cover;
  border-radius: 12px;
  flex-shrink: 0;
}
.match-time {
  font-size: 11px;
  color: #9ca3af;
}

/* ========== 推荐商品样式 ========== */
.recommend-section {
  background: linear-gradient(135deg, #e8f4ff, #dbeafe);
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 24px;
  border: 1px solid #93c5fd;
}

.recommend-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #bfdbfe;
}

.recommend-icon {
  font-size: 24px;
}

.recommend-title {
  font-size: 18px;
  font-weight: 700;
  color: #1d4ed8;
}

.recommend-desc {
  font-size: 12px;
  color: #3b82f6;
  margin-left: auto;
}

.recommend-list {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.recommend-card {
  flex-shrink: 0;
  width: 160px;
  background: white;
  border-radius: 16px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid #e5e7eb;
}

.recommend-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.recommend-img {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 12px;
}

.recommend-info {
  margin-top: 8px;
}

.recommend-name {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.recommend-price {
  font-size: 16px;
  font-weight: 700;
  color: #2563eb;
  margin: 6px 0;
}

.recommend-seller {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #6b7280;
}

.recommend-avatar {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  object-fit: cover;
}

/* ========== 需求列表样式（原有） ========== */
.need-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.need-card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  position: relative;
  display: flex;
  gap: 16px;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(37, 99, 235, 0.08);
}

.need-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.1);
}

.need-left {
  flex: 1;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  margin-bottom: 16px;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.username {
  font-weight: 600;
  font-size: 15px;
  color: #1f2937;
}

.university {
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
}

.need-content {
  margin-bottom: 16px;
}

.need-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #1f2937;
}

.need-desc {
  font-size: 14px;
  color: #4b5563;
  line-height: 1.5;
}

.need-type {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  margin-top: 8px;
}

.need-type.want {
  background: #fee2e2;
  color: #dc2626;
}

.need-type.have {
  background: #d1fae5;
  color: #059669;
}

.need-type.exchange {
  background: #dbeafe;
  color: #2563eb;
}

.need-actions {
  margin-top: 12px;
  display: flex;
  gap: 8px;
}

.chat-btn {
  background: linear-gradient(135deg, #2563eb, #1e40af);
  color: white;
  border: none;
  padding: 6px 20px;
  border-radius: 30px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.3s;
}

.chat-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.delete-btn {
  background: #ef4444;
  color: white;
  border: none;
  padding: 6px 16px;
  border-radius: 30px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.3s;
}

.delete-btn:hover {
  background: #dc2626;
}

.need-img {
  width: 200px;
  height: 200px;
  object-fit: cover;
  border-radius: 12px;
  flex-shrink: 0;
  margin-top: 20px;
}

.need-time {
  position: absolute;
  top: 16px;
  right: 20px;
  font-size: 11px;
  color: #9ca3af;
}

.empty {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 24px;
  color: #9ca3af;
  border: 1px solid rgba(37, 99, 235, 0.08);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.loading {
  text-align: center;
  padding: 60px;
  color: #6b7280;
}

/* 弹窗样式 */
.dialog-overlay {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  background: rgba(0, 0, 0, 0.7) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  z-index: 999999 !important;
}

.dialog-content {
  background: white;
  border-radius: 24px;
  padding: 0;
  width: 450px;
  max-width: 90%;
  overflow: hidden;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dialog-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 24px;
  background: linear-gradient(135deg, #2563eb, #1e40af);
  color: white;
  position: relative;
}

.header-icon {
  font-size: 24px;
}

.dialog-header h3 {
  margin: 0;
  flex: 1;
  font-size: 18px;
}

.dialog-header .close {
  font-size: 24px;
  cursor: pointer;
  opacity: 0.8;
  transition: all 0.3s;
}

.dialog-header .close:hover {
  opacity: 1;
  transform: scale(1.1);
}

.dialog-content .form-item {
  padding: 0 24px;
  margin-bottom: 16px;
}

.dialog-content .form-item:first-of-type {
  margin-top: 20px;
}

.dialog-content .form-item label {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #4b5563;
}

.dialog-content input, 
.dialog-content select, 
.dialog-content textarea {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  font-size: 14px;
  transition: all 0.3s;
  box-sizing: border-box;
}

.dialog-content input:focus,
.dialog-content select:focus,
.dialog-content textarea:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
}

.preview-img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 12px;
  margin-top: 10px;
}

.btns-row {
  display: flex;
  gap: 12px;
  padding: 20px 24px;
  background: #f9fafb;
  margin-top: 8px;
}

.btns-row button {
  flex: 1;
  padding: 10px;
  border-radius: 40px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.btns-row button:first-child {
  background: #f3f4f6;
  border: none;
  color: #6b7280;
}

.btns-row button:first-child:hover {
  background: #e5e7eb;
}

.btns-row button:last-child {
  background: linear-gradient(135deg, #2563eb, #1e40af);
  border: none;
  color: white;
}

.btns-row button:last-child:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}
</style>