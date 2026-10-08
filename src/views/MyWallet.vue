<template>
  <div class="my-wallet-page">
  
    <div class="header">
      <div class="back" @click="$router.back()">← 返回</div>
      <h2>💰 我的钱包</h2>
    </div>

    <!-- 余额卡片 -->
    <div class="balance-card">
      <div class="balance-label">余额（元）</div>
      <div class="balance-amount">¥ {{ balance }}</div>
      <button class="recharge-btn" @click="showRecharge = true">充值</button>
    </div>
  <!-- 统计卡片 -->
    <div class="stats-cards">
      <div class="stat-item">
        <div class="stat-label">本月收入</div>
        <div class="stat-value income">+¥{{ monthlyIncome }}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">本月支出</div>
        <div class="stat-value expense">-¥{{ monthlyExpense }}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">本月净收入</div>
        <div class="stat-value" :class="monthlyNet >= 0 ? 'income' : 'expense'">
          {{ monthlyNet >= 0 ? '+' : '' }}¥{{ Math.abs(monthlyNet) }}
        </div>
      </div>
    </div>

    <!-- 类型统计 -->
    <div class="type-stats">
      <div class="section-title">📊 支出类型统计</div>
      <div class="type-list">
        <div class="type-item" v-for="item in typeStats" :key="item.type">
          <span class="type-name">{{ item.type }}</span>
          <div class="type-bar">
            <div class="bar-fill" :style="{ width: item.percent + '%', background: item.color }"></div>
          </div>
          <span class="type-amount">¥{{ item.amount }}</span>
        </div>
      </div>
    </div>
    <!-- 充值弹窗 -->
    <div v-if="showRecharge" class="dialog-overlay" @click="showRecharge = false">
      <div class="dialog-content" @click.stop>
        <h3>充值</h3>
        <div class="recharge-input">
          <input type="number" v-model="rechargeAmount" placeholder="输入充值金额" />
          <button @click="doRecharge">确认充值</button>
        </div>
      </div>
    </div>

    <!-- 流水记录 -->
  <div class="transaction-header">
  <span class="transaction-title">交易流水</span>
  <div class="month-filter">
    <input type="month" v-model="selectedMonth" @change="filterTransactions" />
    <button v-if="selectedMonth" class="clear-filter" @click="clearMonthFilter">清除</button>
  </div>
</div>
    
   <div v-if="loading" class="loading">加载中...</div>
<div v-else-if="filteredTransactions.length === 0" class="empty">暂无流水记录</div>
<div v-else class="transaction-list">
  <div class="transaction-item" v-for="item in filteredTransactions" :key="item.id">
        <div class="transaction-info">
          <div class="transaction-type">{{ item.type }}</div>
          <div class="transaction-remark">{{ item.remark }}</div>
          <div class="transaction-time">{{ formatTime(item.createTime) }}</div>
        </div>
  <div class="transaction-amount" :class="item.type === 'pay' || item.type === 'deduct' ? 'expense' : 'income'">
  {{ item.type === 'pay' || item.type === 'deduct' ? '-' : '+' }}{{ item.amount }}元
</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted,computed} from 'vue'
import axios from 'axios'

const balance = ref('0.00')
const allTransactions = ref([])  // 存储所有流水
const filteredTransactions = ref([])  // 筛选后的流水
const loading = ref(false)
const showRecharge = ref(false)
const rechargeAmount = ref('')
const selectedMonth = ref('')  // 选中的月份

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
// 获取当前月份（YYYY-MM格式）
const getCurrentMonth = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

// 筛选流水
const filterTransactions = () => {
  if (!selectedMonth.value) {
    filteredTransactions.value = [...allTransactions.value]
    return
  }
  
  filteredTransactions.value = allTransactions.value.filter(t => {
    if (!t.createTime) return false
    const date = new Date(t.createTime)
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    return month === selectedMonth.value
  })
}// 获取钱包余额
const getBalance = async () => {
  try {
    const res = await axios.get('http://localhost:8080/order/wallet/balance', {
      withCredentials: true
    })
    balance.value = res.data.data || '0.00'
  } catch (err) {
    console.error('获取余额失败', err)
  }
}
// 计算本月收支（基于筛选后的数据）
const monthlyIncome = computed(() => {
  let income = 0
  filteredTransactions.value.forEach(t => {
    if (t.type === 'income') income += t.amount
  })
  return income.toFixed(2)
})

const monthlyExpense = computed(() => {
  let expense = 0
  filteredTransactions.value.forEach(t => {
    if (t.type === 'pay' || t.type === 'deduct') expense += t.amount
  })
  return expense.toFixed(2)
})

const monthlyNet = computed(() => {
  return (monthlyIncome.value - monthlyExpense.value).toFixed(2)
})

// 类型统计（基于筛选后的数据）
const typeStats = computed(() => {
  const types = {
    '消费': { amount: 0, color: '#ff6b6b' },
    '充值': { amount: 0, color: '#51cf66' },
    '收款': { amount: 0, color: '#339af0' },
    '退款': { amount: 0, color: '#fcc419' },
    '退款扣款': { amount: 0, color: '#f783ac' }
  }
  
  filteredTransactions.value.forEach(t => {
    if (t.type === 'pay') {
      types['消费'].amount += t.amount
    } else if (t.payType === 'recharge') {
      types['充值'].amount += t.amount
    } else if (t.type === 'income') {
      types['收款'].amount += t.amount
    } else if (t.type === 'refund') {
      types['退款'].amount += t.amount
    } else if (t.type === 'deduct') {
      types['退款扣款'].amount += t.amount
    }
  })
  
  const total = Object.values(types).reduce((sum, t) => sum + t.amount, 0)
  
  return Object.entries(types)
    .filter(([_, data]) => data.amount > 0)
    .map(([type, data]) => ({
      type,
      amount: data.amount.toFixed(2),
      percent: total > 0 ? (data.amount / total * 100).toFixed(1) : 0,
      color: data.color
    }))
})

// 清除月份筛选
const clearMonthFilter = () => {
  selectedMonth.value = ''
  filteredTransactions.value = [...allTransactions.value]
}
// 获取交易流水
const getTransactions = async () => {
  loading.value = true
  try {
    const res = await axios.get('http://localhost:8080/order/wallet/transactions', {
      withCredentials: true
    })
    allTransactions.value = res.data.data || []
    // 默认选中当前月份
    selectedMonth.value = getCurrentMonth()
    filterTransactions()
  } catch (err) {
    console.error('获取流水失败', err)
  } finally {
    loading.value = false
  }
}

// 充值
const doRecharge = async () => {
  const amount = parseFloat(rechargeAmount.value)
  if (isNaN(amount) || amount <= 0) {
    alert('请输入正确的金额')
    return
  }
  
  try {
    await axios.post('http://localhost:8080/order/wallet/recharge', null, {
      params: { amount },
      withCredentials: true
    })
    alert('充值成功')
    showRecharge.value = false
    rechargeAmount.value = ''
    getBalance()
    getTransactions()
  } catch (err) {
    alert('充值失败')
  }
}

// 格式化时间
const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  return `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2,'0')}-${date.getDate().toString().padStart(2,'0')} ${date.getHours().toString().padStart(2,'0')}:${date.getMinutes().toString().padStart(2,'0')}`
}

onMounted(() => {
  getBalance()
  getTransactions()
})
</script>

<style scoped>
.my-wallet-page {
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
  font-weight: 600;
}

.header-placeholder {
  width: 70px;
}

/* 余额卡片 */
.balance-card {
  background: white;
  border-radius: 28px;
  padding: 30px;
  text-align: center;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(37, 99, 235, 0.1);
}

.balance-label {
  font-size: 14px;
  color: #6b7280;
  letter-spacing: 1px;
  margin-bottom: 8px;
}

.balance-amount {
  font-size: 52px;
  font-weight: bold;
  background: linear-gradient(135deg, #2563eb, #1e40af);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin: 10px 0;
}

.recharge-btn {
  background: linear-gradient(135deg, #2563eb, #1e40af);
  border: none;
  color: white;
  padding: 10px 32px;
  border-radius: 40px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s;
}

.recharge-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
}

/* 统计卡片 */
.stats-cards {
  display: flex;
  gap: 15px;
  margin-bottom: 24px;
}

.stat-item {
  flex: 1;
  background: white;
  border-radius: 20px;
  padding: 16px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(37, 99, 235, 0.08);
}

.stat-label {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 22px;
  font-weight: bold;
}

.stat-value.income {
  color: #10b981;
}

.stat-value.expense {
  color: #ef4444;
}

/* 类型统计 */
.type-stats {
  background: white;
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(37, 99, 235, 0.08);
}

.section-title {
  font-weight: 600;
  margin-bottom: 16px;
  font-size: 15px;
  color: #1f2937;
}

.type-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.type-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.type-name {
  width: 65px;
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}

.type-bar {
  flex: 1;
  height: 8px;
  background: #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 10px;
  transition: width 0.3s;
  background: linear-gradient(135deg, #2563eb, #1e40af);
}

.type-amount {
  width: 75px;
  text-align: right;
  font-size: 13px;
  font-weight: 500;
  color: #4b5563;
}

/* 流水头部 */
.transaction-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.transaction-title {
  font-weight: 600;
  color: #1f2937;
  font-size: 18px;
  letter-spacing: 1px;
}

.month-filter {
  display: flex;
  gap: 10px;
  align-items: center;
}

/* 月份选择器 */
.month-filter input {
  padding: 8px 16px;
  border-radius: 30px;
  border: 1px solid #e5e7eb;
  background: white;
  font-size: 13px;
  cursor: pointer;
  outline: none;
  color: #4b5563;
  font-weight: 400;
  transition: all 0.3s;
}

.month-filter input:hover {
  border-color: #2563eb;
}

.month-filter input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
}

/* 清除按钮 */
.clear-filter {
  padding: 8px 18px;
  border-radius: 30px;
  border: none;
  background: linear-gradient(135deg, #2563eb, #1e40af);
  color: white;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.3s;
}

.clear-filter:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
}

.clear-filter:active {
  transform: translateY(0);
}

/* 日历图标颜色 */
.month-filter input::-webkit-calendar-picker-indicator {
  filter: invert(0.4);
  cursor: pointer;
  opacity: 0.6;
}

.month-filter input::-webkit-calendar-picker-indicator:hover {
  opacity: 1;
}

/* 流水列表 */
.transaction-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.transaction-item {
  background: white;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(37, 99, 235, 0.08);
}

.transaction-item:hover {
  transform: translateX(5px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.1);
}

.transaction-info {
  flex: 1;
}

.transaction-type {
  font-weight: 600;
  margin-bottom: 4px;
  color: #1f2937;
}

.transaction-remark {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
}

.transaction-time {
  font-size: 11px;
  color: #9ca3af;
}

.transaction-amount {
  font-weight: bold;
  font-size: 18px;
}

.transaction-amount.expense {
  color: #ef4444;
}

.transaction-amount.income {
  color: #10b981;
}

/* 弹窗 */
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
  padding: 24px;
  width: 320px;
  text-align: center;
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

.dialog-content h3 {
  margin: 0 0 20px 0;
  font-size: 20px;
  color: #1f2937;
}

.recharge-input {
  display: flex;
  gap: 12px;
  margin-top: 15px;
}

.recharge-input input {
  flex: 1;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  font-size: 16px;
  outline: none;
}

.recharge-input input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
}

.recharge-input button {
  padding: 12px 24px;
  background: linear-gradient(135deg, #2563eb, #1e40af);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
  white-space: nowrap;
}

.recharge-input button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
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
</style>