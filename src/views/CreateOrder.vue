<template>
  <div class="create-order-page">
  
    <div class="header">
      <div class="back" @click="$router.back()">← 返回</div>
      <div class="title">确认订单</div>
    </div>

    <!-- 收货地址 -->
    <div class="address-section" @click="showAddressDialog = true">
      <div v-if="selectedAddress" class="address-card">
        <div class="address-name">{{ selectedAddress.receiver }} {{ selectedAddress.phone }}</div>
        <div class="address-detail">{{ selectedAddress.province }} {{ selectedAddress.city }} {{ selectedAddress.district }} {{ selectedAddress.detail }}</div>
      </div>
      <div v-else class="address-card empty">
        <span>请选择收货地址 ➜</span>
      </div>
    </div>

    <!-- 🔥 卖家分组显示商品 -->
    <div v-for="(group, idx) in checkoutGroups" :key="idx" class="seller-group">
      <div class="seller-title">🏪 卖家：{{ group.sellerName }}</div>
      <div class="product-card" v-for="product in group.products" :key="product.productId">
        <img :src="`${API_BASE}/products/${product.productImage}`" class="product-img" />
        <div class="product-info">
          <div class="product-name">{{ product.productName }}</div>
          <div class="product-price">¥{{ product.productPrice }}</div>
          <div class="product-quantity">
            <span>数量</span>
            <div class="quantity-control">
              <button @click="updateQuantity(product, product.quantity - 1)" :disabled="product.quantity <= 1">-</button>
              <span>{{ product.quantity || 1 }}</span>
              <button @click="updateQuantity(product, product.quantity + 1)">+</button>
            </div>
          </div>
        </div>
      </div>
      <div class="group-total">小计：¥{{ getGroupTotal(group) }}</div>
    </div>

    <!-- 交易方式 -->
    <div class="trade-type-section">
      <div class="section-title">交易方式</div>
      <div class="trade-options">
        <div class="trade-option" :class="{ active: tradeType === 'online' }" @click="selectTradeType('online')">
          <span>📦 线上交易</span>
          <span class="desc">快递配送</span>
        </div>
        <div class="trade-option" :class="{ active: tradeType === 'offline' }" @click="selectTradeType('offline')">
          <span>🏪 线下交易</span>
          <span class="desc">当面自提</span>
        </div>
      </div>
    </div>

    <!-- 支付方式 - 仅线上显示 -->
    <div class="pay-type-section" v-if="tradeType === 'online'">
      <div class="section-title">支付方式</div>
      <div class="pay-options">
        <div class="pay-option" :class="{ active: payType === 'wallet' }" @click="payType = 'wallet'">
          💰 钱包支付 (余额: ¥{{ walletBalance }})
        </div>
      </div>
    </div>

    <!-- 线下交易说明 -->
    <div v-if="tradeType === 'offline'" class="offline-tip">
      <div class="tip-title">🏪 线下交易说明</div>
      <div class="tip-content">
        <p>1. 提交订单后，卖家会提供自提点地址</p>
        <p>2. 请前往卖家指定的自提点当面交易</p>
        <p>3. 确认收货时将从钱包扣除金额</p>
      </div>
    </div>
<!-- 优惠券区域 -->
<div class="coupon-section" v-if="isGiftPack && availableCoupons.length > 0">
  <div class="section-title">🎫 优惠券</div>
  <div class="coupon-list">
    <div class="coupon-item" v-for="coupon in availableCoupons" :key="coupon.id" 
         :class="{ active: selectedCouponId === coupon.id }"
         @click="selectCoupon(coupon)">
      <div class="coupon-info">
        <div class="coupon-name">{{ coupon.name }}</div>
       
      </div>
      <div class="coupon-check">
        <span v-if="selectedCouponId === coupon.id">✓ 已选</span>
        <span v-else>使用</span>
      </div>
    </div>
  </div>
</div>
<!-- 价格汇总 -->
<div class="price-summary">
  <div class="price-row">
    <span>商品总价</span>
    <span>¥{{ totalAmount.toFixed(2) }}</span>
  </div>
  <div class="price-row" v-if="selectedCoupon">
    <span>优惠券</span>
    <span class="discount">-¥{{ (totalAmount - finalAmount).toFixed(2) }}</span>
  </div>
  <div class="price-row total">
    <span>实付金额</span>
    <span>¥{{ finalAmount.toFixed(2) }}</span>
  </div>
</div>

    <!-- 提交订单按钮 -->
    <div class="submit-btn" @click="submitOrders">提交订单</div>

    <!-- 地址选择弹窗 -->
    <div v-if="showAddressDialog" class="dialog-overlay" @click="showAddressDialog = false">
      <div class="dialog-content" @click.stop>
        <h3>选择收货地址</h3>
        <div class="address-list">
          <div v-for="addr in addressList" :key="addr.id" class="address-item" :class="{ active: selectedAddress?.id === addr.id }" @click="selectAddress(addr)">
            <div class="addr-name">{{ addr.receiver }} {{ addr.phone }}</div>
            <div class="addr-detail">{{ addr.province }} {{ addr.city }} {{ addr.district }} {{ addr.detail }}</div>
          </div>
          <div v-if="addressList.length === 0" class="empty-address">暂无地址，请先去个人中心添加</div>
        </div>
        <button class="close-btn" @click="showAddressDialog = false">关闭</button>
      </div>
    </div>
  </div>
</template>
<script setup>
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080'
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const isGiftPack = ref(false)
// 模式判断
const isMultiMode = ref(false)
const checkoutGroups = ref([])

// 单品模式数据
const productInfo = ref({
  id: null,
  name: '',
  price: 0,
  image: '',
  sellerId: null,
  sellerName: ''
})
const quantity = ref(1)

// 通用数据
const tradeType = ref('online')
const payType = ref('wallet')
const selectedAddress = ref(null)
const addressList = ref([])
const walletBalance = ref(0)
const showAddressDialog = ref(false)
const isSubmitting = ref(false)
// 优惠券相关
const availableCoupons = ref([])
const selectedCouponId = ref(null)
const selectedCoupon = ref(null)

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

// 计算每个商品的实际价格（用于显示）
const getDiscountedPrice = (product) => {
  if (!selectedCoupon.value) return product.productPrice
  
  if (selectedCoupon.value.type === 'discount') {
    return (product.productPrice * selectedCoupon.value.value).toFixed(2)
  } else if (selectedCoupon.value.type === 'cash') {
    // 满减券先返回原价，后端会处理到最贵商品
    return product.productPrice.toFixed(2)
  }
  return product.productPrice.toFixed(2)
}

// 获取可用优惠券
const loadCoupons = async () => {
  try {
    const res = await axios.get(`\${API_BASE}/coupon/my`, {
      withCredentials: true
    })
    // 只显示未使用的且满足满减条件的
    availableCoupons.value = (res.data.data || []).filter(c => {
      if (c.coupon.minAmount > 0 && totalAmount.value < c.coupon.minAmount) {
        return false
      }
      return true
    }).map(c => ({
      id: c.coupon.id,
      name: c.coupon.name,
      type: c.coupon.type,
      value: c.coupon.value,
      minAmount: c.coupon.minAmount,
      userCouponId: c.id
    }))
  } catch (err) {
    console.error('获取优惠券失败', err)
  }
}

// 选择优惠券
const selectCoupon = (coupon) => {
  if (selectedCouponId.value === coupon.id) {
    selectedCouponId.value = null
    selectedCoupon.value = null
  } else {
    selectedCouponId.value = coupon.id
    selectedCoupon.value = coupon
  }
}
// 计算总金额
const totalAmount = computed(() => {
  if (isMultiMode.value) {
    let total = 0
    for (const group of checkoutGroups.value) {
      for (const product of group.products) {
        total += product.productPrice * (product.quantity || 1)
      }
    }
    return total
  } else {
    return productInfo.value.price * quantity.value
  }
})

// 多商品：计算每组小计
const getGroupTotal = (group) => {
  let total = 0
  for (const product of group.products) {
    total += product.productPrice * (product.quantity || 1)
  }
  return total.toFixed(2)
}

// 多商品：更新数量
const updateQuantity = (product, newQuantity) => {
  if (newQuantity >= 1) {
    product.quantity = newQuantity
  }
}

// 获取地址列表
const loadAddress = async () => {
  try {
    const res = await axios.get(`\${API_BASE}/address/list`, {
      withCredentials: true
    })
    addressList.value = res.data.data || []
    const defaultAddr = addressList.value.find(a => a.isDefault === 1)
    if (defaultAddr) {
      selectedAddress.value = defaultAddr
    }
  } catch (err) {
    console.error('获取地址失败', err)
  }
}

// 获取钱包余额
const loadWallet = async () => {
  try {
    const res = await axios.get(`\${API_BASE}/order/wallet/balance`, {
      withCredentials: true
    })
    walletBalance.value = res.data.data || 0
  } catch (err) {
    console.error('获取余额失败', err)
  }
}

// 选择地址
const selectAddress = (addr) => {
  selectedAddress.value = addr
  showAddressDialog.value = false
}

const selectTradeType = (type) => {
  tradeType.value = type
  if (type === 'offline') {
    payType.value = 'offline'
  } else {
    payType.value = 'wallet'
  }
}
// 计算优惠后金额
// 计算优惠后金额（满减券从最贵商品扣）
const finalAmount = computed(() => {
  let amount = totalAmount.value
  if (!selectedCoupon.value) return amount
  
  if (selectedCoupon.value.type === 'discount') {
    // 折扣券：总价打折
    amount = amount * selectedCoupon.value.value
  } else if (selectedCoupon.value.type === 'cash') {
    // 满减券：直接从总价减（后端会处理到最贵商品）
    amount = amount - selectedCoupon.value.value
    if (amount < 0) amount = 0
  }
  return amount
})
// 提交订单（统一入口）
const submitOrders = async () => {
  if (isSubmitting.value) return
  if (tradeType.value === 'online' && !selectedAddress.value) {
    alert('请选择收货地址')
    return
  }

  isSubmitting.value = true

  if (isMultiMode.value) {
    // 多商品模式：为每个卖家的商品创建订单
   // 多商品模式
const createdOrders = []
let isCouponUsed = false
const totalOriginal = totalAmount.value
const totalDiscounted = finalAmount.value
const coupon = selectedCoupon.value

try {
  for (const group of checkoutGroups.value) {
    for (const product of group.products) {
      const productOriginal = product.productPrice * (product.quantity || 1)
      let productDiscounted = productOriginal
      let useCouponOnThis = false

      if (coupon) {
        if (coupon.type === 'discount') {
          // ✅ 打折券：每个商品都打折，不设标记
          productDiscounted = productOriginal * (totalDiscounted / totalOriginal)
          useCouponOnThis = true  // 传优惠券ID
        } else if (coupon.type === 'cash' && !isCouponUsed) {
          // ✅ 满减券：只减第一个商品
          productDiscounted = productOriginal - coupon.value
          if (productDiscounted < 0) productDiscounted = 0
          useCouponOnThis = true
          isCouponUsed = true
        }
      }

      const res = await axios.post(`\${API_BASE}/order/create`, {
        productId: product.productId,
        sellerId: group.sellerId,
        price: product.productPrice,
        quantity: product.quantity || 1,
        totalAmount: productDiscounted.toFixed(2),
        addressId: selectedAddress.value?.id,
        tradeType: tradeType.value,
        payType: tradeType.value === 'online' ? payType.value : 'offline',
        userCouponId: useCouponOnThis ? coupon.userCouponId : null
      }, { withCredentials: true })
          
          if (res.data.code === 200) {
            createdOrders.push(res.data.data)
          } else {
            throw new Error(res.data.msg)
          }
        }
      }

      if (tradeType.value === 'online' && payType.value === 'wallet') {
        for (const order of createdOrders) {
          await axios.post(`\${API_BASE}/order/pay`, null, {
            params: { orderId: order.id, payType: 'wallet' },
            withCredentials: true
          })
        }
        alert(`支付成功！共创建 ${createdOrders.length} 个订单`)
        router.push('/my-orders')
      } else {
        alert(`订单创建成功！共 ${createdOrders.length} 个订单，请等待卖家确认`)
        router.push('/my-orders')
      }
    } catch (err) {
      console.error('创建订单失败', err)
      alert('创建订单失败：' + err.message)
    } finally {
      isSubmitting.value = false
    }
  } else {
// 单品模式
if (tradeType.value === 'online' && !selectedAddress.value) {
  alert('请选择收货地址')
  isSubmitting.value = false
  return
}

try {
  const res = await axios.post(`\${API_BASE}/order/create`, {
    productId: parseInt(productInfo.value.id),
    sellerId: parseInt(productInfo.value.sellerId),
    price: productInfo.value.price,
    quantity: quantity.value,
    totalAmount: finalAmount.value.toFixed(2),  // 实付金额（优惠后）
    addressId: selectedAddress.value?.id,
    tradeType: tradeType.value,
    payType: tradeType.value === 'online' ? payType.value : 'offline',
    userCouponId: selectedCoupon.value?.userCouponId  
  }, { withCredentials: true })
  
  if (res.data.code === 200) {
    const order = res.data.data
    if (tradeType.value === 'online' && payType.value === 'wallet') {
      await payWithWallet(order.id)
    } else {
      alert('订单创建成功！请等待卖家确认')
      router.push('/my-orders')
    }
  } else {
    alert(res.data.msg || '创建订单失败')
    isSubmitting.value = false
  }
} catch (err) {
  console.error('创建订单失败', err)
  alert('创建订单失败')
  isSubmitting.value = false
}
  }
}


// 钱包支付（单品模式用）
const payWithWallet = async (orderId) => {
  try {
    const res = await axios.post(`\${API_BASE}/order/pay`, null, {
      params: { orderId, payType: 'wallet' },
      withCredentials: true
    })
    if (res.data.code === 200) {
      alert('支付成功！')
      router.push('/my-orders')
    } else {
      alert(res.data.msg || '支付失败')
    }
  } catch (err) {
    alert('支付失败：' + (err.response?.data?.msg || err.message))
  } finally {
    isSubmitting.value = false
  }
}


onMounted(() => {
  // 检查是否从购物车多商品模式过来
  const groupsStr = sessionStorage.getItem('checkoutGroups')
  if (groupsStr) {
    isMultiMode.value = true
    checkoutGroups.value = JSON.parse(groupsStr)
    for (const group of checkoutGroups.value) {
      for (const product of group.products) {
        product.quantity = 1
      }
    }
    sessionStorage.removeItem('checkoutGroups')
    loadCoupons()
  } 
  // 礼包模式
  else if (route.query.type === 'giftPack') {
    isGiftPack.value = true
    isMultiMode.value = true
    
    const products = JSON.parse(sessionStorage.getItem('giftPackProducts') || '[]')
    checkoutGroups.value = [{
      sellerId: route.query.sellerId,
      sellerName: '卖家',
      products: products.map(p => ({
        productId: p.productId,
        productName: p.productName,
        productPrice: p.productPrice,
        productImage: p.productImage,
        quantity: 1
      }))
    }]
    sessionStorage.removeItem('giftPackProducts')
    loadCoupons()
  }
  // 单品模式
  else {
    // ✅ 改为多商品模式，让商品显示出来
    isMultiMode.value = true
    isGiftPack.value = false
    
    // 把单品包装成 checkoutGroups 格式
    checkoutGroups.value = [{
      sellerId: parseInt(route.query.sellerId),
      sellerName: route.query.sellerName || '卖家',
      products: [{
        productId: parseInt(route.query.productId),
        productName: route.query.productName,
        productPrice: parseFloat(route.query.productPrice),
        productImage: route.query.productImage,
        quantity: 1
      }]
    }]
    
    // 保留单品信息供提交订单使用
    productInfo.value = {
      id: parseInt(route.query.productId),
      name: route.query.productName,
      price: parseFloat(route.query.productPrice),
      image: route.query.productImage,
      sellerId: parseInt(route.query.sellerId),
      sellerName: route.query.sellerName
    }
  }
  
  loadAddress()
  loadWallet()
  console.log('模式:', isMultiMode.value ? (isGiftPack.value ? '礼包' : '多商品') : '单品')
})
</script>

<style scoped>
.create-order-page {
  min-height: 100vh;
  background: linear-gradient(145deg, #e8f4ff 0%, #d4e8ff 100%);
  padding: 20px;
  padding-bottom: 100px;
}

.header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.title {
  cursor: pointer;
  color: #1f2937;
  font-size: 20px;
  font-weight: 600;
}

.back {
  cursor: pointer;
  color: #2563eb;
  font-size: 16px;
  padding: 8px 16px;
  background: rgba(37, 99, 235, 0.1);
  border-radius: 30px;
  transition: all 0.3s;
}

.back:hover {
  background: rgba(37, 99, 235, 0.2);
  transform: translateX(-2px);
}

h2 {
  margin: 0;
}

.address-section {
  margin-bottom: 15px;
}

.address-card {
  background: white;
  padding: 15px;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  cursor: pointer;
  border: 1px solid rgba(37, 99, 235, 0.1);
}

.address-card.empty {
  color: #9ca3af;
  text-align: center;
}

.address-name {
  font-weight: bold;
  margin-bottom: 5px;
  color: #1f2937;
}

.address-detail {
  font-size: 13px;
  color: #6b7280;
}

.product-section {
  margin-bottom: 15px;
}

.product-card {
  background: white;
  padding: 15px;
  border-radius: 16px;
  display: flex;
  gap: 15px;
  border: 1px solid rgba(37, 99, 235, 0.08);
}

.product-img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
}

.product-info {
  flex: 1;
}

.product-name {
  font-weight: bold;
  margin-bottom: 5px;
  color: #1f2937;
}

.product-price {
  color: #2563eb;
  font-size: 18px;
  font-weight: bold;
}

.product-quantity {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 10px;
}

.quantity-control button {
  width: 28px;
  height: 28px;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  color: #4b5563;
}

.quantity-control button:hover {
  background: #f3f4f6;
  border-color: #2563eb;
}

.trade-type-section, .pay-type-section {
  background: white;
  margin-bottom: 15px;
  padding: 15px;
  border-radius: 16px;
  border: 1px solid rgba(37, 99, 235, 0.08);
}

.section-title {
  font-weight: bold;
  margin-bottom: 12px;
  color: #1f2937;
}

.trade-options, .pay-options {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.trade-option, .pay-option {
  padding: 10px 15px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  flex: 1;
  text-align: center;
  min-width: 100px;
  transition: all 0.2s;
}

.trade-option.active, .pay-option.active {
  border-color: #2563eb;
  background: #eff6ff;
  color: #2563eb;
}

.trade-option .desc {
  font-size: 11px;
  color: #6b7280;
  display: block;
}

.price-summary {
  background: white;
  padding: 15px;
  border-radius: 16px;
  margin-bottom: 20px;
  border: 1px solid rgba(37, 99, 235, 0.08);
}

.price-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  color: #4b5563;
}

.price-row.total {
  font-weight: bold;
  font-size: 18px;
  color: #2563eb;
  border-top: 1px solid #e5e7eb;
  padding-top: 10px;
  margin-top: 10px;
}

.submit-btn {
  background: linear-gradient(135deg, #2563eb, #1e40af);
  color: white;
  text-align: center;
  padding: 15px;
  border-radius: 40px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  position: fixed;
  bottom: 20px;
  left: 20px;
  right: 20px;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
}

.submit-btn:active {
  transform: translateY(0);
}

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
  width: 90%;
  max-width: 400px;
  max-height: 80%;
  overflow: auto;
  padding: 20px;
}

.address-list {
  max-height: 400px;
  overflow-y: auto;
}

.address-item {
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.address-item.active {
  border-color: #2563eb;
  background: #eff6ff;
}

.addr-name {
  font-weight: bold;
  margin-bottom: 4px;
  color: #1f2937;
}

.addr-detail {
  font-size: 12px;
  color: #6b7280;
}

.empty-address {
  text-align: center;
  padding: 30px;
  color: #9ca3af;
}

.close-btn {
  width: 100%;
  padding: 10px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 12px;
  margin-top: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #1d4ed8;
}

/* 线下交易提示 */
.offline-tip {
  background: #fffbeb;
  border: 1px solid #fcd34d;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 15px;
}

.tip-title {
  font-weight: bold;
  color: #d97706;
  margin-bottom: 8px;
}

.tip-content p {
  font-size: 12px;
  color: #6b7280;
  margin: 5px 0;
}

.seller-group {
  background: white;
  border-radius: 16px;
  margin-bottom: 15px;
  padding: 15px;
  border: 1px solid rgba(37, 99, 235, 0.08);
}

.seller-title {
  font-weight: bold;
  font-size: 14px;
  color: #2563eb;
  padding-bottom: 10px;
  margin-bottom: 10px;
  border-bottom: 1px solid #e5e7eb;
}

.group-total {
  text-align: right;
  font-size: 14px;
  color: #2563eb;
  font-weight: bold;
  padding-top: 10px;
  margin-top: 10px;
  border-top: 1px solid #e5e7eb;
}

.coupon-section {
  background: white;
  margin-bottom: 15px;
  padding: 15px;
  border-radius: 16px;
  border: 1px solid rgba(37, 99, 235, 0.08);
}

.coupon-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.coupon-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.coupon-item.active {
  border-color: #2563eb;
  background: #eff6ff;
}

.coupon-name {
  font-weight: bold;
  font-size: 14px;
  color: #1f2937;
}

.coupon-desc {
  font-size: 12px;
  color: #2563eb;
  margin-top: 4px;
}

.coupon-check span {
  font-size: 13px;
  color: #2563eb;
}

.price-row .discount {
  color: #2563eb;
}
</style>