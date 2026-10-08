<template>
  <div class="my-product">
    
    <div class="page-container">
      <div class="header">
        <div class="back" @click="goBack">
          <span class="back-icon">←</span> 返回
        </div>
        <h2>🧸 我的宝贝</h2>
        <button class="publish-btn" @click="showPublish = true">+ 发布商品</button>
      </div>

      <!-- TAB 切换 -->
      <div class="tab-bar">
        <div class="tab" :class="{ active: currentType === 'sell' }" @click="switchTab('sell')">
          🛍️ 我的橱窗（在售）
        </div>
        <div class="tab" :class="{ active: currentType === 'buy' }" @click="switchTab('buy')">
          📥 我买到的
        </div>
      </div>
      <!-- 筛选栏（仅在我的橱窗显示） -->
<div class="filter-bar" v-if="currentType === 'sell'">
  <span :class="{ active: filterStatus === '' }" @click="filterStatus = ''">全部</span>
  <span :class="{ active: filterStatus === 0 }" @click="filterStatus = 0">出售中</span>
  <span :class="{ active: filterStatus === 3 }" @click="filterStatus = 3">审核中</span>
  <span :class="{ active: filterStatus === 2 }" @click="filterStatus = 2">已下架</span>
  <span :class="{ active: filterStatus === 1 }" @click="filterStatus = 1">已卖掉</span>
</div>

      <!-- 左右两栏布局 -->
      <div class="two-columns">
        <!-- 左侧：统计卡片 -->
        <div class="left-stats">
          <div class="stats-card">
            <div class="stats-title">
              📊 {{ currentType === 'sell' ? '我的宝贝统计' : '我的购买统计' }}
            </div>
            <div class="stats-list">
              <div class="stat-item" v-for="stat in typeStats" :key="stat.type">
                <span class="stat-type">{{ stat.type }}</span>
                <div class="stat-bar">
                  <div class="stat-fill" :style="{ width: stat.percent + '%', background: stat.color }"></div>
                </div>
                <span class="stat-count">{{ stat.count }}件</span>
              </div>
              <div v-if="typeStats.length === 0" class="stat-empty">暂无数据</div>
            </div>
          </div>
        </div>

        <!-- 右侧：商品列表 -->
        <div class="right-list">
          <div v-if="!list || list.length === 0" class="empty">
            <div class="empty-icon">📭</div>
            <p>{{ currentType === 'sell' ? '你还没有发布任何宝贝~' : '你还没有买到任何商品~' }}</p>
          </div>

       <div v-if="filteredList && filteredList.length > 0" class="item" v-for="item in filteredList" :key="item.id">
            <img :src="getImg(item.image)" alt="商品" />
            <div class="info">
              <div class="name">{{ item.name }}</div>
              <div class="price">¥{{ item.price }}</div>
              <div class="type">📂 {{ item.type }}</div>
              <div class="info-text">📝 {{ item.info }}</div>
              <div class="status" :class="'status_' + item.status">
                {{ currentType === 'sell' ? getStatusText(item.status) : '已购入' }}
              </div>
            </div>

            <div class="btns" v-if="currentType === 'sell'">
              <button class="edit-btn" @click="toEdit(item)">编辑</button>
              <button v-if="item.status === 0" class="off-btn" @click="off(item.id)">下架</button>
              <button class="del-btn" @click="del(item.id)">删除</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 发布弹窗（样式不变） -->
    <div v-if="showPublish" class="dialog-overlay" @click="closePublish">
      <div class="dialog-content" @click.stop>
        <h3>发布商品</h3>
        <!-- 表单内容不变 -->
        <div class="form-item">
          <label>商品名称</label>
          <input v-model="publishForm.name" placeholder="请输入商品名称" />
        </div>
        <div class="form-item">
          <label>价格</label>
          <input v-model="publishForm.price" type="number" placeholder="请输入价格" />
        </div>
        <div class="form-item">
          <label>商品类型</label>
          <select v-model="publishForm.type">
            <option value="学习用品">学习用品</option>
            <option value="生活用品">生活用品</option>
            <option value="电子数码">数码产品</option>
            <option value="服饰">服饰</option>
            <option value="运动器材">运动器材</option>
            <option value="小家电">小家电</option>
            <option value="交通出行">交通出行</option>  
            <option value="其他">其他</option>
          </select>
        </div>
        <div class="form-item">
          <label>商品描述</label>
          <textarea v-model="publishForm.info" rows="3" placeholder="简单描述一下"></textarea>
        </div>
        <div class="form-item">
          <label>商品图片</label>
          <input type="file" accept="image/*" @change="selectImg" />
          <img v-if="previewImg" :src="previewImg" class="preview" />
        </div>
        <div class="btns-row">
          <button @click="closePublish">取消</button>
          <button @click="doPublish">确认发布</button>
        </div>
      </div>
    </div>

    <!-- 编辑弹窗（样式不变） -->
    <div v-if="showEdit" class="dialog-overlay" @click="closeEdit">
      <div class="dialog-content" @click.stop>
        <h3>编辑商品</h3>
        <!-- 表单内容不变 -->
        <div class="form-item">
          <label>商品名称</label>
          <input v-model="editForm.name" />
        </div>
        <div class="form-item">
          <label>价格</label>
          <input v-model="editForm.price" type="number" />
        </div>
        <div class="form-item">
          <label>商品类型</label>
          <select v-model="editForm.type">
            <option value="学习用品">学习用品</option>
            <option value="生活用品">生活用品</option>
            <option value="数码产品">数码产品</option>
            <option value="服饰">服饰</option>
            <option value="运动器材">运动器材</option>
            <option value="小家电">小家电</option>
            <option value="交通出行">交通出行</option>
            <option value="其他">其他</option>
          </select>
        </div>
        <div class="form-item">
          <label>商品描述</label>
          <textarea v-model="editForm.info" rows="3"></textarea>
        </div>
        <div class="btns-row">
          <button @click="closeEdit">取消</button>
          <button @click="doUpdate">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080'
import { ref, onMounted, computed } from 'vue' 
import axios from 'axios'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const list = ref([])
const currentType = ref('sell')
const filterStatus = ref('')
const showPublish = ref(false)
const publishForm = ref({
  name: '',
  price: '',
  type: '',
  info: '',
  image: ''
})
const previewImg = ref('')

const showEdit = ref(false)
const editForm = ref({
  id: '',
  name: '',
  price: '',
  type: '',
  info: ''
})
// 筛选后的列表
const filteredList = computed(() => {
  if (filterStatus.value === '') return list.value
  return list.value.filter(item => item.status === filterStatus.value)
})
onMounted(() => {
  const userId = route.query.userId
  if (userId) {
    getMyList(userId)
  } else {
    getMyList()
  }
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
const switchTab = (type) => {
  currentType.value = type
  getMyList()
}

const typeStats = ref([])

const calculateStats = () => {
  const stats = {}
  list.value.forEach(item => {
    const type = item.type || '其他'
    if (!stats[type]) {
      stats[type] = { count: 0, color: getRandomColor(type) }
    }
    stats[type].count++
  })
  
  const total = list.value.length
  const result = Object.entries(stats).map(([type, data]) => ({
    type,
    count: data.count,
    percent: total > 0 ? (data.count / total * 100).toFixed(1) : 0,
    color: data.color
  }))
  
  typeStats.value = result.sort((a, b) => b.count - a.count)
}
// 获取状态文本
const getStatusText = (status) => {
  const map = {
    0: '出售中',
    1: '已卖掉',
    2: '已下架',
    3: '审核中'
  }
  return map[status] || '未知'
}
const getRandomColor = (type) => {
  const colorMap = {
    '学习用品': '#409eff',
    '生活用品': '#67c23a',
    '数码产品': '#e6a23c',
    '服饰': '#f56c6c',
    '运动器材': '#909399',
    '小家电': '#00c800',
    '交通出行': '#ff9f00',
    '其他': '#a18cd1'
  }
  return colorMap[type] || '#409eff'
}

const getMyList = async (targetUserId = null) => {
  try {
    let url = `${API_BASE}/product/my/list`
    let params = { type: currentType.value }
    
    if (targetUserId) {
      url = `${API_BASE}/product/admin/user/products`
      params = { userId: targetUserId }
    }
    
    const res = await axios.get(url, {
      params,
      withCredentials: true
    })
    list.value = res.data.data || []
    calculateStats()
  } catch (err) {
    console.error('获取商品失败', err)
    list.value = []
  }
}

const off = async (id) => {
  if (!confirm('确定下架？')) return
  await axios.post(`${API_BASE}/product/off/${id}`)
  getMyList()
}

const del = async (id) => {
  if (!confirm('确定删除？')) return
  await axios.delete(`${API_BASE}/product/delete/${id}`)
  getMyList()
}

const toEdit = (item) => {
  editForm.value = { ...item }
  showEdit.value = true
}

const closeEdit = () => {
  showEdit.value = false
}

const doUpdate = async () => {
  await axios.post(`${API_BASE}/product/update`, editForm.value)
  closeEdit()
  getMyList()
  alert('保存成功')
}

const selectImg = async (e) => {
  const file = e.target.files[0]
  if (!file) return

  previewImg.value = URL.createObjectURL(file)
  const formData = new FormData()
  formData.append('file', file)

  try {
    const res = await axios.post(`${API_BASE}/product/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      withCredentials: true
    })
    const imgName = res.data.data
    publishForm.value = { ...publishForm.value, image: imgName }
  } catch (err) {
    console.error('上传失败：', err)
    alert('上传失败！')
  }
}

const closePublish = () => {
  showPublish.value = false
  publishForm.value = { name: '', price: '', type: '', info: '', image: '' }
  previewImg.value = ''
}

const doPublish = async () => {
  if (!publishForm.value.name || !publishForm.value.price) {
    alert('请完善商品名称和价格！')
    return
  }
  try {
    await axios.post(`${API_BASE}/product/add`, publishForm.value, {
      withCredentials: true
    })
    closePublish()
    getMyList()
    alert('发布成功！')
  } catch (err) {
    console.error('发布失败', err)
    alert('发布失败')
  }
}

const getImg = (img) => {
  if (!img) return `${API_BASE}/products/default.jpg`
  return `${API_BASE}/products/${img}?v=${Date.now()}`
}

const goBack = () => router.back()
</script>

<style scoped>
.my-product {
  min-height: 100vh;
  background: linear-gradient(145deg, #e8f4ff 0%, #d4e8ff 100%);
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding-top: 20px;
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
  font-size: 22px;
  font-weight: 600;
  color: #1f2937;
}

.publish-btn {
  background: linear-gradient(135deg, #2563eb, #1e40af);
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 30px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s;
}

.publish-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

/* Tab 栏 */
.tab-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  background: white;
  padding: 6px;
  border-radius: 50px;
  width: fit-content;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(37, 99, 235, 0.1);
}

.tab {
  padding: 8px 24px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  border-radius: 40px;
  color: #4b5563;
  transition: all 0.3s;
}

.tab.active {
  background: linear-gradient(135deg, #2563eb, #1e40af);
  color: white;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.2);
}

/* 左右布局 */
.two-columns {
  display: flex;
  gap: 24px;
}

/* 左侧统计卡片 */
.left-stats {
  width: 240px;
  flex-shrink: 0;
}

.stats-card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(37, 99, 235, 0.1);
  position: sticky;
  top: 20px;
}

.stats-title {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 2px solid #e5e7eb;
}

.stats-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
}

.stat-type {
  width: 65px;
  color: #6b7280;
  font-weight: 500;
}

.stat-bar {
  flex: 1;
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
}

.stat-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s;
  background: linear-gradient(135deg, #2563eb, #1e40af);
}

.stat-count {
  width: 40px;
  text-align: right;
  color: #9ca3af;
  font-size: 11px;
}

.stat-empty {
  text-align: center;
  color: #9ca3af;
  padding: 30px 0;
  font-size: 12px;
}

/* 右侧商品列表 */
.right-list {
  flex: 1;
  min-width: 0;
}

.empty {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 20px;
  color: #9ca3af;
  border: 1px solid rgba(37, 99, 235, 0.1);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

/* 商品卡片 */
.item {
  display: flex;
  padding: 16px;
  background: white;
  border-radius: 20px;
  margin-bottom: 16px;
  gap: 16px;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(37, 99, 235, 0.08);
}

.item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.1);
}

.item img {
  width: 90px;
  height: 90px;
  object-fit: cover;
  border-radius: 14px;
}

.info {
  flex: 1;
}

.name {
  font-weight: 600;
  margin-bottom: 6px;
  font-size: 16px;
  color: #1f2937;
}

.price {
  color: #2563eb;
  margin: 6px 0;
  font-size: 18px;
  font-weight: bold;
}

.type {
  font-size: 12px;
  color: #6b7280;
  margin: 4px 0;
}

.info-text {
  font-size: 12px;
  color: #6b7280;
  margin: 4px 0;
}

.status {
  font-size: 12px;
  display: inline-block;
  padding: 2px 10px;
  border-radius: 20px;
  margin-top: 6px;
}

.status_0 { background: #d1fae5; color: #059669; }
.status_1 { background: #fef3c7; color: #d97706; }
.status_2 { background: #fee2e2; color: #dc2626; }

.status_3 { background: #fef3c7; color: #d97706; }  /* 审核中-橙色 */

.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.filter-bar span {
  padding: 6px 16px;
  background: white;
  border-radius: 30px;
  cursor: pointer;
  font-size: 13px;
  color: #4b5563;
  transition: all 0.3s;
  border: 1px solid rgba(37, 99, 235, 0.1);
}

.filter-bar span.active {
  background: linear-gradient(135deg, #2563eb, #1e40af);
  color: white;
  border-color: transparent;
}

/* 按钮组 */
.btns {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.btns button {
  padding: 6px 16px;
  font-size: 12px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
}

.edit-btn {
  background: white;
  border: 1px solid #2563eb;
  color: #2563eb;
}

.edit-btn:hover {
  background: #2563eb;
  color: white;
}

.off-btn {
  background: white;
  border: 1px solid #f97316;
  color: #f97316;
}

.off-btn:hover {
  background: #f97316;
  color: white;
}

.del-btn {
  background: white;
  border: 1px solid #ef4444;
  color: #ef4444;
}

.del-btn:hover {
  background: #ef4444;
  color: white;
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
  padding: 28px;
  width: 90%;
  max-width: 450px;
  max-height: 85vh;
  overflow-y: auto;
  z-index: 100000;
}

.dialog-content h3 {
  margin: 0 0 20px 0;
  text-align: center;
  font-size: 20px;
  color: #1f2937;
}

.form-item {
  margin-bottom: 16px;
}

.form-item label {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #4b5563;
}

.form-item input, .form-item select, .form-item textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  box-sizing: border-box;
  transition: all 0.3s;
}

.form-item input:focus, .form-item select:focus, .form-item textarea:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
}
.preview {
  width: 80px;
  height: 80px;
  object-fit: cover;
  margin-top: 8px;
  border-radius: 8px;
}

.btns-row {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.btns-row button {
  flex: 1;
  padding: 10px;
  border-radius: 30px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.btns-row button:first-child {
  background: #f5f5f5;
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

@media (max-width: 700px) {
  .two-columns {
    flex-direction: column;
  }
  .left-stats {
    width: 100%;
  }
  .stats-card {
    position: static;
  }
}
</style>