<template>
  <div class="gift-pack-page" :class="pageClass">
    
    <div class="header">
      <div class="back" @click="goHome">← 返回</div>
      <h2>{{ pageTitle }}</h2>
      <button class="create-btn" @click="showCreateDialog = true">+ 创建礼包</button>
      
    </div>

    <!-- 倒计时 -->
    <div class="countdown" v-if="daysLeft !== null">
      <div class="countdown-icon">{{ pageIcon }}</div>
      <div class="countdown-text">
        {{ pageSlogan }}
        <span class="days">{{ daysLeft }}</span> 天
      </div>
    </div>

    <!-- 抽奖入口 -->
    <div class="lottery-entrance" @click="showLottery = true">
      <div class="lottery-icon">🎁</div>
      <div class="lottery-text">抽奖领优惠券</div>
      <div class="lottery-arrow">→</div>
    </div>

    <!-- 礼包列表 -->
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="packList.length === 0" class="empty">暂无礼包，快来创建第一个吧~</div>
    <div v-else class="pack-list">
      <div class="pack-card" v-for="pack in packList" :key="pack.id" @click="goToDetail(pack.id)">
        <div class="pack-cover">
 <div class="cover-grid" v-if="pack.products && pack.products.length >= 4">
    <div class="grid-item" v-for="(p, idx) in pack.products.slice(0,4)" :key="idx">
      <img :src="`${API_BASE}/products/${p.image}`" />
    </div>
    <!-- 不足4个时补空白 -->
    <div class="grid-item empty" v-for="i in (4 - (pack.products?.slice(0,4).length || 0))" :key="'empty'+i">
    </div>
  </div>
  <div class="discount-tag">
  {{ pack.type === 'graduation' ? '8.5折' : '9折' }}
</div>
  
</div>
        <div class="pack-info">
          <div class="pack-name">{{ pack.name }}</div>
          <div class="pack-desc">{{ pack.description }}</div>
          <div class="pack-seller">
            <img :src="`${API_BASE}/avatar/${pack.seller?.avatar || 'default.jpg'}`" class="seller-avatar" />
            <span>{{ pack.seller?.username }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 创建礼包弹窗 -->
    <div v-if="showCreateDialog" class="dialog-overlay" @click="showCreateDialog = false">
      <div class="dialog-content" @click.stop>
        <h3>创建礼包</h3>
        <div class="form-item">
          <label>礼包名称</label>
          <input v-model="createForm.name" placeholder="例如：毕业大礼包" />
        </div>
        <div class="form-item">
          <label>描述</label>
          <textarea v-model="createForm.description" rows="2" placeholder="描述一下礼包内容"></textarea>
        </div>
        <div class="form-item">
          <label>选择商品（2-4个）</label>
          <div class="product-select-list">
            <div v-for="product in myProducts" :key="product.id" class="product-select-item" @click="toggleSelect(product)">
              <input type="checkbox" :checked="selectedIds.includes(product.id)" />
              <img :src="`${API_BASE}/products/${product.image}`" class="select-img" />
              <span class="product-name">{{ product.name }}</span>
              <span class="select-price">¥{{ product.price }}</span>
            </div>
          </div>
          <div v-if="myProducts.length === 0" class="empty-products">暂无在售商品，请先发布商品</div>
        </div>
        <div class="form-item">
          <label>折扣</label>
            <div class="discount-display">{{ type === 'graduation' ? '8.5折' : '9折' }}</div>
        </div>
        <div class="btns-row">
          <button @click="showCreateDialog = false">取消</button>
          <button @click="createGiftPack" :disabled="selectedIds.length < 2">创建礼包</button>
        </div>
      </div>
    </div>

    <!-- 抽奖弹窗 -->
    <div v-if="showLottery" class="lottery-modal" @click="showLottery = false">
     <div class="lottery-content" :class="type === 'graduation' ? 'lottery-graduation' : 'lottery-freshman'">
        <div class="lottery-header">
          <span class="close" @click="showLottery = false">×</span>
          <h3>🎲 幸运大转盘</h3>
        </div>
        
  <div class="wheel-wrapper">
  <div class="wheel" :style="{ 
    transform: `rotate(${rotateDeg}deg)`,
    background: `conic-gradient(${gradientColors})`
  }">
    <!-- 文字放在 wheel 内部，随转盘旋转 -->
    <div v-for="(item, idx) in prizeList" :key="idx" class="segment-text" :style="getTextStyle(idx)">
      {{ item.name }}
    </div>
  </div>
  <div class="pointer" @click.stop="startDraw"></div>
</div>

        <div class="lottery-tip">今日剩余 {{ remainDraw }} 次</div>
        
       <div class="my-coupons-mini" v-if="myCoupons.length > 0">
  <div class="mini-title">我的优惠券</div>
  <div class="mini-list">
    <div class="mini-coupon" v-for="c in myCoupons.slice(0, 3)" :key="c.id">
      <span class="coupon-name">{{ c.coupon?.name }}</span>
      <span class="coupon-value">
        <span v-if="c.coupon?.type === 'discount' && c.coupon?.value === 0">🎉 免单</span>
       
        
      </span>
    </div>
  </div>
  <!-- 免单动画 -->
<div v-if="showFreeAnimation" class="free-animation">
  <div class="free-confetti"></div>
  <div class="free-text">🎉 免单 🎉</div>
  <div class="free-sparkle">✨✨✨</div>
</div>
</div>
      </div>
    </div>
  </div>
</template>

<script setup>
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080'
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { ElNotification } from 'element-plus'
const route = useRoute()
const router = useRouter()

const type = ref(route.query.type || 'graduation')
const packList = ref([])
const myProducts = ref([])
const selectedIds = ref([])
const loading = ref(false)
const showCreateDialog = ref(false)
const showLottery = ref(false)
const rotateDeg = ref(0)
const isDrawing = ref(false)
const remainDraw = ref(3)
const prizeList = ref([])
const myCoupons = ref([])
const showFreeAnimation = ref(false)

const createForm = ref({
  name: '',
  description: '',
  discount: type.value === 'graduation' ? 0.85 : 0.9
})

// 页面配置
const pageConfig = {
  graduation: {
    title: '🎓 毕业季大礼包',
    slogan: '距离毕业离校还有',
    icon: '🎓',
    class: 'graduation-page'
  },
  freshman: {
    title: '📚 开学季新生礼包',
    slogan: '距离开学还有',
    icon: '📚',
    class: 'freshman-page'
  }
}

const pageTitle = computed(() => pageConfig[type.value]?.title)
const pageSlogan = computed(() => pageConfig[type.value]?.slogan)
const pageIcon = computed(() => pageConfig[type.value]?.icon)
const pageClass = computed(() => pageConfig[type.value]?.class)

// 倒计时
const targetDate = computed(() => {
  const now = new Date()
  const year = now.getFullYear()
  if (type.value === 'graduation') {
    return new Date(year, 5, 1)
  } else {
    return new Date(year, 8, 1)
  }
})

const daysLeft = computed(() => {
  const now = new Date()
  const diff = targetDate.value - now
  if (diff <= 0) return 0
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
})

// 获取礼包列表
const loadPacks = async () => {
  loading.value = true
  try {
    const res = await axios.get(`${API_BASE}/giftPack/list`, {
      params: { type: type.value },
      withCredentials: true
    })
    packList.value = res.data.data || []
    console.log('加载礼包:', type.value, packList.value.length)
  } catch (err) {
    console.error('加载礼包失败', err)
  } finally {
    loading.value = false
  }
}

// 获取我的商品
const loadMyProducts = async () => {
  try {
    const res = await axios.get(`\${API_BASE}/product/my/all`, {
      withCredentials: true
    })
    myProducts.value = res.data.data || []
  } catch (err) {
    console.error('获取商品失败', err)
  }
}

// 切换选择商品
const toggleSelect = (product) => {
  const index = selectedIds.value.indexOf(product.id)
  if (index > -1) {
    selectedIds.value.splice(index, 1)
  } else {
    if (selectedIds.value.length >= 4) {
      alert('最多选择4个商品')
      return
    }
    selectedIds.value.push(product.id)
  }
}

// 创建礼包
const createGiftPack = async () => {
  if (selectedIds.value.length < 2) {
    alert('至少选择2个商品')
    return
  }
   let discount = type.value === 'graduation' ? 0.85 : 0.9
  try {
    const res = await axios.post(`\${API_BASE}/giftPack/create`, {
      name: createForm.value.name,
      description: createForm.value.description,
      productIds: selectedIds.value.join(','),
      discount: createForm.value.discount,
      type: type.value
    }, {
      withCredentials: true
    })
    
    if (res.data.code === 200) {
      alert('创建成功')
      showCreateDialog.value = false
      selectedIds.value = []
      createForm.value.name = ''
      createForm.value.description = ''
      loadPacks()
    } else {
      alert(res.data.msg)
    }
  } catch (err) {
    alert('创建失败')
  }
}
const getTextStyle = (index) => {
  const count = prizeList.value.length
  const angle = (index * 360 / count) + (360 / count / 2) - 90  // 扇形中间角度
  const radius = 85  // 距离圆心的距离
  const centerX = 130
  const centerY = 130
  const rad = angle * Math.PI / 180
  const left = centerX + radius * Math.cos(rad)
  const top = centerY + radius * Math.sin(rad)
  return {
    position: 'absolute',
    left: `${left}px`,
    top: `${top}px`,
    transform: 'translate(-50%, -50%)',
    fontSize: '11px',
    fontWeight: 'bold',
    color: 'white',
    textShadow: '0 1px 1px rgba(0,0,0,0.3)',
    whiteSpace: 'nowrap',
    zIndex: 15,
    background: 'rgba(0,0,0,0.3)',
    padding: '2px 6px',
    borderRadius: '20px'
  }
}

// 跳转详情
const goToDetail = (id) => {
  router.push(`/giftPack/detail/${id}?type=${type.value}`)
}

// 抽奖相关
// 获取奖品列表（从后端获取实际优惠券）
const loadPrizeList = async () => {
  try {
    const res = await axios.get(`\${API_BASE}/coupon/list`)
    prizeList.value = res.data.data || []
    console.log('奖品列表:', prizeList.value)
  } catch (err) {
    console.error('获取奖品失败', err)
    // 兜底数据
    prizeList.value = [
      { name: '8.5折券', type: 'discount', value: 0.85 },
      { name: '满200减80', type: 'cash', value: 80, minAmount: 200 },
      { name: '满800减300', type: 'cash', value: 300, minAmount: 800 },
      { name: '9折券', type: 'discount', value: 0.9 },
      { name: '免单券', type: 'discount', value: 0 }
    ]
  }
}


const loadMyCoupons = async () => {
  const res = await axios.get(`\${API_BASE}/coupon/my`, {
    withCredentials: true
  })
  myCoupons.value = res.data.data || []
}

const loadRemainDraw = async () => {
  const res = await axios.get(`\${API_BASE}/coupon/remain`, {
    withCredentials: true
  })
  remainDraw.value = res.data.data || 0
}


// 渐变色
const gradientColors = computed(() => {
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7']
  const count = prizeList.value.length
  const angle = 360 / count
  let stops = []
  for (let i = 0; i < count; i++) {
    const start = i * angle
    const end = (i + 1) * angle
    stops.push(`${colors[i % colors.length]} ${start}deg ${end}deg`)
  }
  return stops.join(', ')
})



const startDraw = async () => {
  if (isDrawing.value) return
  if (remainDraw.value <= 0) {
    alert('今日抽奖次数已用完')
    return
  }
  
  isDrawing.value = true
  
  // 获取今日已抽次数
  const todayCount = 2 - remainDraw.value  // 已抽次数
  const isFirstDraw = todayCount === 0  // 第一次抽奖
  
  try {
    let prize = null
    
    if (isFirstDraw) {
      // ✅ 第一次：必中当前活动的优惠券
      if (type.value === 'graduation') {
        prize = prizeList.value.find(p => p.name.includes('8.5') || p.name.includes('毕业'))
      } else {
        prize = prizeList.value.find(p => p.name.includes('9折') || p.name.includes('开学'))
      }
    } else {
      // ✅ 第二次：随机抽其他券（排除当前活动券）
      const excludeName = type.value === 'graduation' ? '8.5' : '9折'
      const otherCoupons = prizeList.value.filter(p => !p.name.includes(excludeName))
      if (otherCoupons.length > 0) {
        const randomIndex = Math.floor(Math.random() * otherCoupons.length)
        prize = otherCoupons[randomIndex]
      }
    }
    
    // 兜底
    if (!prize && prizeList.value.length > 0) {
      prize = prizeList.value[0]
    }
    console.log('prizeList:', prizeList.value)
console.log('找的prize:', prize)
    // 计算转盘角度
    const prizeIndex = prizeList.value.findIndex(p => p.id === prize.id)
    const anglePer = 360 / prizeList.value.length
    const randomRounds = 5 + Math.floor(Math.random() * 6)
    const targetRotate = 360 * randomRounds + (360 - prizeIndex * anglePer - anglePer / 2)
    rotateDeg.value = targetRotate
    
    // 调用后端抽奖（实际发券）
   const res = await axios.post(`\${API_BASE}/coupon/draw`, null, {
  params: { couponId: prize.id },
  withCredentials: true
})
    if (res.data.code !== 200) {
      alert(res.data.msg)
      isDrawing.value = false
      return
    }
    
    
    setTimeout(() => {
  ElNotification({
  title: '抽奖结果',
  message: `🎉 恭喜抽中：${prize.name}！`,
  type: 'success',
  position: 'top-right',
  zIndex: 10000
})
      loadMyCoupons()
      loadRemainDraw()
      isDrawing.value = false
    }, 3000)
    
  } catch (err) {
    console.error('抽奖失败', err)
    alert('抽奖失败')
    isDrawing.value = false
  }
}
const goHome = () => {
  router.push('/productHome')
}
onMounted(() => {
  loadPacks()
  loadMyProducts()
  loadPrizeList()
  loadMyCoupons()
  loadRemainDraw()
})
</script>

<style scoped>
.gift-pack-page {
  min-height: 100vh;
  padding: 20px;
}

.graduation-page {
  background: linear-gradient(135deg, #1a237e 0%, #283593 100%);
}

/* 开学季 - 青春绿 */
.freshman-page {
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
}

.freshman-page .header,
.freshman-page .countdown,
.freshman-page .lottery-entrance {
  color: #2e7d32;
}

.freshman-page .countdown {
  background: rgba(46, 125, 50, 0.12);
  backdrop-filter: blur(4px);
}

.freshman-page .lottery-entrance {
  background: rgba(46, 125, 50, 0.12);
  backdrop-filter: blur(4px);
}

.freshman-page .create-btn {
  background: #2e7d32;
  color: white;
  box-shadow: 0 2px 8px rgba(46, 125, 50, 0.3);
}

.freshman-page .create-btn:hover {
  background: #43a047;
  transform: translateY(-2px);
}

.freshman-page .pack-card {
  border: 1px solid rgba(46, 125, 50, 0.15);
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
}

.freshman-page .pack-card:hover {
  box-shadow: 0 8px 20px rgba(46, 125, 50, 0.15);
}

.freshman-page .discount-tag {
  background: #2e7d32;
  color: white;
}

.freshman-page .back {
  background: rgba(46, 125, 50, 0.15);
}

.freshman-page .back:hover {
  background: rgba(46, 125, 50, 0.25);
}

.header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
  color: white;
}

.back {
  cursor: pointer;
  font-size: 16px;
  padding: 6px 12px;
  background: rgba(255,255,255,0.2);
  border-radius: 8px;
}

h2 {
  margin: 0;
  flex: 1;
}

.create-btn {
  background: rgba(255,255,255,0.2);
  border: none;
  padding: 8px 20px;
  border-radius: 30px;
  color: white;
  cursor: pointer;
}

.countdown {
  background: rgba(255,255,255,0.15);
  border-radius: 60px;
  padding: 15px 25px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  color: white;
}

.countdown-icon {
  font-size: 32px;
}

.countdown-text {
  font-size: 18px;
}

.days {
  font-size: 32px;
  font-weight: bold;
  margin: 0 8px;
}

.lottery-entrance {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255,255,255,0.15);
  border-radius: 60px;
  padding: 12px 20px;
  margin-bottom: 20px;
  cursor: pointer;
  transition: all 0.3s;
  color: white;
}

.lottery-entrance:hover {
  background: rgba(255,255,255,0.25);
  transform: translateY(-2px);
}

.lottery-icon {
  font-size: 28px;
}

.lottery-text {
  font-size: 16px;
  font-weight: bold;
}

.lottery-arrow {
  font-size: 20px;
}

.pack-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.pack-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s;
}

.pack-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.pack-cover {
  position: relative;
  height: 160px;
  overflow: hidden;
}

.cover-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  width: 100%;
  height: 100%;
  gap: 2px;
  background: #f5f5f5;
}

.grid-item {
  overflow: hidden;
}

.grid-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.discount-tag {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #ff4400;
  color: white;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
}

.pack-info {
  padding: 15px;
}

.pack-name {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 6px;
}

.pack-desc {
  font-size: 13px;
  color: #666;
  margin-bottom: 10px;
  display: -webkit-box;
 
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.pack-seller {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #999;
}

.seller-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
}

.loading, .empty {
  text-align: center;
  padding: 50px;
  color: rgba(255,255,255,0.8);
}

/* 弹窗样式 */
/* 创建礼包弹窗样式 */
.create-pack-dialog {
  width: 520px;
  max-width: 90%;
  border-radius: 24px;
  padding: 0;
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
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  position: relative;
}

.header-icon {
  font-size: 28px;
}

.dialog-header h3 {
  margin: 0;
  flex: 1;
  font-size: 20px;
  font-weight: 600;
}

.dialog-header .close {
  font-size: 28px;
  cursor: pointer;
  opacity: 0.8;
  transition: all 0.3s;
}

.dialog-header .close:hover {
  opacity: 1;
  transform: scale(1.1);
}

.dialog-body {
  padding: 24px;
  max-height: 60vh;
  overflow-y: auto;
}

.modern-input, .modern-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  font-size: 14px;
  transition: all 0.3s;
  box-sizing: border-box;
}

.modern-input:focus, .modern-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.modern-textarea {
  resize: none;
  font-family: inherit;
}

.product-select-list {
  max-height: 280px;
  overflow-y: auto;
  border: 1px solid #e0e0e0;
  border-radius: 16px;
  background: #f8f9fa;
}

.product-select-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-bottom: 1px solid #e0e0e0;
  cursor: pointer;
  transition: all 0.3s;
}

.product-select-item:hover {
  background: rgba(102, 126, 234, 0.05);
}

.select-checkbox {
  position: relative;
}

.select-checkbox input {
  display: none;
}

.checkmark {
  width: 20px;
  height: 20px;
  border: 2px solid #ddd;
  border-radius: 6px;
  display: inline-block;
  position: relative;
  cursor: pointer;
}

.select-checkbox input:checked + .checkmark {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-color: #667eea;
}

.select-checkbox input:checked + .checkmark::after {
  content: "✓";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
}

.select-img {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  object-fit: cover;
}

.select-info {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.select-price {
  font-size: 15px;
  font-weight: bold;
  color: #ff6b6b;
}

.selected-count {
  margin-top: 10px;
  font-size: 13px;
  color: #667eea;
  text-align: right;
}

.empty-products {
  padding: 30px;
  text-align: center;
  color: #999;
}

.discount-display {
  padding: 12px 16px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-radius: 12px;
  text-align: center;
  font-weight: bold;
  font-size: 16px;
}

.dialog-footer {
  display: flex;
  gap: 12px;
  padding: 16px 24px 24px;
  background: #fff;
  border-top: 1px solid #f0f0f0;
}

.cancel-btn, .confirm-btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 40px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.cancel-btn {
  background: #f0f0f0;
  color: #666;
}

.cancel-btn:hover {
  background: #e0e0e0;
}

.confirm-btn {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.confirm-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.confirm-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}
.dialog-overlay, .lottery-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.dialog-content {
  background: white;
  border-radius: 16px;
  padding: 24px;
  width: 500px;
  max-width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.dialog-content h3 {
  margin: 0 0 20px 0;
}

.form-item {
  margin-bottom: 15px;
}

.form-item label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.form-item input, .form-item select, .form-item textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-sizing: border-box;
}

.product-select-list {
  max-height: 250px;
  overflow-y: auto;
  border: 1px solid #eee;
  border-radius: 8px;
}

.product-select-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  text-align: left;
}

.product-select-item input {
  width: 18px;
  height: 18px;
  margin: 0;
  flex-shrink: 0;
}

.select-img {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
}

.product-select-item .product-name {
  flex: 1;
  font-size: 14px;
  text-align: left;
}

.select-price {
  font-size: 14px;
  color: #ff4400;
  font-weight: bold;
  flex-shrink: 0;
}

.empty-products {
  padding: 20px;
  text-align: center;
  color: #999;
}

.btns-row {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.btns-row button {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.btns-row button:first-child {
  background: #f0f0f0;
}

.btns-row button:last-child {
  background: #409eff;
  color: white;
}

.btns-row button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* 抽奖弹窗 */
/* 毕业季弹窗背景 */

.lottery-content {
  border-radius: 32px;
  padding: 24px;
  width: 400px;
  max-width: 90%;
  text-align: center;
  color: white;
}
.lottery-graduation {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* 开学季弹窗背景 */
.lottery-freshman {
  background: linear-gradient(135deg, #66bb6a 0%, #2e7d32 100%);
}

.lottery-header {
  position: relative;
  margin-bottom: 20px;
}

.lottery-header .close {
  position: absolute;
  right: 0;
  top: 0;
  font-size: 28px;
  cursor: pointer;
  opacity: 0.8;
}

.lottery-header h3 {
  margin: 0;
  font-size: 24px;
}

.wheel-wrapper {
  position: relative;
  width: 260px;
  height: 260px;
  margin: 0 auto;
}

.wheel {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  transition: transform 3s cubic-bezier(0.25, 0.1, 0.15, 1);
  box-shadow: 0 8px 25px rgba(0,0,0,0.3);
}

.segment-text {
  position: absolute;
  font-size: 11px;
  font-weight: bold;
  color: white;
  text-shadow: 0 1px 1px rgba(0,0,0,0.3);
  white-space: nowrap;
  z-index: 15;
  background: rgba(0,0,0,0.3);
  padding: 2px 6px;
  border-radius: 20px;
  pointer-events: none;
}

.pointer {
  position: absolute;
  top: -18px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 25px solid transparent;
  border-right: 25px solid transparent;
  border-top: 45px solid #ffd700;
  cursor: pointer;
  z-index: 20;
}
.pointer:after {
  content: "抽";
  position: absolute;
  top: -38px;
  left: -8px;
  font-size: 14px;
  font-weight: bold;
  color: #333;
}



.lottery-tip {
  margin-top: 20px;
  font-size: 14px;
  opacity: 0.9;
}

.my-coupons-mini {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid rgba(255,255,255,0.2);
}

.mini-title {
  font-size: 14px;
  margin-bottom: 10px;
}

.mini-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.mini-coupon {
  background: rgba(255,255,255,0.2);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
}
.free-animation {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  z-index: 10001;
  animation: fadeOut 2s ease-in-out forwards;
}

.free-text {
  font-size: 48px;
  font-weight: bold;
  color: #ffd700;
  text-shadow: 0 0 20px #ff6600;
  animation: bounce 0.5s ease infinite;
}

.free-sparkle {
  font-size: 36px;
  margin-top: 20px;
  animation: spin 1s linear infinite;
}

@keyframes fadeOut {
  0% { opacity: 1; }
  70% { opacity: 1; }
  100% { opacity: 0; visibility: hidden; }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>