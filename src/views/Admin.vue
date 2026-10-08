<template>
  <div class="admin-page">
   
    <div class="header">
      <div class="back" @click="$router.back()">← 返回</div>
      <h2>👑 管理后台</h2>
    </div>

    <!-- Tab 切换 -->
    <div class="tabs">
      <div class="tab" :class="{ active: currentTab === 'stats' }" @click="currentTab = 'stats'">
        📊 数据统计
      </div>
      <div class="tab" :class="{ active: currentTab === 'products' }" @click="currentTab = 'products'">
        📦 商品管理
      </div>
      <div class="tab" :class="{ active: currentTab === 'users' }" @click="currentTab = 'users'">
        👥 用户管理
      </div>
      <div class="tab" :class="{ active: currentTab === 'orders' }" @click="currentTab = 'orders'">
        📋 订单管理
      </div>
       <div class="tab" :class="{ active: currentTab === 'activity' }" @click="currentTab = 'activity'">
    🎉 活动管理
  </div>
    </div>

    <!-- 数据统计 -->
    <div v-if="currentTab === 'stats'" class="stats-panel">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-value">{{ stats.users }}</div>
          <div class="stat-label">注册用户</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📦</div>
          <div class="stat-value">{{ stats.products }}</div>
          <div class="stat-label">商品总数</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🔄</div>
          <div class="stat-value">{{ stats.selling }}</div>
          <div class="stat-label">在售商品</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">💰</div>
          <div class="stat-value">¥{{ stats.totalAmount }}</div>
          <div class="stat-label">交易总额</div>
        </div>
      </div>
    </div>

<!-- 商品管理 -->
<div v-if="currentTab === 'products'" class="products-panel">
  <div class="search-bar">
    <input v-model="searchKeyword" placeholder="搜索商品..." />
    <select v-model="filterType">
      <option value="">全部分类</option>
      <option value="学习用品">学习用品</option>
      <option value="生活用品">生活用品</option>
      <option value="数码产品">数码产品</option>
      <option value="服饰">服饰</option>
      <option value="运动器材">运动器材</option>
      <option value="小家电">小家电</option>
      <option value="交通出行">交通出行</option>
      <option value="其他">其他</option>
    </select>
    <!-- 新增：状态筛选 -->
    <select v-model="filterStatus">
      <option value="">全部状态</option>
      <option value="0">出售中</option>
      <option value="1">已售出</option>
      <option value="2">已下架</option>
      <option value="3">待审核</option>
    </select>
    <!-- 新增：待审核标签切换按钮 -->
    <button class="pending-btn" @click="loadPendingProducts">⏳ 待审核 ({{ pendingCount }})</button>
  </div>
  
  <div class="product-list">
    <div class="product-card" v-for="product in filteredProducts" :key="product.id" @click="goToProductDetail(product.id)">
      <img :src="`${API_BASE}/products/${product.image}`" class="product-img" />
      <div class="product-info">
        <div class="product-name">{{ product.name }}</div>
        <div class="product-price">¥{{ product.price }}</div>
        <div class="product-seller">卖家：{{ product.user?.username }}</div>
        <div class="product-status" :class="getStatusClass(product.status)">
          {{ getStatusText(product.status) }}
        </div>
      </div>
      <div class="product-actions" @click.stop>
        <!-- 热门开关 -->
  <button v-if="product.hot === 1" class="hot-btn active" @click="toggleHot(product, 0)">
    🔥 热门
  </button>
  <button v-else class="hot-btn" @click="toggleHot(product, 1)">
    ⭐ 设为热门
  </button>
        <!-- 编辑按钮 -->
        <button class="edit-product-btn" @click="openEditProduct(product)">✏️ 编辑</button>
        <!-- 待审核商品显示审核按钮 -->
        <template v-if="product.status === 3">
          <button class="approve-btn" @click="openAuditDialog(product, 'approve')">✅ 通过</button>
          <button class="reject-btn" @click="openAuditDialog(product, 'reject')">❌ 驳回</button>
        </template>
        <!-- 非待审核商品显示原有按钮 -->
        <template v-else>
          <button v-if="product.status === 0" class="off-btn" @click="offProduct(product.id)">下架</button>
          <button class="del-btn" @click="deleteProduct(product.id)">删除</button>
        </template>
      </div>
    </div>
  </div>
</div>

    <!-- 用户管理 -->
    <div v-if="currentTab === 'users'" class="users-panel">
      <div class="user-list">
        <table class="user-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>用户名</th>
              <th>学校</th>
              <th>信用分</th>
              <th>信用等级</th>
              <th>商品数</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in userList" :key="user.id">
              <td>{{ user.id }}</td>
              <td>{{ user.username }}</td>
              <td>{{ user.university || '未设置' }}</td>
              <td>{{ user.creditScore }}</td>
              <td>
                <span :class="'level-' + getLevelClass(user.creditLevel)">
                  {{ user.creditLevel }}
                </span>
              </td>
              <td>{{ user.productCount || 0 }}</td>
              <td>
                <button class="edit-btn" @click="editUser(user)">编辑</button>
                  <button class="delete-user-btn" @click="deleteUser(user.id, user.username)">删除</button>
                <button class="view-btn" @click="viewUserProducts(user.id)">查看商品</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <!-- 编辑商品弹窗 -->
<div v-if="showEditProduct" class="dialog-overlay" @click="showEditProduct = false">
  <div class="dialog-content" @click.stop>
    <div class="dialog-header">
      <h3>✏️ 编辑商品</h3>
      <span class="close" @click="showEditProduct = false">×</span>
    </div>
    <div class="dialog-body">
      <div class="form-item">
        <label>商品名称</label>
        <input v-model="editProductForm.name" />
      </div>
      <div class="form-item">
        <label>价格</label>
        <input type="number" step="0.01" v-model="editProductForm.price" />
      </div>
      <div class="form-item">
        <label>分类</label>
        <select v-model="editProductForm.type">
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
        <textarea v-model="editProductForm.info" rows="3"></textarea>
      </div>
    </div>
    <div class="dialog-footer">
      <button class="cancel-btn" @click="showEditProduct = false">取消</button>
      <button class="save-btn" @click="submitEditProduct">保存</button>
    </div>
  </div>
</div>
<!-- 审核弹窗 -->
<div v-if="showAuditDialog" class="dialog-overlay" @click="showAuditDialog = false">
  <div class="dialog-content" @click.stop>
    <div class="dialog-header">
      <h3>🔍 商品审核</h3>
      <span class="close" @click="showAuditDialog = false">×</span>
    </div>
    <div class="dialog-body">
      <div class="product-preview">
        <img :src="`${API_BASE}/products/${auditProduct.image}`" class="audit-img" />
        <div class="audit-info">
          <div><strong>商品名称：</strong>{{ auditProduct.name }}</div>
          <div><strong>价格：</strong>¥{{ auditProduct.price }}</div>
          <div><strong>分类：</strong>{{ auditProduct.type }}</div>
          <div><strong>卖家：</strong>{{ auditProduct.user?.username }}</div>
          <div><strong>描述：</strong>{{ auditProduct.info }}</div>
        </div>
      </div>
    </div>
    <div class="dialog-footer">
      <button class="cancel-btn" @click="showAuditDialog = false">取消</button>
      <button class="approve-btn" @click="submitAudit(1)">✅ 通过</button>
      <button class="reject-btn" @click="submitAudit(2)">❌ 驳回</button>
    </div>
  </div>
</div>

   <!-- 订单管理 -->
<div v-if="currentTab === 'orders'" class="orders-panel">
  <!-- 添加状态筛选 -->
  <div class="order-filters">
    <select v-model="orderFilterStatus">
      <option value="">全部订单</option>
      <option value="pending">待付款</option>
      <option value="paid">待发货</option>
      <option value="shipped">待收货</option>
      <option value="completed">已完成</option>
      <option value="refunded">已退款</option>
      <option value="cancelled">已取消</option>
    </select>
    <input v-model="orderSearchKeyword" placeholder="搜索订单号/商品名/用户名" />
  </div>

  <div class="order-list">
    <div class="order-card" v-for="order in filteredOrderList" :key="order.id">
      <div class="order-header">
        <div>
          <span class="order-no">订单号：{{ order.orderNo }}</span>
          <span class="order-time">创建时间：{{ formatDate(order.createTime) }}</span>
        </div>
        <span class="order-status" :class="'status-' + order.orderStatus">
          {{ getOrderStatus(order.orderStatus) }}
        </span>
      </div>
      
      <div class="order-content">
        <img :src="`${API_BASE}/products/${order.product?.image}`" class="order-img" />
        <div class="order-info">
          <div class="order-name">{{ order.product?.name }}</div>
          <div class="order-price">单价：¥{{ order.price }} × {{ order.quantity }}</div>
          <div class="order-total">实付：¥{{ order.totalAmount }}</div>
          <div class="order-user">买家：{{ order.buyerName || order.buyerId }}</div>
          <div class="order-user">卖家：{{ order.sellerName || order.sellerId }}</div>
        </div>
      </div>
       
      <!-- 退款信息 -->
      <div class="order-refund" v-if="order.refundStatus && order.refundStatus !== 'none'">
        <span v-if="order.refundStatus === 'pending'" class="refund-pending">⏳ 退款申请中</span>
        <span v-if="order.refundStatus === 'approved'" class="refund-approved">✅ 已退款 ¥{{ order.refundAmount }}</span>
        <span v-if="order.refundStatus === 'rejected'" class="refund-rejected">❌ 退款被拒</span>
      </div>

      <!-- 操作按钮 -->
      <div class="order-actions">
        <!-- 待付款订单：可以取消 -->
        <button v-if="order.orderStatus === 'pending'" class="cancel-order-btn" @click="adminCancelOrder(order.id)">
          取消订单
        </button>
        
        <!-- 待发货订单：可以提醒发货 -->
        <button v-if="order.orderStatus === 'paid'" class="remind-btn" @click="remindSeller(order)">
          提醒卖家发货
        </button>
        
        <!-- 退款申请处理 -->
        <button v-if="order.refundStatus === 'pending'" class="approve-refund-btn" @click="adminHandleRefund(order.id, 'approve')">
          ✅ 同意退款
        </button>
        <button v-if="order.refundStatus === 'pending'" class="reject-refund-btn" @click="adminHandleRefund(order.id, 'reject')">
          ❌ 拒绝退款
        </button>
        <!-- 管理员发货 -->
<button v-if="order.orderStatus === 'paid'" class="admin-ship-btn" @click="adminShipOrder(order.id)">
  🚚 强制发货
</button>

<!-- 管理员确认收货 -->
<button v-if="order.orderStatus === 'shipped'" class="admin-confirm-btn" @click="adminConfirmOrder(order.id)">
  ✅ 强制收货
</button>

<!-- 管理员删除订单 -->
<button class="admin-delete-btn" @click="adminDeleteOrder(order.id)">
  🗑️ 删除订单
</button>
        <!-- 查看详情 -->
        <button class="detail-btn" @click="viewOrderDetail(order)">
          📋 查看详情
        </button>
      </div>
    </div>
    <div v-if="filteredOrderList.length === 0" class="empty">暂无订单</div>
  </div>
</div>

<!-- 订单详情弹窗 -->
<div v-if="showOrderDetail" class="dialog-overlay" @click="showOrderDetail = false">
  <div class="dialog-content dialog-large" @click.stop>
    <div class="dialog-header">
      <h3>订单详情</h3>
      <span class="close" @click="showOrderDetail = false">×</span>
    </div>
    <div class="dialog-body">
      <div class="detail-row">
        <label>订单号：</label>
        <span>{{ currentOrder.orderNo }}</span>
      </div>
      <div class="detail-row">
        <label>商品名称：</label>
        <span>{{ currentOrder.product?.name }}</span>
      </div>
      <div class="detail-row">
        <label>商品图片：</label>
        <img :src="`${API_BASE}/products/${currentOrder.product?.image}`" style="width: 80px; height: 80px; object-fit: cover;" />
      </div>
      <div class="detail-row">
        <label>单价：</label>
        <span>¥{{ currentOrder.price }}</span>
      </div>
      <div class="detail-row">
        <label>数量：</label>
        <span>{{ currentOrder.quantity }}</span>
      </div>
      <div class="detail-row">
        <label>实付金额：</label>
        <span class="price">¥{{ currentOrder.totalAmount }}</span>
      </div>
      <div class="detail-row">
        <label>优惠金额：</label>
        <span class="discount">-¥{{ currentOrder.discountAmount || 0 }}</span>
      </div>
      <div class="detail-row">
        <label>买家：</label>
        <span>{{ currentOrder.buyerName || currentOrder.buyerId }}</span>
      </div>
      <div class="detail-row">
        <label>卖家：</label>
        <span>{{ currentOrder.sellerName || currentOrder.sellerId }}</span>
      </div>
      <div class="detail-row">
        <label>交易类型：</label>
        <span>{{ currentOrder.tradeType === 'online' ? '线上交易' : '线下自提' }}</span>
      </div>
      <!-- ✅ 在这里添加收货地址 -->
<div class="detail-section" v-if="currentOrder.tradeType === 'online' && currentOrder.address">
  <div class="section-title">📍 收货地址</div>
  <div class="detail-row">
    <label>收货人：</label>
    <span>{{ currentOrder.address.receiver }}</span>
  </div>
  <div class="detail-row">
    <label>电话：</label>
    <span>{{ currentOrder.address.phone }}</span>
  </div>
  <div class="detail-row">
    <label>地址：</label>
    <span>{{ currentOrder.address.province }} {{ currentOrder.address.city }} {{ currentOrder.address.district }} {{ currentOrder.address.detail }}</span>
  </div>
</div>
      <div class="detail-row" v-if="currentOrder.pickupPoint">
        <label>自提点：</label>
        <span>{{ currentOrder.pickupPoint }}</span>
      </div>
      <div class="detail-row">
        <label>创建时间：</label>
        <span>{{ formatDate(currentOrder.createTime) }}</span>
      </div>
      <div class="detail-row" v-if="currentOrder.payTime">
        <label>支付时间：</label>
        <span>{{ formatDate(currentOrder.payTime) }}</span>
      </div>
      <div class="detail-row" v-if="currentOrder.shipTime">
        <label>发货时间：</label>
        <span>{{ formatDate(currentOrder.shipTime) }}</span>
      </div>
      <div class="detail-row" v-if="currentOrder.completeTime">
        <label>完成时间：</label>
        <span>{{ formatDate(currentOrder.completeTime) }}</span>
      </div>
    </div>
  </div>
</div>
   <!-- 活动管理 -->
<div v-if="currentTab === 'activity'" class="activity-panel">
  <div class="activity-switch">
    <div class="activity-card" :class="{ active: currentActivity === 'graduation' }">
      <div class="activity-icon">🎓</div>
      <div class="activity-info">
        <h3>毕业季</h3>
        <p>主题：深蓝+金色 | 折扣：8.5折</p>
      </div>
      <button v-if="currentActivity === 'graduation'" class="close-btn" @click="closeActivity">关闭活动</button>
      <button v-else class="open-btn" @click="setActivity('graduation')">开启毕业季</button>
    </div>

    <div class="activity-card" :class="{ active: currentActivity === 'freshman' }">
      <div class="activity-icon">📚</div>
      <div class="activity-info">
        <h3>开学季</h3>
        <p>主题：绿色+白色 | 折扣：9折</p>
      </div>
      <button v-if="currentActivity === 'freshman'" class="close-btn" @click="closeActivity">关闭活动</button>
      <button v-else class="open-btn" @click="setActivity('freshman')">开启开学季</button>
    </div>
  </div>

  <!-- 当前活动状态 -->
  <div class="current-status">
    <span>当前活动：</span>
    <strong v-if="currentActivity === 'graduation'">🎓 毕业季进行中</strong>
    <strong v-else-if="currentActivity === 'freshman'">📚 开学季进行中</strong>
    <strong v-else>❌ 暂无活动</strong>
  </div>

<!-- 礼包管理 -->
<div class="giftpack-manage">
  <h3>📦 礼包管理（{{ allGiftPacks.length }}个）</h3>
  <div class="giftpack-list">
    <div class="giftpack-item" v-for="pack in allGiftPacks" :key="pack.id" @click="goToDetail(pack.id, pack.type)">
      <div class="giftpack-info">
        <span class="name">{{ pack.name }}</span>
        <span class="seller">卖家：{{ pack.seller?.username }}</span>
        <span class="type">{{ pack.type === 'graduation' ? '🎓毕业季' : '📚开学季' }}</span>
      </div>
      <button class="delete-pack-btn" @click.stop="deleteGiftPack(pack.id)">删除</button>
    </div>
    <div v-if="allGiftPacks.length === 0" class="empty">暂无礼包</div>
  </div>
</div>
</div>

  <!-- 编辑用户弹窗  -->
<div v-if="showEditDialog" class="dialog-overlay" @click="showEditDialog = false">
  <div class="dialog-content dialog-horizontal" @click.stop>
    <div class="dialog-header">
      <h3>编辑用户</h3>
      <span class="close" @click="showEditDialog = false">×</span>
    </div>
    <div class="dialog-body">
      <div class="form-row">
        <div class="form-group">
          <label>用户名</label>
          <input v-model="editUserForm.username" />
        </div>
        <div class="form-group">
          <label>学校</label>
          <input v-model="editUserForm.university" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>信用分</label>
          <input type="number" v-model="editUserForm.creditScore" />
        </div>
        <div class="form-group">
          <label>信用等级</label>
          <select v-model="editUserForm.creditLevel">
            <option value="极好">极好</option>
            <option value="优秀">优秀</option>
            <option value="良好">良好</option>
            <option value="一般">一般</option>
            <option value="较差">较差</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>手机号</label>
          <input v-model="editUserForm.phone" />
        </div>
        <div class="form-group">
          <label>学号</label>
          <input v-model="editUserForm.studentId" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>一卡通号</label>
          <input v-model="editUserForm.cardId" />
        </div>
        <div class="form-row">
  <div class="form-group">
    <label>密码</label>
    <input type="password" v-model="editUserForm.password" placeholder="留空则不修改" />
  </div>
</div>
        <div class="form-group">
          <label>性别</label>
          <select v-model="editUserForm.gender">
            <option value="男">男</option>
            <option value="女">女</option>
            <option value="未设置">未设置</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>生日</label>
          <input type="date" v-model="editUserForm.birth" />
        </div>
      </div>
      <div class="form-group full-width">
        <label>个人描述</label>
        <textarea v-model="editUserForm.description" rows="3"></textarea>
      </div>
    </div>
    <div class="dialog-footer">
      <button class="cancel-btn" @click="showEditDialog = false">取消</button>
      <button class="save-btn" @click="saveUserEdit">保存</button>
    </div>
  </div>
</div>
  </div>
</template>

<script setup>
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080'
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()

const currentTab = ref('stats')
const searchKeyword = ref('')
const filterType = ref('')

const stats = ref({ users: 0, products: 0, selling: 0, totalAmount: 0 })
const productList = ref([])
const userList = ref([])
const orderList = ref([])
const currentActivity = ref(null)
const allGiftPacks = ref([])
// 编辑弹窗
const showEditDialog = ref(false)
const editUserForm = ref({})

// 筛选商品
// 状态筛选
const filterStatus = ref('')
const pendingCount = ref(0)
const showAuditDialog = ref(false)
const auditProduct = ref({})

// 获取状态文本
const getStatusText = (status) => {
  const map = {
    0: '出售中',
    1: '已售出',
    2: '已下架',
    3: '待审核'
  }
  return map[status] || '未知'
}

// 获取状态样式类
const getStatusClass = (status) => {
  const map = {
    0: 'status-sell',
    1: 'status-sold',
    2: 'status-off',
    3: 'status-pending'
  }
  return map[status] || ''
}

// 修改 filteredProducts，加入状态筛选
const filteredProducts = computed(() => {
  let list = [...productList.value]
  if (searchKeyword.value) {
    list = list.filter(p => p.name.toLowerCase().includes(searchKeyword.value.toLowerCase()))
  }
  if (filterType.value) {
    list = list.filter(p => p.type === filterType.value)
  }
  if (filterStatus.value !== '') {
    list = list.filter(p => p.status === parseInt(filterStatus.value))
  }
  return list
})

// 加载待审核商品
const loadPendingProducts = async () => {
  try {
    const res = await axios.get(`${API_BASE}/product/admin/pending`, {
      withCredentials: true
    })
    const pendingList = res.data.data || []
    pendingCount.value = pendingList.length
    // 切换到待审核状态筛选
    filterStatus.value = '3'
    // 刷新商品列表
    loadProducts()
  } catch (err) {
    console.error('加载待审核商品失败', err)
  }
}

// 打开审核弹窗
const openAuditDialog = (product) => {
  auditProduct.value = product
  showAuditDialog.value = true
}

// 提交审核
const submitAudit = async (auditStatus) => {
  try {
    const res = await axios.post(`${API_BASE}/product/admin/audit`, null, {
      params: {
        productId: auditProduct.value.id,
        auditStatus: auditStatus
      },
      withCredentials: true
    })
    alert(res.data.msg || (auditStatus === 1 ? '审核通过' : '已驳回'))
    showAuditDialog.value = false
    loadProducts()
    loadStats()
  } catch (err) {
    alert('操作失败')
  }
}

// 商品详情跳转
const goToProductDetail = (id) => {
  router.push(`/product/detail/${id}`)
}
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
// 编辑商品相关
const showEditProduct = ref(false)
const editProductForm = ref({
  id: null,
  name: '',
  price: 0,
  type: '',
  info: ''
})

// 打开编辑弹窗
const openEditProduct = (product) => {
  editProductForm.value = {
    id: product.id,
    name: product.name,
    price: product.price,
    type: product.type,
    info: product.info || ''
  }
  showEditProduct.value = true
}

// 提交编辑
const submitEditProduct = async () => {
  if (!editProductForm.value.name) {
    alert('请输入商品名称')
    return
  }
  if (!editProductForm.value.price || editProductForm.value.price <= 0) {
    alert('请输入有效的价格')
    return
  }
  try {
    const res = await axios.post(`${API_BASE}/product/update`, editProductForm.value, {
      withCredentials: true
    })
    if (res.data.code === 200) {
      alert('编辑成功')
      showEditProduct.value = false
      loadProducts()
      loadStats()
    } else {
      alert(res.data.msg || '编辑失败')
    }
  } catch (err) {
    console.error('编辑失败', err)
    alert('编辑失败')
  }
}

// 订单管理相关
const orderFilterStatus = ref('')
const orderSearchKeyword = ref('')
const showOrderDetail = ref(false)
const currentOrder = ref({})

// 筛选订单
const filteredOrderList = computed(() => {
  let list = [...orderList.value]
  
  // 状态筛选
  if (orderFilterStatus.value) {
    list = list.filter(o => o.orderStatus === orderFilterStatus.value)
  }
  
  // 关键词搜索
  if (orderSearchKeyword.value) {
    const keyword = orderSearchKeyword.value.toLowerCase()
    list = list.filter(o => 
      o.orderNo?.toLowerCase().includes(keyword) ||
      o.product?.name?.toLowerCase().includes(keyword) ||
      o.buyerName?.toLowerCase().includes(keyword) ||
      o.sellerName?.toLowerCase().includes(keyword)
    )
  }
  
  return list
})

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')} ${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`
}

// 查看订单详情
const viewOrderDetail = (order) => {
  currentOrder.value = order
  showOrderDetail.value = true
}

// 管理员取消订单
const adminCancelOrder = async (orderId) => {
  if (!confirm('确定要取消该订单吗？')) return
  try {
    const res = await axios.post(`${API_BASE}/order/admin/cancel/${orderId}`, null, {
      withCredentials: true
    })
    alert(res.data.msg || '取消成功')
    loadOrders()
    loadStats()
  } catch (err) {
    alert(err.response?.data?.msg || '取消失败')
  }
}

// 提醒卖家发货
const remindSeller = (order) => {
  alert(`已提醒卖家 ${order.sellerName || '卖家'} 尽快发货`)
  // 这里可以调用后端发送通知
}

// 管理员处理退款
const adminHandleRefund = async (orderId, action) => {
  const msg = action === 'approve' ? '同意退款' : '拒绝退款'
  if (!confirm(`确定${msg}吗？`)) return
  
  try {
    const url = action === 'approve' ? '/order/refund/approve' : '/order/refund/reject'
    const res = await axios.post(`${API_BASE}${url}`, null, {
      params: { orderId },
      withCredentials: true
    })
    alert(res.data.msg || `${msg}成功`)
    loadOrders()
    loadStats()
  } catch (err) {
    alert(err.response?.data?.msg || '操作失败')
  }
}
// 加载统计数据
const loadStats = async () => {
  try {
    const res = await axios.get(`${API_BASE}/product/list`)
    const products = res.data.data || []
    stats.value.products = products.length
    stats.value.selling = products.filter(p => p.status === 0).length
    
    const userRes = await axios.get(`${API_BASE}/user/admin/users`)
    stats.value.users = (userRes.data.data || []).length
    
    const orderRes = await axios.get(`${API_BASE}/order/admin/all`)
    const orders = orderRes.data.data || []
    
    const originalTotal = orders.reduce((sum, o) => sum + (o.price * o.quantity || 0), 0)
    stats.value.totalAmount = originalTotal.toFixed(2)
  } catch (err) {
    console.error('加载失败', err)
  }
}

// 加载商品列表
// 加载商品列表（管理员专用）
const loadProducts = async () => {
  try {
    const res = await axios.get(`${API_BASE}/product/admin/list`, {
      withCredentials: true
    })
    productList.value = res.data.data || []
  } catch (err) {
    console.error('加载商品失败', err)
  }
}
// 跳转礼包详情
const goToDetail = (id, type) => {
  router.push(`/giftPack/detail/${id}?type=${type}`)
}
// 加载用户列表
const loadUsers = async () => {
  try {
    const res = await axios.get(`${API_BASE}/user/admin/users`)
    userList.value = res.data.data || []
    for (let user of userList.value) {
      try {
     const productRes = await axios.get(`${API_BASE}/product/admin/user/products`, {
  params: { userId: user.id }
})
        user.productCount = (productRes.data.data || []).length
      } catch (e) {
        user.productCount = 0
      }
    }
  } catch (err) {
    console.error('加载用户失败', err)
  }
}

// 删除用户
const deleteUser = async (userId, username) => {
  if (!confirm(`确定要删除用户 "${username}" 吗？\n该用户的所有商品和订单也会被删除，此操作不可恢复！`)) return
  
  try {
    const res = await axios.delete(`${API_BASE}/user/admin/delete/${userId}`, {
      withCredentials: true
    })
    if (res.data.code === 200) {
      alert('删除成功')
      loadUsers()  // 刷新用户列表
      loadStats()  // 刷新统计数据
    } else {
      alert(res.data.msg || '删除失败')
    }
  } catch (err) {
    alert(err.response?.data?.msg || '删除失败')
  }
}
// 加载订单列表
const loadOrders = async () => {
  try {
    const res = await axios.get(`${API_BASE}/order/admin/all`)
    orderList.value = res.data.data || []
  } catch (err) {
    console.error('加载订单失败', err)
  }
}

// 下架商品
const offProduct = async (id) => {
  if (!confirm('确定下架该商品吗？')) return
  try {
    await axios.post(`${API_BASE}/product/off/${id}`)
    alert('下架成功')
    loadProducts()
    loadStats()
  } catch (err) {
    alert('下架失败')
  }
}

// 删除商品
const deleteProduct = async (id) => {
  if (!confirm('确定删除该商品吗？此操作不可恢复！')) return
  try {
    await axios.delete(`${API_BASE}/product/delete/${id}`)
    alert('删除成功')
    loadProducts()
    loadStats()
  } catch (err) {
    alert('删除失败')
  }
}
// 切换热门状态（无确认弹窗）
const toggleHot = async (product, isHot) => {
  try {
    const res = await axios.post(`${API_BASE}/product/update`, {
      id: product.id,
      name: product.name,
      price: product.price,
      type: product.type,
      info: product.info,
      hot: isHot
    }, {
      withCredentials: true
    })
    if (res.data.code === 200) {
      loadProducts()  // 刷新列表
    } else {
      alert(res.data.msg || '操作失败')
    }
  } catch (err) {
    alert('操作失败')
  }
}

// 编辑用户
const editUser = (user) => {
  editUserForm.value = { ...user }
  showEditDialog.value = true
}

// 保存用户编辑
const saveUserEdit = async () => {
  try {
    await axios.post(`${API_BASE}/user/admin/update`, editUserForm.value)
    alert('保存成功')
    showEditDialog.value = false
    loadUsers()
  } catch (err) {
    alert('保存失败')
  }
}

// 查看用户商品
const viewUserProducts = (userId) => {
  // 跳转到商品列表页，并传递 userId 参数
  router.push(`/my/product?userId=${userId}&adminView=true`)
}
// 获取订单状态文本
const getOrderStatus = (status) => {
  const map = {
    'pending': '待付款',
    'paid': '待发货',
    'shipped': '待收货',
    'completed': '已完成'
  }
  return map[status] || status
}
// 管理员强制发货
const adminShipOrder = async (orderId) => {
  if (!confirm('确定强制发货吗？')) return
  try {
    const res = await axios.post(`${API_BASE}/order/admin/ship/${orderId}`, null, {
      withCredentials: true
    })
    alert(res.data.msg || '发货成功')
    loadOrders()
    loadStats()
  } catch (err) {
    alert(err.response?.data?.msg || '发货失败')
  }
}

// 管理员强制确认收货
const adminConfirmOrder = async (orderId) => {
  if (!confirm('确定强制确认收货吗？注意：线下交易会直接扣款！')) return
  try {
    const res = await axios.post(`${API_BASE}/order/admin/confirm/${orderId}`, null, {
      withCredentials: true
    })
    alert(res.data.msg || '确认成功')
    loadOrders()
    loadStats()
  } catch (err) {
    alert(err.response?.data?.msg || '确认失败')
  }
}

// 管理员删除订单
const adminDeleteOrder = async (orderId) => {
  if (!confirm('确定删除该订单吗？此操作不可恢复！')) return
  try {
    const res = await axios.delete(`${API_BASE}/order/admin/delete/${orderId}`, {
      withCredentials: true
    })
    alert(res.data.msg || '删除成功')
    loadOrders()
    loadStats()
  } catch (err) {
    alert(err.response?.data?.msg || '删除失败')
  }
}

// 获取等级样式
const getLevelClass = (level) => {
  if (level === '极好') return 'excellent'
  if (level === '优秀') return 'good'
  if (level === '良好') return 'fine'
  return 'normal'
}



// 设置活动
const setActivity = (type) => {
  currentActivity.value = type
  localStorage.setItem('currentActivity', type)
  alert(`${type === 'graduation' ? '毕业季' : '开学季'}已开启`)
}

// 关闭活动
const closeActivity = () => {
  currentActivity.value = null
  localStorage.removeItem('currentActivity')
  alert('活动已关闭')
}
// 加载所有礼包
const loadAllGiftPacks = async () => {
  try {
    const gradRes = await axios.get(`${API_BASE}/giftPack/list`, {
      params: { type: 'graduation' },
      withCredentials: true
    })
    const freshRes = await axios.get(`${API_BASE}/giftPack/list`, {
      params: { type: 'freshman' },
      withCredentials: true
    })
    allGiftPacks.value = [...(gradRes.data.data || []), ...(freshRes.data.data || [])]
  } catch (err) {
    console.error('加载礼包失败', err)
  }
}

// 删除礼包
const deleteGiftPack = async (id) => {
  if (!confirm('确定删除该礼包吗？')) return
  try {
    await axios.delete(`${API_BASE}/giftPack/delete/${id}`, {
      withCredentials: true
    })
    alert('删除成功')
    loadAllGiftPacks()
  } catch (err) {
    alert('删除失败')
  }
}

// 在 onMounted 中添加
onMounted(() => {
  loadStats()
  loadProducts()
  loadUsers()
  loadOrders()
  loadAllGiftPacks()
  // 读取保存的活动状态
   const saved = localStorage.getItem('currentActivity')
  currentActivity.value = saved || null
})
</script>

<style scoped>
.admin-page {
  min-height: 100vh;
  background: linear-gradient(145deg, #e8f4ff 0%, #d4e8ff 100%);
  padding: 20px;
}

.header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
}

.back {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  padding: 8px 20px;
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

.tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
  background: white;
  padding: 6px;
  border-radius: 60px;
  width: fit-content;
  border: 1px solid rgba(37, 99, 235, 0.1);
}

.tab {
  padding: 10px 28px;
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

/* ========== 数据统计 ========== */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.stat-card {
  background: white;
  border-radius: 24px;
  padding: 24px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  transition: all 0.3s;
  border: 1px solid rgba(37, 99, 235, 0.08);
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.1);
}

.stat-icon {
  font-size: 40px;
  margin-bottom: 12px;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #2563eb;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
  margin-top: 8px;
}

/* ========== 商品管理 ========== */
.search-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.search-bar input, .search-bar select {
  padding: 10px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  font-size: 14px;
  background: white;
}

.search-bar input:focus, .search-bar select:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
}

.search-bar input {
  flex: 1;
}

.product-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.product-card {
  background: white;
  border-radius: 20px;
  padding: 16px;
  display: flex;
  gap: 16px;
  align-items: center;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(37, 99, 235, 0.08);
}

.product-card:hover {
  transform: translateX(5px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.1);
}

.product-img {
  width: 70px;
  height: 70px;
  border-radius: 14px;
  object-fit: cover;
}

.product-info {
  flex: 1;
}

.product-name {
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 4px;
  color: #1f2937;
}

.product-price {
  color: #2563eb;
  font-weight: bold;
}

.product-seller {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

.product-status {
  font-size: 12px;
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  margin-top: 6px;
  font-weight: 500;
}

.status-sell { background: #d1fae5; color: #059669; }
.status-sold { background: #fef3c7; color: #d97706; }
.status-off { background: #fee2e2; color: #dc2626; }

.product-actions {
  display: flex;
  gap: 10px;
}

.off-btn, .del-btn, .view-btn, .edit-btn {
  padding: 6px 18px;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.3s;
}

.off-btn {
  background: #f97316;
  color: white;
}

.off-btn:hover {
  background: #ea580c;
  transform: translateY(-1px);
}

.del-btn {
  background: #ef4444;
  color: white;
}

.del-btn:hover {
  background: #dc2626;
  transform: translateY(-1px);
}

.view-btn {
  background: #2563eb;
  color: white;
  margin-left: 10px;
}

.view-btn:hover {
  background: #1d4ed8;
  transform: translateY(-1px);
}

.edit-btn {
  background: #10b981;
  color: white;
  margin-right: 8px;
}

.edit-btn:hover {
  background: #059669;
  transform: translateY(-1px);
}

/* ========== 用户管理 ========== */
.user-table {
  width: 100%;
  background: white;
  border-radius: 20px;
  overflow: hidden;
  border-collapse: collapse;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(37, 99, 235, 0.08);
}

.user-table th, .user-table td {
  padding: 14px 18px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.user-table th {
  background: #f8fafc;
  font-weight: 600;
  color: #1f2937;
}

.user-table tr:hover {
  background: #f8fafc;
}

.level-excellent { color: #fbbf24; font-weight: bold; }
.level-good { color: #10b981; }
.level-fine { color: #2563eb; }
.level-normal { color: #9ca3af; }

.delete-user-btn {
  background: #ef4444;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  margin-left: 10px;
}

.delete-user-btn:hover {
  background: #dc2626;
}

/* ========== 订单管理 ========== */
.orders-panel {
  background: white;
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(37, 99, 235, 0.08);
}

.order-filters {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.order-filters select,
.order-filters input {
  padding: 12px 20px;
  border-radius: 40px;
  border: 1px solid #e5e7eb;
  background: white;
  font-size: 14px;
  transition: all 0.3s ease;
}

.order-filters select:focus,
.order-filters input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.order-filters select {
  width: 150px;
  cursor: pointer;
}

.order-filters input {
  flex: 1;
  min-width: 200px;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.order-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  border: 1px solid rgba(37, 99, 235, 0.08);
}

.order-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(37, 99, 235, 0.1);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
}

.order-no {
  font-size: 13px;
  color: #6b7280;
  font-family: monospace;
  letter-spacing: 0.5px;
}

.order-time {
  font-size: 12px;
  color: #2563eb;
  margin-left: 15px;
}

.order-status {
  padding: 6px 14px;
  border-radius: 30px;
  font-size: 12px;
  font-weight: 600;
}

.status-pending { background: #fef3c7; color: #d97706; }
.status-paid { background: #dbeafe; color: #2563eb; }
.status-shipped { background: #d1fae5; color: #059669; }
.status-completed { background: #d1fae5; color: #059669; }
.status-refunded { background: #fce7f3; color: #db2777; }
.status-cancelled { background: #f3f4f6; color: #6b7280; }

.order-content {
  display: flex;
  gap: 20px;
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
}

.order-img {
  width: 100px;
  height: 100px;
  border-radius: 16px;
  object-fit: cover;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.order-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.order-name {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.order-price {
  font-size: 14px;
  color: #6b7280;
}

.order-total {
  font-size: 16px;
  font-weight: 700;
  color: #2563eb;
}

.order-user {
  font-size: 13px;
  color: #6b7280;
  display: inline-block;
  background: #f3f4f6;
  padding: 4px 12px;
  border-radius: 20px;
  margin-right: 8px;
}

.order-refund {
  padding: 12px 20px;
  background: #fffbeb;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  gap: 12px;
}

.refund-pending { color: #d97706; font-size: 13px; display: flex; align-items: center; gap: 6px; }
.refund-approved { color: #059669; font-size: 13px; display: flex; align-items: center; gap: 6px; }
.refund-rejected { color: #dc2626; font-size: 13px; display: flex; align-items: center; gap: 6px; }

.order-actions {
  padding: 16px 20px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  background: #f9fafb;
}

.order-actions button {
  padding: 8px 20px;
  border: none;
  border-radius: 40px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.cancel-order-btn {
  background: #f3f4f6;
  color: #6b7280;
}
.cancel-order-btn:hover { background: #f97316; color: white; }

.remind-btn {
  background: #dbeafe;
  color: #2563eb;
}
.remind-btn:hover { background: #2563eb; color: white; }

.approve-refund-btn {
  background: #d1fae5;
  color: #059669;
}
.approve-refund-btn:hover { background: #059669; color: white; }

.reject-refund-btn {
  background: #fee2e2;
  color: #dc2626;
}
.reject-refund-btn:hover { background: #dc2626; color: white; }

.detail-btn {
  background: linear-gradient(135deg, #2563eb, #1e40af);
  color: white;
}
.detail-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4); }

.admin-ship-btn {
  background: #f97316;
  color: white;
}
.admin-confirm-btn {
  background: #10b981;
  color: white;
}
.admin-delete-btn {
  background: #ef4444;
  color: white;
}

/* ========== 活动管理 ========== */
.activity-panel {
  background: white;
  border-radius: 24px;
  padding: 24px;
  border: 1px solid rgba(37, 99, 235, 0.08);
}

.activity-switch {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
}

.activity-card {
  flex: 1;
  background: #f9fafb;
  border-radius: 20px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 20px;
  border: 2px solid transparent;
  transition: all 0.3s;
}

.activity-card.active {
  border-color: #2563eb;
  background: #eff6ff;
}

.activity-icon {
  font-size: 48px;
}

.activity-info h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #1f2937;
}

.activity-info p {
  margin: 4px 0;
  font-size: 13px;
  color: #6b7280;
}

.open-btn, .close-btn {
  margin-left: auto;
  padding: 8px 24px;
  border: none;
  border-radius: 40px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.3s;
}

.open-btn {
  background: #2563eb;
  color: white;
}
.open-btn:hover { background: #1d4ed8; transform: translateY(-1px); }

.close-btn {
  background: #ef4444;
  color: white;
}
.close-btn:hover { background: #dc2626; transform: translateY(-1px); }

.current-status {
  background: linear-gradient(135deg, #2563eb, #1e40af);
  border-radius: 20px;
  padding: 16px 24px;
  margin-bottom: 24px;
  text-align: center;
  color: white;
  font-size: 16px;
}

.current-status strong {
  margin-left: 10px;
  font-size: 18px;
}

/* ========== 礼包管理 ========== */
.giftpack-manage h3 {
  margin: 0 0 20px 0;
  padding-bottom: 12px;
  border-bottom: 2px solid #e5e7eb;
  font-size: 18px;
  color: #1f2937;
}

.giftpack-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.giftpack-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  background: #f9fafb;
  border-radius: 16px;
  transition: all 0.3s;
}

.giftpack-item:hover {
  background: #f3f4f6;
}

.giftpack-info {
  display: flex;
  gap: 20px;
  align-items: center;
  flex-wrap: wrap;
}

.giftpack-info .name {
  font-weight: 600;
  color: #1f2937;
}

.giftpack-info .seller {
  font-size: 13px;
  color: #6b7280;
}

.giftpack-info .type {
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 20px;
  background: #d1fae5;
  color: #059669;
  font-weight: 500;
}

.delete-pack-btn {
  padding: 8px 20px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.3s;
}

.delete-pack-btn:hover {
  background: #dc2626;
  transform: translateY(-1px);
}

/* ========== 弹窗 ========== */
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
  width: 500px;
  max-width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #2563eb, #1e40af);
}

.dialog-header h3 {
  margin: 0;
  font-size: 18px;
  color: white;
}

.dialog-header .close {
  font-size: 28px;
  cursor: pointer;
  line-height: 1;
  color: white;
  transition: all 0.3s;
}

.dialog-header .close:hover {
  color: #f3f4f6;
}

.dialog-body {
  padding: 24px;
  max-height: 60vh;
  overflow-y: auto;
}

.form-row {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
}

.form-group {
  flex: 1;
}

.form-group.full-width {
  width: 100%;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #1f2937;
}

.form-group input, .form-group select, .form-group textarea {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-sizing: border-box;
  font-size: 14px;
  transition: all 0.3s;
}

.form-group input:focus, .form-group select:focus, .form-group textarea:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
}

.dialog-footer {
  display: flex;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
}

.cancel-btn, .save-btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 40px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s;
}

.cancel-btn {
  background: #f3f4f6;
  color: #6b7280;
}
.cancel-btn:hover { background: #e5e7eb; }

.save-btn {
  background: linear-gradient(135deg, #2563eb, #1e40af);
  color: white;
}
.save-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3); }

.section-title {
  font-size: 14px;
  font-weight: bold;
  margin: 10px 0 8px 0;
  padding-left: 8px;
  border-left: 3px solid #2563eb;
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
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.dialog-large {
  width: 650px;
  max-width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .tabs {
    width: 100%;
    overflow-x: auto;
  }
  .activity-card {
    flex-direction: column;
    text-align: center;
  }
  .open-btn, .close-btn {
    margin-left: 0;
  }
}
.edit-product-btn {
  background: #10b981;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  margin-right: 8px;
}

.edit-product-btn:hover {
  background: #059669;
}
/* 编辑商品弹窗 */
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

.form-item input,
.form-item select,
.form-item textarea {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  font-size: 14px;
  box-sizing: border-box;
  transition: all 0.2s;
}

.form-item input:focus,
.form-item select:focus,
.form-item textarea:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
}

.dialog-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.dialog-footer .cancel-btn {
  padding: 8px 20px;
  background: #f3f4f6;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  font-size: 14px;
  color: #6b7280;
}

.dialog-footer .save-btn {
  padding: 8px 20px;
  background: linear-gradient(135deg, #2563eb, #1e40af);
  border: none;
  border-radius: 30px;
  cursor: pointer;
  font-size: 14px;
  color: white;
}

.dialog-footer .save-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}
/* 待审核状态样式 */
.status-pending { background: #fef3c7; color: #d97706; }

/* 待审核按钮 */
.pending-btn {
  background: linear-gradient(135deg, #f97316, #ea580c);
  color: white;
  border: none;
  padding: 0 16px;
  border-radius: 30px;
  cursor: pointer;
  font-size: 14px;
  white-space: nowrap;
}

.pending-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
}

/* 审核按钮 */
.approve-btn {
  background: #10b981;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  margin-right: 8px;
}

.reject-btn {
  background: #ef4444;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
}

/* 商品预览 */
.product-preview {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.audit-img {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 12px;
}

.audit-info {
  flex: 1;
}

.audit-info div {
  margin-bottom: 8px;
  font-size: 14px;
  color: #4b5563;
}
/* 热门按钮 */
.hot-btn {
  background: #f97316;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  margin-right: 8px;
}

.hot-btn.active {
  background: #ef4444;
}

.hot-btn:hover {
  opacity: 0.9;
}
</style>