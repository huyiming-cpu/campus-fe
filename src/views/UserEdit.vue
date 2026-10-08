<template>
  <div class="edit-container">
    
     <div class="content-wrapper">
    <div class="back" @click="goBack">← 返回</div>

    

    <!-- 可修改 -->
    <div class="item">
      <label>👩‍🎓用户名</label>
      <input v-model="form.username" placeholder="请输入用户名" />
      <div class="item">
  <label>📚个人描述</label>
  <input v-model="form.description" placeholder="请输入个人描述" />
</div>
    </div>

    <div class="item phone-box">
      <label>📱手机号</label>
      <input v-model="form.phone" placeholder="请输入手机号" />
      <button class="code-btn" @click="getCode">{{ codeText }}</button>
    </div>

    <div class="item">
      <label>📱验证码</label>
      <input v-model="code" placeholder="请输入验证码" />
    </div>

    <div class="item">
      <label>🗂️密码（不修改留空）</label>
      <input type="password" v-model="form.password" placeholder="输入新密码" />
    </div>

    <!-- 不可修改 -->
    <div class="item disabled">
      <label>🎓大学</label>
      <input disabled v-model="form.university" />
    </div>

    <div class="item disabled">
      <label>📖学号</label>
      <input disabled v-model="form.studentId" />
    </div>

    <div class="item disabled">
      <label>📖一卡通号</label>
      <input disabled v-model="form.cardId" />
    </div>
    
    <!-- 收货地址区域 -->
    <div class="address-section">
      <h3>🏠我的收货地址</h3>
      <div v-if="addressList.length === 0" class="empty-address">
        暂无收货地址，点击下方按钮添加
      </div>
      <div v-for="addr in addressList" :key="addr.id" class="address-item">
        <p><strong>{{ addr.receiver }}</strong> {{ addr.phone }}</p>
        <p>{{ addr.province }} {{ addr.city }} {{ addr.district }} {{ addr.detail }}</p>
        <div class="addr-btns">
          <button @click="editAddress(addr)">✏️编辑</button>
          <button @click="deleteAddress(addr.id)">🗑️删除</button>
          <button v-if="addr.isDefault !== 1" @click="setDefault(addr.id)">🏠设为默认</button>
          <span v-else class="default-tag">🏠默认地址</span>
        </div>
      </div>
      <button class="add-addr-btn" @click="addAddress">➕新增地址</button>
    </div>

    <!-- 按钮 -->
    <button class="save-btn" @click="saveInfo">📝保存修改</button>
    <button class="delete-btn" @click="logoutUser">✏️注销账号</button>

    <!-- 地址弹窗 -->
    <div v-if="showAddressDialog" class="dialog-overlay" @click="closeAddressDialog">
      <div class="dialog-content" @click.stop>
        <h3>{{ isEdit ? '编辑地址' : '新增地址' }}</h3>
        <div class="form-item">
          <label>👤收货人</label>
          <input v-model="currentAddress.receiver" placeholder="请输入收货人" />
        </div>
        <div class="form-item">
          <label>📱手机号</label>
          <input v-model="currentAddress.phone" placeholder="请输入手机号" />
        </div>
        <div class="form-item">
          <label>省</label>
          <input v-model="currentAddress.province" placeholder="请输入省" />
        </div>
        <div class="form-item">
          <label>市</label>
          <input v-model="currentAddress.city" placeholder="请输入市" />
        </div>
        <div class="form-item">
          <label>区</label>
          <input v-model="currentAddress.district" placeholder="请输入区" />
        </div>
        <div class="form-item">
          <label>详细地址</label>
          <input v-model="currentAddress.detail" placeholder="请输入详细地址" />
        </div>
        <div class="dialog-btns">
          <button @click="closeAddressDialog">❌取消</button>
          <button @click="saveAddress">💾保存</button>
        </div>
      </div></div>
    </div>
  </div>
</template>

<script setup>
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080'
import { ref, onMounted, computed, onActivated } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const form = ref({
  username: '',
  phone: '',
  password: '',
  university: '',
  studentId: '',
  cardId: '',
  avatar: '',
  description: ''
})
const code = ref('')
const codeText = ref('获取验证码')
const addressList = ref([])

// 弹窗相关
const showAddressDialog = ref(false)
const isEdit = ref(false)
const currentAddress = ref({
  receiver: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detail: ''
})

// 头像 URL 计算属性（后端静态资源方案）
const avatarUrl = computed(() => {
  if (form.value.avatar) {
    return `${API_BASE}/avatars/${form.value.avatar}`
  }
  return `\${API_BASE}/avatars/default.jpg`
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
// 加载用户信息
const getUserInfo = async () => {
  try {
    const res = await axios.get(`\${API_BASE}/user/getMyInfo`, {
      withCredentials: true
    })
    console.log('用户信息：', res.data)
    if (res.data && res.data.data) {
      Object.assign(form.value, res.data.data)
    }
  } catch (err) {
    console.error('获取用户信息失败', err)
    alert('获取用户信息失败，请稍后重试')
  }
}

// 加载地址列表
const loadAddress = async () => {
  try {
    const res = await axios.get(`\${API_BASE}/address/list`, {
      withCredentials: true
    })
    console.log('地址列表：', res.data)
    if (res.data && res.data.data) {
      addressList.value = res.data.data
    }
  } catch (err) {
    console.error('获取地址列表失败', err)
    addressList.value = []
  }
}


// 获取验证码
const getCode = async () => {
  if (!form.value.phone) {
    alert('请输入手机号')
    return
  }
  
  try {
    const res = await axios.get(`\${API_BASE}/user/sendSms?phone=` + form.value.phone)
    alert(`验证码已发送：${res.data.data}`)
    
    // 倒计时
    let countdown = 60
    codeText.value = `重新发送(${countdown}s)`
    const timer = setInterval(() => {
      countdown--
      if (countdown <= 0) {
        clearInterval(timer)
        codeText.value = '获取验证码'
      } else {
        codeText.value = `重新发送(${countdown}s)`
      }
    }, 1000)
  } catch (err) {
    console.error('发送验证码失败', err)
    alert('发送失败，请稍后重试')
  }
}

// 保存修改
const saveInfo = async () => {
  // 拿到原来的用户信息（从接口获取的原始数据）
  const original = await axios.get(`\${API_BASE}/user/getMyInfo`, {
    withCredentials: true
  })
  const oldUser = original.data.data

  // 判断是否修改了 手机号 或 密码
  const needCode = 
    form.value.phone !== oldUser.phone || 
    (form.value.password && form.value.password.trim() !== '')

  // 需要验证码 但 没填 → 拦截
  if (needCode && !code.value) {
    alert('修改手机号/密码必须输入验证码')
    return
  }

  try {
    const params = needCode ? { code: code.value } : {}

    const res = await axios.post(`\${API_BASE}/user/update`, 
      {
        username: form.value.username,
        phone: form.value.phone,
        password: form.value.password,
        description: form.value.description
      }, 
      {
        params: params,  // 需要才带验证码
        withCredentials: true
      }
    )

    if (res.data.code === 200) {
      alert('保存成功')
   const latestUser = await axios.get(`\${API_BASE}/user/getMyInfo`, {
        withCredentials: true
      })
      
      if (latestUser.data && latestUser.data.data) {
        // 更新 sessionStorage
        sessionStorage.setItem("loginUser", JSON.stringify(latestUser.data.data))
      }
      
      // 跳回个人中心
      router.push('/myCenter')
    } else {
      alert(res.data.msg)
    }
  } catch (err) {
    console.error(err)
    alert('保存失败')
  }
}

// 地址管理
const addAddress = () => {
  isEdit.value = false
  currentAddress.value = {
    receiver: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    detail: ''
  }
  showAddressDialog.value = true
}

const editAddress = (addr) => {
  isEdit.value = true
  currentAddress.value = { ...addr }
  showAddressDialog.value = true
}

const closeAddressDialog = () => {
  showAddressDialog.value = false
}

const saveAddress = async () => {
  const addr = currentAddress.value
  if (!addr.receiver || !addr.phone || !addr.detail) {
    alert('请填写完整信息')
    return
  }

  try {
    await axios.post(`\${API_BASE}/address/save`, addr, {
      withCredentials: true
    })
    alert('保存成功')
    closeAddressDialog()
    loadAddress()
  } catch (err) {
    console.error('保存地址失败', err)
    alert('保存失败，请稍后重试')
  }
}

const deleteAddress = async (id) => {
  if (!confirm('确定删除此地址？')) return
  
  try {
    await axios.delete(`${API_BASE}/address/delete/${id}`, {
      withCredentials: true
    })
    alert('删除成功')
    loadAddress()
  } catch (err) {
    console.error('删除地址失败', err)
    alert('删除失败，请稍后重试')
  }
}

const setDefault = async (id) => {
  try {
    await axios.post(`${API_BASE}/address/setDefault/${id}`, {}, {
      withCredentials: true
    })
    alert('设置成功')
    loadAddress()
  } catch (err) {
    console.error('设置默认地址失败', err)
    alert('设置失败，请稍后重试')
  }
}

// 注销账号
const logoutUser = async () => {
  if (!confirm('确定注销账号？此操作不可恢复！')) return
  
  try {
    const res = await axios.delete(`\${API_BASE}/user/delete`, {
      withCredentials: true
    })
    if (res.data.code === 200) {
      alert('注销成功')
      router.push('/login')
    } else {
      alert(res.data.msg || '注销失败')
    }
  } catch (err) {
    console.error('注销失败', err)
    alert('注销失败，请稍后重试')
  }
}

const goBack = () => router.back()

onMounted(() => {
  getUserInfo()
  loadAddress()
})

</script>

<style scoped>
.edit-container { 
  min-height: 100vh;
  padding: 20px; 
  background: linear-gradient(145deg, #e8f4ff 0%, #d4e8ff 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 0;
  margin-top: 0;
}

.content-wrapper {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.back { 
  font-size: 14px; 
  margin-top: 16px;
  margin-bottom: 20px; 
  cursor: pointer; 
  color: #2563eb;
  display: inline-block;
  padding: 8px 16px;
  background: rgba(37, 99, 235, 0.1);
  border-radius: 30px;
  transition: all 0.3s;
}
.back:hover {
  background: rgba(37, 99, 235, 0.2);
  transform: translateX(-2px);
  color: #1e40af;
}

.avatar-box { 
  text-align: center; 
  margin-bottom: 20px; 
  cursor: pointer;
}
.avatar-box img { 
  width: 100px; 
  height: 100px; 
  border-radius: 50%; 
  object-fit: cover;
  border: 3px solid white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
.tip { 
  font-size: 12px; 
  color: #6b7280; 
  margin-top: 5px; 
}

.item { 
  margin: 15px 0; 
}
.item label { 
  display: block; 
  margin-bottom: 5px; 
  font-weight: 500;
  color: #1f2937;
}
.item input { 
  width: 100%; 
  padding: 12px 16px; 
  border: 1px solid #e5e7eb;
  border-radius: 12px; 
  font-size: 14px;
  background: white;
  color: #1f2937;
  transition: all 0.3s;
}
.item input::placeholder {
  color: #9ca3af;
}
.item input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
}
.disabled input { 
  background: #f3f4f6; 
  color: #6b7280; 
  cursor: not-allowed;
}

.phone-box { 
  display: flex; 
  gap: 10px; 
  align-items: center;
}
.phone-box input {
  flex: 1;
}
.code-btn { 
  white-space: nowrap; 
  padding: 12px 20px; 
  background: linear-gradient(135deg, #2563eb, #1e40af);
  color: white; 
  border: none;
  border-radius: 30px; 
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}
.code-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.save-btn { 
  width: 100%; 
  padding: 14px; 
  background: linear-gradient(135deg, #2563eb, #1e40af);
  color: white; 
  border: none; 
  border-radius: 40px; 
  margin: 10px 0; 
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s;
}
.save-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.4);
}

.delete-btn { 
  width: 100%; 
  padding: 14px; 
  background: #ef4444;
  color: white; 
  border: none; 
  border-radius: 40px; 
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s;
}
.delete-btn:hover {
  background: #dc2626;
  transform: translateY(-2px);
}

.address-section { 
  margin: 20px 0; 
  padding: 15px 0;
  border-top: 1px solid #e5e7eb;
}
.address-section h3 {
  margin-bottom: 15px;
  color: #1f2937;
}
.empty-address {
  text-align: center;
  padding: 30px;
  color: #6b7280;
  background: #f9fafb;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
}

.address-item { 
  border: 1px solid #e5e7eb; 
  padding: 12px; 
  margin: 10px 0; 
  border-radius: 16px;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}
.address-item p {
  margin: 5px 0;
  color: #4b5563;
}
.addr-btns { 
  margin-top: 8px; 
  display: flex; 
  gap: 10px; 
}
.addr-btns button {
  padding: 5px 12px;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  cursor: pointer;
  font-size: 12px;
  color: #4b5563;
  transition: all 0.3s;
}
.addr-btns button:hover {
  background: #e5e7eb;
}
.default-tag { 
  color: #f59e0b; 
  font-size: 12px;
  padding: 5px 0;
}

.add-addr-btn { 
  width: 100%;
  background: #f3f4f6;
  color: #2563eb;
  border: 1px solid #e5e7eb;
  padding: 12px;
  border-radius: 40px;
  margin-top: 10px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}
.add-addr-btn:hover {
  background: #e5e7eb;
}

/* 弹窗样式 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}
.dialog-content {
  background: white;
  border-radius: 24px;
  padding: 24px;
  width: 90%;
  max-width: 400px;
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
  margin-bottom: 15px;
  color: #1f2937;
}
.dialog-content .form-item {
  margin: 10px 0;
}
.dialog-content label {
  display: block;
  margin-bottom: 5px;
  font-size: 14px;
  color: #4b5563;
}
.dialog-content input {
  width: 100%;
  padding: 10px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  font-size: 14px;
}
.dialog-btns {
  display: flex;
  gap: 10px;
  margin-top: 20px;
  justify-content: flex-end;
}
.dialog-btns button {
  padding: 10px 20px;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  font-weight: 500;
}
.dialog-btns button:first-child {
  background: #f3f4f6;
  color: #4b5563;
}
.dialog-btns button:first-child:hover {
  background: #e5e7eb;
}
.dialog-btns button:last-child {
  background: linear-gradient(135deg, #2563eb, #1e40af);
  color: white;
}
.dialog-btns button:last-child:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}
</style>