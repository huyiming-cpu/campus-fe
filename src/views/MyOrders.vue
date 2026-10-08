<template>
  <div class="my-orders-page">
     
    <div class="page-container">
      <!-- 头部 -->
      <div class="header">
        <div class="back" @click="goBack">
          <span class="back-icon">←</span> 返回
        </div>
        <h2>📋 我的订单</h2>
        <div class="header-placeholder"></div>
      </div>

    <!-- 角色切换 -->
<div class="role-tabs">
  <div class="role-tab" :class="{ active: role === 'buy' }" @click="switchRole('buy')">
    🛍️ 我买到的
    <span v-if="buyPendingCount > 0" class="tab-badge">{{ buyPendingCount > 99 ? '99+' : buyPendingCount }}</span>
  </div>
  <div class="role-tab" :class="{ active: role === 'sell' }" @click="switchRole('sell')">
    📦 我卖出的
    <span v-if="sellPendingCount > 0" class="tab-badge">{{ sellPendingCount > 99 ? '99+' : sellPendingCount }}</span>
  </div>
</div>

      <!-- 状态筛选 -->
      <div class="status-tabs">
        <div class="status-tab" v-for="s in statusList" :key="s.value"
             :class="{ active: currentStatus === s.value }"
             @click="switchStatus(s.value)">
          {{ s.label }}
        </div>
      </div>

      <!-- 订单列表 -->
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="orderList.length === 0" class="empty">
        <div class="empty-icon">📭</div>
        <p>暂无订单</p>
      </div>
      <div v-else class="order-list">
        <div class="order-card" :class="{ 'need-action': isPendingAction(order) }" v-for="order in orderList" :key="order.id">
          <div class="order-header">
            <span class="order-no">订单号：{{ order.orderNo }}</span>
            <span class="order-status" :class="'status-' + order.orderStatus">{{ getStatusText(order.orderStatus) }}</span>
          </div>
          
          <div class="order-price-info" v-if="order.discountAmount > 0">
            <span class="original-price">原价 ¥{{ (order.price * order.quantity).toFixed(2) }}</span>
            <span class="discount-amount">-¥{{ order.discountAmount.toFixed(2) }}</span>
            <span class="actual-price">实付 ¥{{ order.totalAmount }}</span>
          </div>
          <div class="order-price-info" v-else>
            <span class="actual-price">实付 ¥{{ order.totalAmount }}</span>
          </div>

          <div class="order-content">
            <img :src="`${API_BASE}/products/${order.product?.image}`" class="order-img" />
            <div class="order-info">
              <div class="order-name">{{ order.product?.name }}</div>
              <div class="order-quantity">x{{ order.quantity }}</div>
            </div>
          </div>

          <!-- 自提点区域 -->
          <div class="pickup-section" v-if="order.tradeType === 'offline'">
            <div v-if="role === 'sell' && order.orderStatus === 'pending'" class="pickup-input-area">
              <div class="pickup-label">📍 设置自提点：</div>
              <div class="pickup-input-wrapper">
                <input type="text" v-model="pickupPoints[order.id]" :placeholder="order.pickupPoint || '请填写自提点地址'" class="pickup-input" />
                <button class="save-pickup-btn" @click="setPickupPoint(order.id)">保存</button>
              </div>
            </div>
            <div v-else-if="order.pickupPoint" class="pickup-display">
              <span class="pickup-label">📍 自提点：</span>
              <span class="pickup-address">{{ order.pickupPoint }}</span>
            </div>
            <div v-else-if="role === 'buy'" class="pickup-waiting">
              ⏳ 卖家正在准备自提点地址，请稍后...
            </div>
          </div>

          <!-- 底部按钮 -->
          <div class="order-footer">
            <div class="order-summary">
              共 {{ order.quantity }} 件商品
            </div>
            <div class="order-buttons">
                <button class="detail-btn" @click="showOrderDetail(order)">
    📋 查看详情
  </button>
              <button v-if="role === 'sell' && order.tradeType === 'offline' && order.orderStatus === 'pending'" 
                      class="pickup-btn" @click="setPickupPoint(order.id)">
                📍 设置自提点
              </button>
              <button v-if="role === 'sell' && order.orderStatus === 'paid'" 
                      class="ship-btn" @click="shipOrder(order.id)">
                🚚 发货
              </button>
              <button v-if="role === 'buy' && order.orderStatus === 'shipped'" 
                      class="confirm-btn" @click="confirmOrder(order.id)">
                ✅ 确认收货
              </button>
              <button v-if="role === 'buy' && order.orderStatus === 'pending' && order.tradeType === 'online'" 
                      class="pay-btn" @click="goPay(order.id)">
                💳 去支付
              </button>
            <!-- 退款按钮 -->
<button v-if="role === 'buy' && order.orderStatus !== 'pending' && order.orderStatus !== 'cancelled' && order.refundStatus === 'none'" 
        class="refund-btn" @click="applyRefund(order.id)">
  申请退款
</button>
<!-- 取消订单按钮（待付款时显示） -->
<button v-if="role === 'buy' && order.orderStatus === 'pending'" 
        class="cancel-btn" @click="cancelOrder(order.id)">
  取消订单
</button>
              <button v-if="role === 'sell' && order.refundStatus === 'pending'" 
                      class="approve-refund-btn" @click="handleRefund(order.id, 'approve')">
                ✅ 同意退款
              </button>
              <button v-if="role === 'sell' && order.refundStatus === 'pending'" 
                      class="reject-refund-btn" @click="handleRefund(order.id, 'reject')">
                ❌ 拒绝退款
              </button>
              <button v-if="order.orderStatus === 'completed'" 
                      :class="order.hasEvaluated ? 'evaluated-btn' : 'evaluate-btn'" 
                      @click="!order.hasEvaluated && showEvaluateDialog(order)">
                {{ order.hasEvaluated ? '✅ 已评价' : '⭐ 评价' }}
              </button>
            </div>
          </div>

          <!-- 退款状态标签 -->
          <!-- 退款状态标签 -->
<div class="refund-status" v-if="order.refundStatus !== 'none'">
  <span v-if="order.refundStatus === 'pending'" class="refund-pending">⏳ 退款申请中</span>
  <span v-if="order.refundStatus === 'approved'" class="refund-approved">✅ 已退款</span>
  <span v-if="order.refundStatus === 'rejected'" class="refund-rejected">❌ 退款被拒</span>
</div>
        </div>
      </div>
    </div>

   <!-- 评价弹窗 -->
<div v-if="showEvaluate" class="evaluate-dialog-overlay" @click="showEvaluate = false">
  <div class="evaluate-dialog-content" @click.stop>
    <h3>⭐ 评价商品</h3>
    <div class="evaluate-product">
      <img :src="`${API_BASE}/products/${currentOrder.product?.image}`" />
      <div class="product-name">{{ currentOrder.product?.name }}</div>
    </div>
    <div class="rating-section">
      <div class="rating-title">评分</div>
      <div class="stars">
        <span v-for="i in 5" :key="i" class="star" :class="{ active: rating >= i }" @click="rating = i">★</span>
      </div>
    </div>
    <div class="form-item">
      <textarea v-model="evaluateContent" placeholder="说说你对商品的感受..." rows="4"></textarea>
    </div>
    <div class="btns-row">
      <button @click="showEvaluate = false">取消</button>
      <button @click="submitEvaluate">提交评价</button>
    </div>
  </div>
</div>
  </div>
  <!-- 订单详情弹窗 -->
<!-- 订单详情弹窗 -->
<div v-if="showDetailDialog" class="dialog-overlay" @click="showDetailDialog = false">
  <div class="dialog-content dialog-large" @click.stop>
    <div class="dialog-header">
      <h3>📋 订单详情</h3>
      <span class="close" @click="showDetailDialog = false">×</span>
    </div>
    <div class="dialog-body">
      <!-- 订单基本信息 -->
      <div class="detail-section">
        <div class="section-title">订单信息</div>
        <div class="detail-row">
          <label>订单号：</label>
          <span>{{ detailOrder.orderNo }}</span>
        </div>
        <div class="detail-row">
          <label>订单状态：</label>
          <span :class="'status-badge status-' + detailOrder.orderStatus">{{ getStatusText(detailOrder.orderStatus) }}</span>
        </div>
        <div class="detail-row">
          <label>创建时间：</label>
          <span>{{ formatDateTime(detailOrder.createTime) }}</span>
        </div>
        <div class="detail-row" v-if="detailOrder.payTime">
          <label>支付时间：</label>
          <span>{{ formatDateTime(detailOrder.payTime) }}</span>
        </div>
        <div class="detail-row" v-if="detailOrder.shipTime">
          <label>发货时间：</label>
          <span>{{ formatDateTime(detailOrder.shipTime) }}</span>
        </div>
        <div class="detail-row" v-if="detailOrder.completeTime">
          <label>完成时间：</label>
          <span>{{ formatDateTime(detailOrder.completeTime) }}</span>
        </div>
      </div>

      <!-- 商品信息 -->
      <div class="detail-section">
        <div class="section-title">商品信息</div>
        <div class="product-detail">
          <img :src="`${API_BASE}/products/${detailOrder.product?.image}`" class="detail-img" />
          <div class="product-detail-info">
            <div class="detail-name">{{ detailOrder.product?.name }}</div>
            <div class="detail-price">单价：¥{{ detailOrder.price }}</div>
            <div class="detail-quantity">数量：x{{ detailOrder.quantity }}</div>
            <div class="detail-total">实付：¥{{ detailOrder.totalAmount }}</div>
            <div class="detail-discount" v-if="detailOrder.discountAmount > 0">优惠：-¥{{ detailOrder.discountAmount }}</div>
          </div>
        </div>
      </div>

     <!-- 交易双方信息 -->
<div class="detail-section">
  <div class="section-title">交易双方</div>
  <div class="detail-row">
    <label>买家：</label>
    <span>{{ detailOrder.buyerName || detailOrder.buyerId }}</span>
  </div>
  <div class="detail-row">
    <label>卖家：</label>
    <span>{{ detailOrder.sellerName || detailOrder.sellerId }}</span>
  </div>
  <div class="detail-row">
    <label>交易类型：</label>
    <span :class="detailOrder.tradeType === 'online' ? 'trade-online' : 'trade-offline'">
      {{ detailOrder.tradeType === 'online' ? '💳 线上交易' : '📍 线下自提' }}
    </span>
  </div>
</div>

<!-- ✅ 添加收货地址显示 -->
<div class="detail-section" v-if="detailOrder.tradeType === 'online' && detailOrder.address">
 <div class="section-title">📍 收货地址<span v-if="detailOrder.orderStatus === 'paid'" class="edit-address-btn" @click="openAddressSelector">✏️ 更换地址</span></div>
  <div class="detail-row">
    <label>收货人：</label>
    <span>{{ detailOrder.address.receiver }}</span>
  </div>
  <div class="detail-row">
    <label>联系电话：</label>
    <span>{{ detailOrder.address.phone }}</span>
  </div>
  <div class="detail-row">
    <label>详细地址：</label>
    <span>{{ detailOrder.address.province }} {{ detailOrder.address.city }} {{ detailOrder.address.district }} {{ detailOrder.address.detail }}</span>
  </div>
</div>

<div class="detail-row" v-if="detailOrder.pickupPoint">
  <label>自提点：</label>
  <span class="pickup-addr">{{ detailOrder.pickupPoint }}</span>
</div>


      <!-- 退款信息 -->
      <div class="detail-section" v-if="detailOrder.refundStatus && detailOrder.refundStatus !== 'none'">
        <div class="section-title">退款信息</div>
        <div class="detail-row">
          <label>退款状态：</label>
          <span v-if="detailOrder.refundStatus === 'pending'" class="refund-pending">⏳ 申请中</span>
          <span v-if="detailOrder.refundStatus === 'approved'" class="refund-approved">✅ 已退款</span>
          <span v-if="detailOrder.refundStatus === 'rejected'" class="refund-rejected">❌ 已拒绝</span>
        </div>
        <div class="detail-row" v-if="detailOrder.refundTime">
          <label>申请时间：</label>
          <span>{{ formatDateTime(detailOrder.refundTime) }}</span>
        </div>
        <div class="detail-row" v-if="detailOrder.refundAmount">
          <label>退款金额：</label>
          <span>¥{{ detailOrder.refundAmount }}</span>
        </div>
      </div>
    </div>
    <div class="dialog-footer">
      <button class="close-detail-btn" @click="showDetailDialog = false">关 闭</button>
    </div>
  </div>
</div>
<!-- 地址选择弹窗 -->
<div v-if="showAddressSelector" class="dialog-overlay" @click="showAddressSelector = false">
  <div class="dialog-content address-selector" @click.stop>
    <div class="dialog-header">
      <h3>选择收货地址</h3>
      <span class="close" @click="showAddressSelector = false">×</span>
    </div>
    <div class="dialog-body">
      <div class="address-list">
        <div v-for="addr in addressList" :key="addr.id" 
             class="address-item" 
             :class="{ active: selectedAddressId === addr.id }"
             @click="selectAddress(addr)">
          <div class="addr-name">{{ addr.receiver }} {{ addr.phone }}</div>
          <div class="addr-detail">{{ addr.province }} {{ addr.city }} {{ addr.district }} {{ addr.detail }}</div>
          <span v-if="addr.isDefault === 1" class="default-tag">默认</span>
        </div>
        <div v-if="addressList.length === 0" class="empty-address">
          暂无地址，请去<a @click="goToAddressManage">个人中心添加</a>
        </div>
      </div>
    </div>
    <div class="dialog-footer">
      <button class="cancel-btn" @click="showAddressSelector = false">取消</button>
      <button class="confirm-btn1" @click="confirmAddressChange" :disabled="!selectedAddressId">确认修改</button>
    </div>
  </div>
</div>
</template>

<script setup>
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080'
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()

const role = ref('buy')
const currentStatus = ref('')
const orderList = ref([])
const loading = ref(false)
const pickupPoints = ref({})

const statusList = [
  { label: '全部', value: '' },
  { label: '待处理', value: 'needAction' },  // 新增
  { label: '待付款', value: 'pending' },
  { label: '待发货', value: 'paid' },
  { label: '待收货', value: 'shipped' },
  { label: '已完成', value: 'completed' },
  { label: '退款订单', value: 'refund' }
]
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

const getStatusText = (status) => {
  const map = {
    'pending': '待付款',
    'paid': '待发货',
    'shipped': '待收货',
    'completed': '已完成',
    'cancelled': '已取消'
  }
  return map[status] || status
}
// 地址修改相关
const showAddressSelector = ref(false)
const addressList = ref([])
const selectedAddressId = ref(null)
const selectedNewAddress = ref(null)

// 获取用户地址列表
const loadUserAddresses = async () => {
  try {
    const res = await axios.get(`\${API_BASE}/address/list`, {
      withCredentials: true
    })
    addressList.value = res.data.data || []
  } catch (err) {
    console.error('获取地址列表失败', err)
  }
}

// 打开地址选择器
const openAddressSelector = () => {
  loadUserAddresses()
  selectedAddressId.value = detailOrder.value.address?.id || null
  showAddressSelector.value = true
}

// 选择地址
const selectAddress = (addr) => {
  selectedAddressId.value = addr.id
  selectedNewAddress.value = addr
}

// 确认修改地址
const confirmAddressChange = async () => {
  if (!selectedAddressId.value) {
    alert('请选择地址')
    return
  }
  
  try {
    const res = await axios.post(`\${API_BASE}/order/updateAddress`, null, {
      params: {
        orderId: detailOrder.value.id,
        addressId: selectedAddressId.value
      },
      withCredentials: true
    })
    
    if (res.data.code === 200) {
      alert('地址修改成功')
      detailOrder.value.address = selectedNewAddress.value
      detailOrder.value.addressId = selectedAddressId.value
      showAddressSelector.value = false
      loadOrders()
    } else {
      alert(res.data.msg || '修改失败')
    }
  } catch (err) {
    alert(err.response?.data?.msg || '修改失败')
  }
}

// 跳转到地址管理
const goToAddressManage = () => {
  showAddressSelector.value = false
  router.push('/address/list')
}
const buyPendingCount = ref(0)  // 买家待处理数量
const sellPendingCount = ref(0) // 卖家待处理数量

// 计算各角色的待处理数量
const calculatePendingCounts = async () => {
  try {
    // 获取卖家订单
    const sellRes = await axios.get(`\${API_BASE}/order/mySell`, {
      params: { status: '' },
      withCredentials: true
    })
    const sellOrders = sellRes.data.data || []
    let sellCount = 0
    for (let order of sellOrders) {
      if ((order.tradeType === 'offline' && order.orderStatus === 'pending') ||
          order.orderStatus === 'paid' ||
          order.refundStatus === 'pending') {
        sellCount++
      }
    }
    sellPendingCount.value = sellCount
    
    // 获取买家订单
    const buyRes = await axios.get(`\${API_BASE}/order/myBuy`, {
      params: { status: '' },
      withCredentials: true
    })
    const buyOrders = buyRes.data.data || []
    let buyCount = 0
    for (let order of buyOrders) {
      if (order.orderStatus === 'shipped' || order.refundStatus === 'rejected') {
        buyCount++
      }
    }
    buyPendingCount.value = buyCount
  } catch (err) {
    console.error('计算待处理数量失败', err)
  }
}

// 在switchRole时也刷新数量
const switchRole = (newRole) => {
  role.value = newRole
  loadOrders()
  calculatePendingCounts()  // 刷新数量
}

const switchStatus = (status) => {
  currentStatus.value = status
  loadOrders()
}
const goBack = () => {
  router.push('/myCenter')
}
// 加载订单时获取每个订单的评价状态
// 加载订单
const loadOrders = async () => {
  loading.value = true
  try {
    const url = role.value === 'buy' ? '/order/myBuy' : '/order/mySell'
    const res = await axios.get(`${API_BASE}${url}`, {
      params: { status: (currentStatus.value === 'refund' || currentStatus.value === 'needAction') ? undefined : currentStatus.value || undefined },
      withCredentials: true
    })
    let orders = res.data.data || []
    
    // 检查评价状态
    for (let order of orders) {
      if (order.orderStatus === 'completed') {
        try {
          const statusRes = await axios.get(`${API_BASE}/evaluation/order/status`, {
            params: { orderId: order.id },
            withCredentials: true
          })
          order.hasEvaluated = statusRes.data.data?.hasEvaluated || false
        } catch (e) {
          order.hasEvaluated = false
        }
      } else {
        order.hasEvaluated = false
      }
    }
    
    // 退款订单筛选
    if (currentStatus.value === 'refund') {
      orders = orders.filter(order => 
        order.refundStatus !== 'none' || order.orderStatus === 'refunded'
      )
    }
    
    // 待处理筛选
    if (currentStatus.value === 'needAction') {
      orders = orders.filter(order => isPendingAction(order))
    }
    
    orderList.value = orders
  } catch (err) {
    console.error('加载订单失败', err)
  } finally {
    loading.value = false
  }
}
// 判断订单是否需要高亮（需要用户处理）
const isPendingAction = (order) => {
  if (role.value === 'sell') {
    // 卖家需要处理的情况
    return (
      (order.tradeType === 'offline' && order.orderStatus === 'pending') || // 待设置自提点
      order.orderStatus === 'paid' ||  // 待发货
      order.refundStatus === 'pending'  // 待处理退款
    )
  } else {
    // 买家需要处理的情况
    return (
      order.orderStatus === 'shipped' ||  // 待收货
      order.refundStatus === 'rejected'   // 退款被拒
    )
  }
}

// 获取角色待处理数量（用于tab红点）
const getRolePendingCount = (targetRole) => {
  // 这个函数需要从父组件传入或重新获取数据
  // 简化处理：直接返回0，或者通过props传递
  return 0
}
// 订单详情弹窗
const showDetailDialog = ref(false)
const detailOrder = ref({})

// 显示订单详情
const showOrderDetail = (order) => {
  detailOrder.value = order
  showDetailDialog.value = true
}

// 格式化日期时间
const formatDateTime = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')} ${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}:${String(date.getSeconds()).padStart(2,'0')}`
}
const goPay = (orderId) => {
  router.push(`/pay-order?orderId=${orderId}`)
}

const shipOrder = async (orderId) => {
  if (!confirm('确认发货吗？')) return
  try {
    await axios.post(`\${API_BASE}/order/ship`, null, {
      params: { orderId },
      withCredentials: true
    })
    alert('发货成功')
    loadOrders()
  } catch (err) {
    alert('发货失败')
  }
}

const confirmOrder = async (orderId) => {
  if (!confirm('确认收货了吗？确认后将从钱包扣款')) return
  try {
    await axios.post(`\${API_BASE}/order/confirm`, null, {
      params: { orderId },
      withCredentials: true
    })
    alert('确认收货成功')
    loadOrders()
  } catch (err) {
    alert(err.response?.data?.msg || '确认失败')
  }
}

const setPickupPoint = async (orderId) => {
  const pickupPoint = pickupPoints.value[orderId]
  if (!pickupPoint) {
    alert('请填写自提点地址')
    return
  }
  
  try {
    await axios.post(`\${API_BASE}/order/setPickupPoint`, null, {
      params: { orderId, pickupPoint },
      withCredentials: true
    })
    alert('自提点设置成功')
    pickupPoints.value[orderId] = ''
    loadOrders()
  } catch (err) {
    alert('设置失败')
  }
}
// 申请退款
const applyRefund = async (orderId) => {
  if (!confirm('确定要申请退款吗？')) return
  try {
    const res = await axios.post(`\${API_BASE}/order/refund/apply`, null, {
      params: { orderId },
      withCredentials: true
    })
    alert(res.data.msg)
    loadOrders()
  } catch (err) {
    alert(err.response?.data?.msg || '申请失败')
  }
}
// 取消订单
const cancelOrder = async (orderId) => {
  if (!confirm('确定取消该订单吗？')) return
  try {
    const res = await axios.post(`\${API_BASE}/order/cancel`, null, {
      params: { orderId },
      withCredentials: true
    })
    alert(res.data.msg || '取消成功')
    loadOrders()
  } catch (err) {
    alert(err.response?.data?.msg || '取消失败')
  }
}
// 处理退款（同意/拒绝）
const handleRefund = async (orderId, action) => {
  const msg = action === 'approve' ? '同意退款' : '拒绝退款'
  if (!confirm(`确定${msg}吗？`)) return
  try {
    const url = action === 'approve' ? '/order/refund/approve' : '/order/refund/reject'
    const res = await axios.post(`${API_BASE}${url}`, null, {
      params: { orderId },
      withCredentials: true
    })
    alert(res.data.msg)
    loadOrders()
  } catch (err) {
    alert(err.response?.data?.msg || '操作失败')
  }
}

const showEvaluate = ref(false)
const currentOrder = ref({})
const rating = ref(5)
const evaluateContent = ref('')

// 显示评价弹窗
// 显示评价弹窗
const showEvaluateDialog = (order) => {
  currentOrder.value = order  // 保存当前要评价的订单
  rating.value = 5
  evaluateContent.value = ''
  showEvaluate.value = true
}

// 提交评价
const submitEvaluate = async () => {
  try {
    const res = await axios.post(`\${API_BASE}/evaluation/create`, {
      orderId: currentOrder.value.id,  // 使用当前订单的ID
      rating: rating.value,
      content: evaluateContent.value
    }, {
      withCredentials: true
    })
    
    if (res.data.code === 200) {
      
      showEvaluate.value = false
      loadOrders()  // 刷新订单列表，会显示"已评价"
    } else {
      alert(res.data.msg || '评价失败')
    }
  } catch (err) {
    console.error('评价失败', err)
    alert('评价失败')
  }
}

onMounted(() => {
  loadOrders()
   calculatePendingCounts()
})
</script>

<style scoped>
.my-orders-page {
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

/* 订单详情弹窗样式 */
.dialog-large {
  width: 650px;
  max-width: 90%;
  max-height: 85vh;
  overflow-y: auto;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 24px;
  background: linear-gradient(135deg, #2563eb, #1e40af);
  color: white;
  border-radius: 24px 24px 0 0;
}

.dialog-header h3 {
  margin: 0;
  font-size: 18px;
}

.dialog-header .close {
  font-size: 28px;
  cursor: pointer;
  transition: transform 0.2s;
  line-height: 1;
}

.dialog-header .close:hover {
  transform: rotate(90deg);
}

.dialog-body {
  padding: 24px;
  max-height: calc(85vh - 120px);
  overflow-y: auto;
}

.detail-section {
  margin-bottom: 24px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 16px;
}

.detail-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 16px;
  padding-left: 12px;
  border-left: 4px solid #2563eb;
}

.detail-row {
  display: flex;
  padding: 8px 0;
  align-items: center;
  flex-wrap: wrap;
}

.detail-row label {
  width: 100px;
  font-weight: 600;
  color: #6b7280;
  font-size: 13px;
}

.detail-row span {
  color: #4b5563;
  font-size: 13px;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.product-detail {
  display: flex;
  gap: 20px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 16px;
}

.detail-img {
  width: 100px;
  height: 100px;
  border-radius: 12px;
  object-fit: cover;
}

.product-detail-info {
  flex: 1;
}

.detail-name {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8px;
}

.detail-price, .detail-quantity, .detail-total, .detail-discount {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 4px;
}

.detail-total {
  color: #2563eb;
  font-weight: 600;
  font-size: 14px;
}

.detail-discount {
  color: #f97316;
}

.trade-online {
  color: #2563eb;
}

.trade-offline {
  color: #10b981;
}

.pickup-addr {
  background: #f0f0f0;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
}

.dialog-footer {
  padding: 16px 24px;
  border-top: 1px solid #f0f0f0;
  text-align: center;
}

.close-detail-btn {
  padding: 10px 32px;
  background: linear-gradient(135deg, #2563eb, #1e40af);
  color: white;
  border: none;
  border-radius: 40px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.close-detail-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
}

/* 详情按钮样式 */
.detail-btn {
  background: linear-gradient(135deg, #2563eb, #1e40af);
  color: white;
  padding: 6px 16px;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.3s;
}

.detail-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
}

/* 头部 */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  color: #1f2937;
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

.header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
}

.header-placeholder {
  width: 70px;
}

/* 角色切换 */
.role-tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.role-tab {
  flex: 1;
  text-align: center;
  padding: 10px 0;
  background: rgba(37, 99, 235, 0.1);
  border-radius: 40px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #2563eb;
  transition: all 0.3s;
}

.role-tab.active {
  background: #2563eb;
  color: white;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
}

/* 状态筛选 */
.status-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.status-tab {
  padding: 6px 16px;
  background: rgba(37, 99, 235, 0.1);
  border-radius: 30px;
  cursor: pointer;
  font-size: 13px;
  color: #2563eb;
  transition: all 0.3s;
}

.status-tab.active {
  background: #2563eb;
  color: white;
}

/* 订单卡片 */
.order-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(37, 99, 235, 0.08);
}

.order-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.1);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  background: #f8f9fa;
  border-bottom: 1px solid #f0f0f0;
}

.order-no {
  font-size: 12px;
  color: #6b7280;
}

.order-status {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 20px;
}

.status-pending { background: #fef3c7; color: #d97706; }
.status-paid { background: #dbeafe; color: #2563eb; }
.status-shipped { background: #d1fae5; color: #059669; }
.status-completed { background: #d1fae5; color: #059669; }

.order-price-info {
  padding: 10px 18px;
  background: #fffbeb;
  display: flex;
  gap: 12px;
  font-size: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.order-price-info .original-price {
  text-decoration: line-through;
  color: #9ca3af;
}

.order-price-info .discount-amount {
  color: #f97316;
}

.order-price-info .actual-price {
  font-weight: bold;
  color: #2563eb;
}

.order-content {
  display: flex;
  gap: 15px;
  padding: 16px 18px;
}

.order-img {
  width: 70px;
  height: 70px;
  border-radius: 12px;
  object-fit: cover;
}

.order-info {
  flex: 1;
}

.order-name {
  font-weight: 600;
  margin-bottom: 6px;
  font-size: 15px;
  color: #1f2937;
}

.order-quantity {
  font-size: 13px;
  color: #9ca3af;
}

/* 自提点 */
.pickup-section {
  padding: 12px 18px;
  background: #f8f9fa;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
}

.pickup-input-wrapper {
  display: flex;
  gap: 10px;
  margin-top: 8px;
}

.pickup-input {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-size: 13px;
}

.save-pickup-btn {
  padding: 8px 18px;
  background: linear-gradient(135deg, #2563eb, #1e40af);
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
}

.pickup-display {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.pickup-address {
  font-size: 13px;
  color: #1f2937;
  padding: 6px 12px;
  background: #f0f0f0;
  border-radius: 8px;
}

.pickup-waiting {
  font-size: 13px;
  color: #d97706;
  padding: 8px 12px;
  background: #fef3c7;
  border-radius: 10px;
  text-align: center;
}

/* 底部 */
.order-footer {
  padding: 14px 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  border-top: 1px solid #f0f0f0;
}

.order-summary {
  font-size: 13px;
  color: #6b7280;
}

.order-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.pay-btn, .ship-btn, .confirm-btn, .pickup-btn, .refund-btn, .approve-refund-btn, .reject-refund-btn, .evaluate-btn, .evaluated-btn {
  padding: 6px 16px;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.3s;
}

.pay-btn, .ship-btn, .confirm-btn, .pickup-btn {
  background: linear-gradient(135deg, #2563eb, #1e40af);
  color: white;
}

.pay-btn:hover, .ship-btn:hover, .confirm-btn:hover, .pickup-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
}

.refund-btn {
  background: #f97316;
  color: white;
}

.approve-refund-btn {
  background: #10b981;
  color: white;
}

.reject-refund-btn {
  background: #ef4444;
  color: white;
}

.evaluate-btn {
  background: linear-gradient(135deg, #2563eb, #1e40af);
  color: white;
}

.evaluated-btn {
  background: #e5e7eb;
  color: #9ca3af;
  cursor: default;
}

/* 退款状态 */
.refund-status {
  padding: 8px 18px 14px;
  text-align: right;
}

.refund-pending { color: #f97316; font-size: 12px; }
.refund-approved { color: #10b981; font-size: 12px; }
.refund-rejected { color: #ef4444; font-size: 12px; }

/* 加载和空状态 */
.loading, .empty {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 24px;
  color: #9ca3af;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

/* 评价弹窗样式 */
.my-orders-page .evaluate-dialog-overlay {
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

.my-orders-page .evaluate-dialog-content {
  background: white;
  border-radius: 24px;
  width: 500px;
  max-width: 90%;
  padding: 28px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.my-orders-page .evaluate-dialog-content h3 {
  margin: 0 0 20px 0;
  text-align: center;
  font-size: 20px;
  color: #1f2937;
}

.my-orders-page .evaluate-product {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 12px;
  margin-bottom: 20px;
}

.my-orders-page .evaluate-product img {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
}

.my-orders-page .product-name {
  font-size: 15px;
  font-weight: 500;
  color: #1f2937;
}

.my-orders-page .rating-section {
  margin-bottom: 20px;
  text-align: center;
}

.my-orders-page .rating-title {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 10px;
}

.my-orders-page .stars {
  display: flex !important;
  justify-content: center !important;
  gap: 12px !important;
  margin-bottom: 15px !important;
}

.my-orders-page .star {
  font-size: 40px !important;
  cursor: pointer !important;
  color: #d1d5db !important;
  transition: all 0.2s !important;
  background: transparent !important;
  position: relative !important;
  animation: none !important;
  box-shadow: none !important;
}

.my-orders-page .star:hover {
  transform: scale(1.1) !important;
}

.my-orders-page .star.active {
  color: #fbbf24 !important;
}

.my-orders-page .form-item {
  margin-bottom: 20px;
}

.my-orders-page .form-item textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  resize: vertical;
  font-size: 14px;
  font-family: inherit;
}

.my-orders-page .form-item textarea:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.my-orders-page .btns-row {
  display: flex;
  gap: 15px;
  margin-top: 20px;
}

.my-orders-page .btns-row button {
  flex: 1;
  padding: 12px;
  border-radius: 40px;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.my-orders-page .btns-row button:first-child {
  background: #f0f0f0;
  border: none;
  color: #666;
}

.my-orders-page .btns-row button:first-child:hover {
  background: #e0e0e0;
}

.my-orders-page .btns-row button:last-child {
  background: linear-gradient(135deg, #2563eb, #1e40af);
  color: white;
  border: none;
}

.my-orders-page .btns-row button:last-child:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
}

.cancel-btn {
  padding: 6px 20px;
  background: #9ca3af;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
}

.cancel-btn:hover {
  background: #10b981;
}

/* 订单详情弹窗独立背景层 */
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
  z-index: 99999 !important;
}

.dialog-overlay .dialog-content {
  background: white;
  border-radius: 24px;
  overflow: hidden;
}

/* 需要处理的订单卡片高亮样式 */
.order-card.need-action {
  border: 2px solid #f97316;
  box-shadow: 0 4px 15px rgba(249, 115, 22, 0.2);
  animation: pulse-glow 1.5s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% {
    border-color: #f97316;
    box-shadow: 0 4px 15px rgba(249, 115, 22, 0.2);
  }
  50% {
    border-color: #fb923c;
    box-shadow: 0 4px 20px rgba(249, 115, 22, 0.4);
  }
}

/* Tab上的红点样式 */
.tab-badge {
  display: inline-block;
  background: #ef4444;
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  margin-left: 6px;
  min-width: 16px;
  text-align: center;
  vertical-align: top;
  margin-top: 0px;
}

/* 地址编辑按钮 */
.edit-address-btn {
  font-size: 12px;
  color: #2563eb;
  cursor: pointer;
  background: none;
  border: none;
  padding: 0 8px;
  margin-left: 8px;
}

.edit-address-btn:hover {
  text-decoration: underline;
}

/* 地址选择弹窗 */
.address-selector {
  width: 400px;
  max-width: 90%;
}

.address-list {
  max-height: 400px;
  overflow-y: auto;
}

.address-item {
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.address-item.active {
  border-color: #2563eb;
  background: #eff6ff;
}

.addr-name {
  font-weight: bold;
  margin-bottom: 6px;
  color: #1f2937;
}

.addr-detail {
  font-size: 13px;
  color: #6b7280;
}

.default-tag {
  position: absolute;
  top: 12px;
  right: 12px;
  font-size: 10px;
  background: #e5e7eb;
  padding: 2px 8px;
  border-radius: 10px;
  color: #6b7280;
}

.empty-address {
  text-align: center;
  padding: 30px;
  color: #9ca3af;
}

.empty-address a {
  color: #2563eb;
  cursor: pointer;
}

.dialog-footer {
  display: flex;
  gap: 12px;
  padding: 12px 20px 20px;
  justify-content: flex-end;
  border-top: 1px solid #f0f0f0;
}

.cancel-btn, .confirm-btn1 {
  padding: 8px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}

.cancel-btn {
  background: #f5f5f5;
  border: none;
  color: #6b7280;
}

.confirm-btn1 {
  background: #2563eb;
  color: white;
  border: none;
}

.confirm-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>