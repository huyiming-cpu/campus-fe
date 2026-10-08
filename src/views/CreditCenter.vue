<template>
  <div class="credit-center">
       <div v-if="showRank" class="dialog-overlay" @click="showRank = false">
      <div class="rank-dialog" @click.stop>
        <div class="rank-header">
          <h3>🏆 信用分排行榜</h3>
          <span class="close" @click="showRank = false">×</span>
        </div>
        <div class="rank-body">
          <div v-if="loadingRank" class="rank-loading">加载中...</div>
          <div v-else-if="rankList.length === 0" class="rank-empty">暂无数据</div>
          <div v-else class="rank-list">
            <div class="rank-item" v-for="user in rankList" :key="user.id" :class="{ 'top3': user.rank <= 3 }">
              <div class="rank-num">
                <span v-if="user.rank === 1">🥇</span>
                <span v-else-if="user.rank === 2">🥈</span>
                <span v-else-if="user.rank === 3">🥉</span>
                <span v-else class="rank-number">{{ user.rank }}</span>
              </div>
              <img :src="`http://localhost:8080/avatar/${user.avatar || 'default.jpg'}`" class="rank-avatar" />
              <div class="rank-name">{{ user.username }}</div>
              <div class="rank-score">{{ user.creditScore }}分</div>
              <div class="rank-level" :class="'level-' + getLevelClass(user.creditLevel)">{{ user.creditLevel }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  
   
    <div class="header">
      <div class="back" @click="$router.back()">← 返回</div>
      <h2>📊 信用中心</h2>
    </div>

    <!-- 信用卡片 -->
    <div class="credit-card">
      <div class="credit-score">
        <div class="score-label">信用分</div>
        <div class="score-value">{{ userInfo.creditScore || 0 }}</div>
      </div>
      <div class="credit-level">
        <div class="level-label">信用等级</div>
        <div class="level-value" :class="levelClass">{{ userInfo.creditLevel || '暂无' }}</div>
      </div>
    </div>
    <!-- 距离下一等级提示 -->
<div class="next-level-info" v-if="nextLevelInfo && nextLevelInfo.score > 0">
  📈 距离 {{ nextLevelInfo.level }} 还差 {{ nextLevelInfo.score }} 分
</div>
 <!-- 操作按钮栏 -->

  <button class="game-btn" @click="openGame">🎮 诚信问答 +1分</button>


<!-- 游戏弹窗 -->
<div v-if="showGame" class="dialog-overlay" @click="showGame = false">
  <div class="game-dialog" @click.stop>
    <div class="game-header">
      <h3>🎮 诚信问答小游戏</h3>
      <span class="close" @click="showGame = false">×</span>
    </div>
    <div class="game-body">
      <div class="game-progress">第 {{ currentQuestionIndex + 1 }} / {{ totalQuestions }} 题</div>
      <div class="game-question">{{ currentQuestion.text }}</div>
      <div class="game-options">
        <div v-for="(option, idx) in currentQuestion.options" :key="idx"
             class="game-option"
             :class="{ selected: selectedOption === idx, correct: showResult && idx === currentQuestion.correct, wrong: showResult && selectedOption === idx && idx !== currentQuestion.correct }"
             @click="selectOption(idx)">
          {{ option }}
        </div>
      </div>
      <div class="game-buttons">
        <button v-if="!showResult" class="next-btn" @click="nextQuestion" :disabled="selectedOption === null">下一题</button>
        <button v-else class="next-btn" @click="loadNextQuestion">下一题</button>
      </div>
    </div>
  </div>
</div>

<!-- 游戏结果弹窗 -->
<div v-if="showGameResult" class="dialog-overlay" @click="showGameResult = false">
  <div class="result-dialog" @click.stop>
    <div class="result-header" :class="gamePassed ? 'pass' : 'fail'">
      <span class="result-icon">{{ gamePassed ? '🎉' : '😢' }}</span>
      <h3>{{ gamePassed ? '恭喜通关！' : '答题失败' }}</h3>
    </div>
    <div class="result-body">
      <p v-if="gamePassed">答对 {{ correctCount }} 题，信用分 +1！</p>
      <p v-else>答对 {{ correctCount }} 题，还差 {{ 5 - correctCount }} 题，下次加油！</p>
      <button class="close-result-btn" @click="closeGameResult">关闭</button>
    </div>
  </div>
</div>
<div class="next-level-info max-level" v-else-if="nextLevelInfo && nextLevelInfo.score === 0">
  👑 恭喜！已达到最高等级
</div>

<!-- 操作按钮 -->
<div class="action-bar">
  <button class="rank-btn" @click="openRank">🏆 信用排行榜</button>
</div>

    <!-- 等级说明 -->
    <div class="level-info">
      <div class="info-title">📊 等级说明</div>
      <div class="info-list">
        <div class="info-item"><span class="badge">极好</span> ≥100分</div>
        <div class="info-item"><span class="badge">优秀</span> 80-99分</div>
        <div class="info-item"><span class="badge">良好</span> 60-79分</div>
        <div class="info-item"><span class="badge">一般</span> 40-59分</div>
        <div class="info-item"><span class="badge">较差</span> ≤39分</div>
      </div>
    </div>

    <!-- Tab 切换 -->
    <div class="tabs">
      <div class="tab" :class="{ active: currentTab === 'received' }" @click="switchTab('received')">
        收到的评价
      </div>
      <div class="tab" :class="{ active: currentTab === 'given' }" @click="switchTab('given')">
        给出的评价
      </div>
    </div>

    <!-- 评价列表 -->
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="evaluationList.length === 0" class="empty">暂无评价</div>
    <div v-else class="evaluation-list">
      <div class="evaluation-card" v-for="item in evaluationList" :key="item.id">
        <div class="card-header">
          <img :src="`http://localhost:8080/avatar/${getAvatar(item)}`" class="avatar" />
          <div class="user-info">
            <div class="username">{{ getUsername(item) }}</div>
            <div class="time">{{ formatTime(item.createTime) }}</div>
          </div>
          <div class="rating">
            <span v-for="i in 5" :key="i" class="star" :class="{ active: i <= item.rating }">★</span>
          </div>
        </div>
        <div class="card-content">
          <div class="product-info">
            <img :src="`http://localhost:8080/products/${item.product?.image}`" class="product-img" />
            <span class="product-name">{{ item.product?.name }}</span>
          </div>
          <div class="comment">{{ item.content }}</div>
          <div v-if="item.reply" class="reply">
            <span class="reply-label">卖家回复：</span>
            <span class="reply-content">{{ item.reply }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
 
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()

const userInfo = ref({})
const currentTab = ref('received')
const evaluationList = ref([])
const loading = ref(false)

// 等级样式
const levelClass = computed(() => {
  const level = userInfo.value.creditLevel
  if (level === '极好') return 'level-excellent'
  if (level === '优秀') return 'level-good'
  if (level === '良好') return 'level-fine'
  if (level === '一般') return 'level-normal'
  return 'level-bad'
})

// 获取用户信息
const getUserInfo = async () => {
  try {
    const res = await axios.get('http://localhost:8080/user/getMyInfo', {
      withCredentials: true
    })
    userInfo.value = res.data.data
  } catch (err) {
    console.error('获取用户信息失败', err)
  }
}
//星星样式
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

// 切换Tab
const switchTab = (tab) => {
  currentTab.value = tab
  loadEvaluations()
}
// 获取等级样式类名
const getLevelClass = (level) => {
  if (level === '极好') return 'excellent'
  if (level === '优秀') return 'good'
  if (level === '良好') return 'fine'
  if (level === '一般') return 'normal'
  return 'bad'
}
// ========== 新增代码 ==========
const showRank = ref(false)  // 排行榜弹窗
const rankList = ref([])     // 排行榜数据
const loadingRank = ref(false)

// 计算距离下一等级还差多少分
const nextLevelInfo = computed(() => {
  const currentScore = userInfo.value.creditScore || 0
  const currentLevel = userInfo.value.creditLevel
  
  if (currentLevel === '较差') {
    const need = 40 - currentScore
    return { level: '一般', score: need > 0 ? need : 0 }
  } else if (currentLevel === '一般') {
    const need = 60 - currentScore
    return { level: '良好', score: need > 0 ? need : 0 }
  } else if (currentLevel === '良好') {
    const need = 80 - currentScore
    return { level: '优秀', score: need > 0 ? need : 0 }
  } else if (currentLevel === '优秀') {
    const need = 100 - currentScore
    return { level: '极好', score: need > 0 ? need : 0 }
  } else if (currentLevel === '极好') {
    return { level: '已达最高等级', score: 0 }
  }
  return null
})
// ========== 游戏相关 ==========
const showGame = ref(false)
const showGameResult = ref(false)
const currentQuestionIndex = ref(0)
const selectedOption = ref(null)
const showResult = ref(false)
const correctCount = ref(0)
const gamePassed = ref(false)

const totalQuestions = 5

// 题目库
const questionBank = [
  { text: "在校园二手交易中，以下哪种行为是正确的？", options: ["故意隐瞒商品瑕疵", "如实描述商品情况", "收到商品后不付款", "恶意差评"], correct: 1 },
  { text: "关于交易沟通，以下说法正确的是？", options: ["可以辱骂对方", "耐心礼貌沟通", "不回复消息", "随意取消订单"], correct: 1 },
  { text: "收到商品有问题时，应该怎么做？", options: ["直接给差评", "联系卖家友好沟通", "不确认收货也不沟通", "申请仅退款不退货"], correct: 1 },
  { text: "以下哪种行为有助于建立良好信用？", options: ["爽约不交易", "按时完成交易", "虚假宣传商品", "多次申请退款"], correct: 1 },
  { text: "关于评价他人，以下正确的是？", options: ["随意差评", "根据真实体验客观评价", "威胁卖家给好评", "不评价"], correct: 1 },
  { text: "卖家发货后，买家应该？", options: ["收到后及时确认收货", "一直不确认", "申请退款", "给差评"], correct: 0 },
  { text: "以下哪项是诚信交易的表现？", options: ["讨价还价后不买", "约定地点准时赴约", "临时取消交易", "隐瞒商品问题"], correct: 1 },
  { text: "关于商品价格，以下正确的是？", options: ["可以随意抬价", "明码标价，诚信交易", "低价引流", "标价后反悔"], correct: 1 }
]

// 随机选择5道题
const currentQuestions = ref([])

// 初始化游戏
const initGame = () => {
  // 随机选5道不同的题
  const shuffled = [...questionBank]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  currentQuestions.value = shuffled.slice(0, 5)
  currentQuestionIndex.value = 0
  selectedOption.value = null
  showResult.value = false
  correctCount.value = 0
}

// 当前题目
const currentQuestion = computed(() => currentQuestions.value[currentQuestionIndex.value])

// 打开游戏
const openGame = () => {
  initGame()
  showGame.value = true
}

// 选择选项
const selectOption = (idx) => {
  if (showResult.value) return
  selectedOption.value = idx
}

// 下一题
const nextQuestion = () => {
  if (selectedOption.value === null) return
  
  // 判断对错
  const isCorrect = selectedOption.value === currentQuestion.value.correct
  if (isCorrect) {
    correctCount.value++
  }
  
  showResult.value = true
  
  // 如果是最后一题，结束游戏
  if (currentQuestionIndex.value + 1 >= totalQuestions) {
    setTimeout(() => {
      endGame()
    }, 1000)
    return
  }
}

// 加载下一题
const loadNextQuestion = () => {
  currentQuestionIndex.value++
  selectedOption.value = null
  showResult.value = false
}

// 结束游戏
const endGame = () => {
  showGame.value = false
  gamePassed.value = correctCount.value >= totalQuestions
  
  if (gamePassed.value) {
    addCreditScore()
  }
  
  showGameResult.value = true
}

// 加信用分
const addCreditScore = async () => {
  try {
    // 调用更新信用分的接口（你需要根据你的后端调整）
    const res = await axios.post('http://localhost:8080/user/credit/add', null, {
      params: { score: 1 },
      withCredentials: true
    })
    if (res.data.code === 200) {
      // 刷新用户信息
      getUserInfo()
    }
  } catch (err) {
    console.error('加信用分失败', err)
    alert('加分失败，请稍后重试')
  }
}

// 关闭结果弹窗
const closeGameResult = () => {
  showGameResult.value = false
}
// 获取排行榜
const getRankList = async () => {
  loadingRank.value = true
  try {
    const res = await axios.get('http://localhost:8080/user/credit/rank', {
      withCredentials: true
    })
    console.log('排行榜返回数据：', res.data)  // 调试用
    if (res.data.code === 200) {
      rankList.value = res.data.data || []
    } else {
      console.error('获取失败', res.data.msg)
    }
  } catch (err) {
    console.error('获取排行榜失败', err)
  } finally {
    loadingRank.value = false
  }
}

// 打开排行榜
const openRank = () => {
  getRankList()
  showRank.value = true
}
// 加载评价列表
const loadEvaluations = async () => {
  loading.value = true
  try {
    const url = currentTab.value === 'received' 
      ? 'http://localhost:8080/evaluation/received'
      : 'http://localhost:8080/evaluation/given'
    const res = await axios.get(url, {
      withCredentials: true
    })
    evaluationList.value = res.data.data || []
  } catch (err) {
    console.error('加载评价失败', err)
  } finally {
    loading.value = false
  }
}

// 获取头像（根据评价类型）
const getAvatar = (item) => {
  if (currentTab.value === 'received') {
    return item.fromUser?.avatar || 'default.jpg'
  } else {
    return item.toUser?.avatar || 'default.jpg'
  }
}

// 获取用户名
const getUsername = (item) => {
  if (currentTab.value === 'received') {
    return item.fromUser?.username || '匿名用户'
  } else {
    return item.toUser?.username || '匿名用户'
  }
}

// 格式化时间
const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  return `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2,'0')}-${date.getDate().toString().padStart(2,'0')}`
}

onMounted(() => {
  getUserInfo()
  loadEvaluations()
})
</script>

<style scoped>
.credit-center {
  min-height: 100vh;
  background: linear-gradient(145deg, #e8f4ff 0%, #d4e8ff 100%);
  padding: 20px;
  padding-top: 0;
  margin-top: 0;
}

.header {
  display: flex;
  align-items: center;
  gap: 20px;
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

h2 {
  margin: 0;
  color: #1f2937;
  font-size: 22px;
}

/* 信用卡片 */
.credit-card {
  background: white;
  border-radius: 28px;
  padding: 32px 24px;
  display: flex;
  justify-content: space-around;
  text-align: center;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(37, 99, 235, 0.1);
}

.score-label, .level-label {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 10px;
  letter-spacing: 1px;
}

.score-value {
  font-size: 56px;
  font-weight: bold;
  background: linear-gradient(135deg, #2563eb, #1e40af);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.level-value {
  font-size: 24px;
  font-weight: bold;
  padding: 8px 24px;
  border-radius: 50px;
  display: inline-block;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.level-excellent { background: linear-gradient(135deg, #fbbf24, #f59e0b); color: #1f2937; }
.level-good { background: linear-gradient(135deg, #10b981, #059669); color: white; }
.level-fine { background: linear-gradient(135deg, #2563eb, #1e40af); color: white; }
.level-normal { background: linear-gradient(135deg, #f97316, #ea580c); color: white; }
.level-bad { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; }

/* 等级说明 */
.level-info {
  background: white;
  border-radius: 24px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(37, 99, 235, 0.08);
}

.info-title {
  font-weight: 600;
  margin-bottom: 16px;
  font-size: 15px;
  color: #1f2937;
}

.info-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.info-item {
  font-size: 13px;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 6px;
}

.badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 30px;
  font-size: 11px;
  font-weight: 600;
  color: white;
}
.info-item:nth-child(1) .badge { background: linear-gradient(135deg, #fbbf24, #f59e0b); color: #1f2937; }
.info-item:nth-child(2) .badge { background: #10b981; }
.info-item:nth-child(3) .badge { background: #2563eb; }
.info-item:nth-child(4) .badge { background: #f97316; }
.info-item:nth-child(5) .badge { background: #ef4444; }

/* Tab */
.tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  background: white;
  padding: 6px;
  border-radius: 60px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(37, 99, 235, 0.08);
}

.tab {
  flex: 1;
  text-align: center;
  padding: 10px;
  background: transparent;
  border-radius: 50px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #4b5563;
  transition: all 0.3s;
}

.tab.active {
  background: linear-gradient(135deg, #2563eb, #1e40af);
  color: white;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.2);
}

/* 评价列表 */
.evaluation-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.evaluation-card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(37, 99, 235, 0.08);
}

/* 修复评价列表中的星星显示 */
.evaluation-card .rating {
  display: flex;
  gap: 4px;
}

.evaluation-card .rating .star {
  font-size: 18px;
  color: #d1d5db;
  background: transparent !important;
  position: static !important;
  animation: none !important;
  box-shadow: none !important;
  width: auto !important;
  height: auto !important;
  display: inline-block !important;
  border-radius: 0 !important;
}

.evaluation-card .rating .star.active {
  color: #fbbf24 !important;
}

.evaluation-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e5e7eb;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.user-info {
  flex: 1;
}

.username {
  font-weight: 600;
  font-size: 15px;
  color: #1f2937;
}

.time {
  font-size: 11px;
  color: #9ca3af;
  margin-top: 4px;
}

.rating {
  display: flex;
  gap: 4px;
}

.card-content {
  padding-left: 62px;
}

.product-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: #f8fafc;
  border-radius: 14px;
  margin-bottom: 14px;
}

.product-img {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  object-fit: cover;
}

.product-name {
  font-size: 13px;
  font-weight: 500;
  color: #4b5563;
}

.comment {
  font-size: 14px;
  color: #4b5563;
  line-height: 1.5;
  margin-bottom: 12px;
}

.reply {
  padding: 12px 14px;
  background: #eff6ff;
  border-radius: 14px;
  font-size: 13px;
}

.reply-label {
  color: #2563eb;
  font-weight: 600;
  margin-right: 6px;
}

.reply-content {
  color: #6b7280;
}

.loading, .empty {
  text-align: center;
  padding: 60px;
  background: white;
  border-radius: 24px;
  color: #9ca3af;
  border: 1px solid rgba(37, 99, 235, 0.08);
}

.loading {
  animation: pulse 1.5s ease infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

/* 排行榜弹窗 */
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

.rank-dialog {
  background: white !important;
  border-radius: 24px !important;
  width: 350px !important;
  max-width: 90% !important;
  max-height: 80vh !important;
  overflow: hidden !important;
  display: flex !important;
  flex-direction: column !important;
  position: relative !important;
  z-index: 1000000 !important;
}

.rank-header {
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  padding: 18px 20px !important;
  background: linear-gradient(135deg, #2563eb, #1e40af) !important;
  color: white !important;
}

.rank-header h3 {
  margin: 0 !important;
  font-size: 18px !important;
}

.rank-header .close {
  font-size: 24px !important;
  cursor: pointer !important;
}

.rank-body {
  flex: 1 !important;
  overflow-y: auto !important;
  padding: 10px 0 !important;
}

.rank-list {
  display: flex !important;
  flex-direction: column !important;
}

.rank-item {
  display: flex !important;
  align-items: center !important;
  gap: 12px !important;
  padding: 10px 16px !important;
  border-bottom: 1px solid #e5e7eb !important;
}

.rank-item.top3 {
  background: #fef3c7 !important;
}

.rank-num {
  width: 45px !important;
  text-align: center !important;
  font-size: 20px !important;
}

.rank-number {
  font-size: 14px !important;
  font-weight: bold !important;
  color: #9ca3af !important;
}

.rank-avatar {
  width: 40px !important;
  height: 40px !important;
  border-radius: 50% !important;
  object-fit: cover !important;
}

.rank-name {
  flex: 1 !important;
  font-size: 14px !important;
  font-weight: 500 !important;
  color: #1f2937 !important;
}

.rank-score {
  font-size: 14px !important;
  font-weight: bold !important;
  color: #2563eb !important;
}

.rank-level {
  font-size: 10px !important;
  padding: 2px 8px !important;
  border-radius: 20px !important;
  color: white !important;
}

.rank-loading, .rank-empty {
  text-align: center !important;
  padding: 40px !important;
  color: #9ca3af !important;
}

/* 距离下一等级 */
.next-level-info {
  background: white;
  border-radius: 20px;
  padding: 12px 20px;
  margin-bottom: 16px;
  text-align: center;
  font-size: 14px;
  color: #2563eb;
  font-weight: 500;
  border: 1px solid rgba(37, 99, 235, 0.1);
}

.next-level-info.max-level {
  color: #10b981;
}

/* 操作按钮栏 */
.action-bar {
  margin-bottom: 16px;
  display: flex;
  gap: 12px;
}

.rank-btn {
  flex: 1;
  padding: 12px;
  background: linear-gradient(135deg, #2563eb, #1e40af);
  border: none;
  border-radius: 30px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.rank-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.4);
}

/* 游戏按钮 */
.game-btn {
  flex: 1;
  padding: 12px;
  background: linear-gradient(135deg, #f97316, #ea580c);
  border: none;
  border-radius: 30px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.game-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(249, 115, 22, 0.4);
}

/* 游戏弹窗 */
.game-dialog {
  background: white;
  border-radius: 24px;
  width: 400px;
  max-width: 90%;
  overflow: hidden;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 20px;
  background: linear-gradient(135deg, #f97316, #ea580c);
  color: white;
}

.game-header h3 {
  margin: 0;
  font-size: 18px;
}

.game-header .close {
  font-size: 24px;
  cursor: pointer;
}

.game-body {
  padding: 20px;
}

.game-progress {
  text-align: center;
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 20px;
}

.game-question {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 20px;
  text-align: center;
  line-height: 1.4;
}

.game-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.game-option {
  padding: 12px 16px;
  background: #f3f4f6;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  color: #4b5563;
}

.game-option:hover {
  background: #e5e7eb;
}

.game-option.selected {
  background: linear-gradient(135deg, #2563eb, #1e40af);
  color: white;
}

.game-option.correct {
  background: #10b981;
  color: white;
}

.game-option.wrong {
  background: #ef4444;
  color: white;
}

.game-buttons {
  display: flex;
  justify-content: center;
}

.next-btn {
  padding: 10px 30px;
  background: linear-gradient(135deg, #2563eb, #1e40af);
  border: none;
  border-radius: 30px;
  color: white;
  font-size: 14px;
  cursor: pointer;
}

.next-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 结果弹窗 */
.result-dialog {
  background: white;
  border-radius: 24px;
  width: 300px;
  text-align: center;
  overflow: hidden;
}

.result-header {
  padding: 20px;
}

.result-header.pass {
  background: linear-gradient(135deg, #10b981, #059669);
}

.result-header.fail {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.result-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 10px;
}

.result-header h3 {
  margin: 0;
  color: white;
}

.result-body {
  padding: 20px;
}

.result-body p {
  margin-bottom: 20px;
  font-size: 14px;
  color: #6b7280;
}

.close-result-btn {
  padding: 8px 24px;
  background: linear-gradient(135deg, #2563eb, #1e40af);
  border: none;
  border-radius: 30px;
  color: white;
  cursor: pointer;
}
</style>