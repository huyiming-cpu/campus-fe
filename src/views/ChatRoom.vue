<template>
  <div class="chat-page">
    <!-- 左侧聊天列表 -->
    <div class="left">
      <div class="left-header">
        <button class="back-btn" @click="goBack">← 返回</button>
        <span class="chat-title">💬 消息列表</span>
      </div>
      <div class="item" v-for="item in chatList" :key="item.id" 
     :class="{ active: currentUser && currentUser.id === item.id }"
     @click="openChat(item)">
        <img :src="`${API_BASE}/avatar/${item.avatar || 'default.jpg'}`" class="list-avatar" />
        <div class="list-info">
          <div class="list-name">{{ item.username }}</div>
          <div class="list-msg">{{ item.lastMessage || '暂无消息' }}</div>
        </div>
        <div v-if="item.unreadCount > 0" class="unread">{{ item.unreadCount }}</div>
      </div>
    </div>

    <!-- 右侧聊天区 -->
    <div class="right">
      <div class="header" v-if="currentUser">
        与 {{ currentUser.username }} 聊天中
      </div>

      <div class="product-card" v-if="showProductCard">
        <img :src="`${API_BASE}/products/${productImage}`" class="card-img" />
        <div class="card-info">
          <div class="card-name">{{ productName }}</div>
          <button class="send-product-btn" @click="sendProductMessage">发送宝贝给TA</button>
        </div>
      </div>

      <div class="msg-box" ref="msgBoxRef">
        <div v-for="(m, idx) in msgList" :key="idx" :class="m.fromuserid === myId ? 'msg-row me' : 'msg-row other'">
          <img v-if="m.fromuserid !== myId" :src="`${API_BASE}/avatar/${m.avatar || 'default.jpg'}`" class="msg-avatar" />
         <div class="bubble-wrapper">
  <div class="bubble">
    <div v-if="isLocationMessage(m.content)" class="location-card" @click="openMap(m.content)">
      <div class="location-icon">📍</div>
      <div class="location-text">我的位置</div>
      <div class="location-link">点击查看地图 →</div>
    </div>
    <div v-else>{{ m.content }}</div>
  </div>
  <div class="time">{{ formatTime(m.createtime) }}</div>
</div>
          <img v-if="m.fromuserid === myId" :src="`${API_BASE}/avatar/${myInfo.avatar || 'default.jpg'}`" class="msg-avatar" />
        </div>
      </div>
<!-- 快捷回复 -->
<div class="quick-reply" v-if="currentUser">
  <button @click="addQuickReply('在吗？')">在吗？</button>
  <button @click="addQuickReply('什么时候发货？')">什么时候发货？</button>
  <button @click="addQuickReply('能便宜点吗？')">能便宜点吗？</button>
  <button @click="addQuickReply('好的，谢谢！')">好的，谢谢！</button>
  <button @click="addQuickReply('可以拍实物图吗？')">可以拍实物图吗？</button>
 <button @click="sendLocation" class="location-btn">📍 位置</button>
</div>

      <div class="send-box">
  <div class="input-wrapper">
    <button class="emoji-btn" @click="toggleEmojiPicker">😊</button>
    <input 
      v-model="content" 
      @keyup.enter="send" 
      placeholder="输入消息..."
      :disabled="isLoading"
    />
    <button class="send-btn" @click="send" :disabled="isLoading">发送</button>
  </div>
  <!-- Emoji 选择器 -->
  <div v-if="showEmojiPicker" class="emoji-picker">
    <span v-for="emoji in emojiList" :key="emoji" class="emoji-item" @click="addEmoji(emoji)">
      {{ emoji }}
    </span>
  </div>
</div>
    </div>
  </div>
</template>

<script setup>
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080'
import { ref, onMounted, nextTick } from 'vue'
import axios from 'axios'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const loginUser = JSON.parse(sessionStorage.getItem('loginUser'))
const myId = ref(loginUser.id)
const myInfo = ref(loginUser)

const pid = route.query.pid
const pname = route.query.pname
const pimage = route.query.pimage
const sellerId = route.query.sellerId 

const toId = ref(null)
const content = ref('')
const msgList = ref([])
const chatList = ref([])
const currentUser = ref(null)
const msgBoxRef = ref(null)
const showProductCard = ref(false)
const productName = ref('')
const productImage = ref('')
const showEmojiPicker = ref(false)
const emojiList = ['😀', '😁', '😂', '🤣', '😊', '😍', '🥰', '😘', '😎', '🤔', '😭', '😱', '😡', '🥳', '👍', '❤️', '🔥', '🎉', '✨', '💯']
const isLocationMessage = (content) => {
  return content && content.includes('📍 我的位置：') && content.includes('uri.amap.com')
}
const toggleEmojiPicker = () => {
  showEmojiPicker.value = !showEmojiPicker.value
}

const addEmoji = (emoji) => {
  content.value += emoji
  showEmojiPicker.value = false
}
/*const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}*/
const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const msgDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const timeStr = `${hours}:${minutes}`
  
  // 判断是否是今天
  if (msgDate.getTime() === today.getTime()) {
    return timeStr  // 今天只显示时间
  }
  // 判断是否是昨天
  else if (msgDate.getTime() === yesterday.getTime()) {
    return `昨天 ${timeStr}`
  }
  // 更早的显示完整日期
  else {
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    return `${month}/${day} ${timeStr}`
  }
}

const scrollToBottom = () => {
  nextTick(() => {
    if (msgBoxRef.value) {
      msgBoxRef.value.scrollTop = msgBoxRef.value.scrollHeight
    }
  })
}

const getSellerInfo = async (id) => {
  try {
    const res = await axios.get(`${API_BASE}/user/${id}`)
    return res.data.data
  } catch (e) {
    console.error('获取卖家信息失败', e)
    return null
  }
}

const getChatList = async () => {
  try {
    const res = await axios.get(`${API_BASE}/msg/my?userId=${myId.value}`)
    chatList.value = res.data.data || []
  } catch (e) {
    console.error('获取聊天列表失败', e)
  }
}

const getChatMsg = async () => {
  if (!toId.value) return
  try {
    const res = await axios.get(`${API_BASE}/msg/chat?from=${myId.value}&to=${toId.value}`)
    const messages = res.data.data || []
    
    for (let msg of messages) {
      if (msg.fromuserid !== myId.value && !msg.avatar) {
        const userRes = await axios.get(`${API_BASE}/user/${msg.fromuserid}`)
        msg.avatar = userRes.data.data?.avatar || 'default.jpg'
      } else if (msg.fromuserid === myId.value) {
        msg.avatar = myInfo.value.avatar
      }
    }
    
    msgList.value = messages
    scrollToBottom()
  } catch (e) {
    console.error('获取聊天记录失败', e)
  }
}

const send = async () => {
  if (!toId.value || !content.value.trim()) return
  try {
    await axios.post(`${API_BASE}/msg/send`, null, {
      params: {
        fromuserid: myId.value,
        touserid: toId.value,
        content: content.value,
        productid: pid || null
      }
    })
    content.value = ''
    await getChatMsg()
    await getChatList()
  } catch (e) {
    console.error('发送失败', e)
    alert('发送失败')
  }
}

const sendProductMessage = async () => {
  if (!toId.value) return
  const productMsg = `我对这个宝贝感兴趣：《${productName.value}》
商品链接：${location.origin}/product/detail/${pid}`
  
  try {
    await axios.post(`${API_BASE}/msg/send`, null, {
      params: {
        fromuserid: myId.value,
        touserid: toId.value,
        content: productMsg,
        productid: pid || null
      }
    })
    showProductCard.value = false
    await getChatMsg()
    await getChatList()
   
  } catch (e) {
    console.error('发送失败', e)
    alert('发送失败')
  }
}

const openChat = async (user) => {
  toId.value = user.id
  currentUser.value = user
  await getChatMsg()
  showProductCard.value = false
  
  try {
    // 标记已读
    await axios.get(`${API_BASE}/msg/markRead`, {
      params: {
        userId: myId.value,
        otherId: user.id
      }
    })
    
    // ✅ 标记完必须重新拉取列表，未读才会消失
    await getChatList() 
    
  } catch (e) {
    console.error('标记已读失败', e)
  }
}
// 快捷回复
const addQuickReply = (text) => {
  content.value = text
  send()
}// 判断是否是位置消息



// 发送位置
const sendLocation = () => {
  console.log('点击了位置按钮')
  if (!navigator.geolocation) {
    alert('您的浏览器不支持地理位置')
    return
  }
  
  navigator.geolocation.getCurrentPosition(
    (position) => {
      console.log('获取位置成功:', position)
      const lat = position.coords.latitude
      const lng = position.coords.longitude
      // 换成高德地图
      const locationMsg = `📍 我的位置：${lat}, ${lng}
https://uri.amap.com/marker?position=${lng},${lat}`
      sendLocationMessage(locationMsg)
    },
    (error) => {
      console.error('获取位置失败:', error)
      alert('获取位置失败：' + error.message)
    }
  )
}

// 发送位置消息
const sendLocationMessage = async (locationMsg) => {
  if (!toId.value) return
  
  try {
    await axios.post(`${API_BASE}/msg/send`, null, {
      params: {
        fromuserid: myId.value,
        touserid: toId.value,
        content: locationMsg,
        productid: pid || null
      }
    })
    await getChatMsg()
    await getChatList()
  } catch (e) {
    console.error('发送位置失败', e)
    alert('发送失败')
  }
}
const openMap = (content) => {
  // 匹配高德地图链接
  const match = content.match(/https:\/\/uri\.amap\.com\/marker\?position=([^,\s]+),([^,\s]+)/)
  if (match) {
    window.open(match[0], '_blank')
  }
}

onMounted(async () => {
  await getChatList()
  
  // 获取URL参数
  const sellerId = route.query.sellerId
  const pid = route.query.pid
  const pname = route.query.pname
  const pimage = route.query.pimage
  
  // 如果有 sellerId，就打开聊天（不管有没有商品）
  if (sellerId) {
    toId.value = Number(sellerId)
    
    const seller = await getSellerInfo(sellerId)
    if (seller) {
      currentUser.value = { 
        id: Number(sellerId), 
        username: seller.username,
        avatar: seller.avatar
      }
    } else {
      currentUser.value = { id: Number(sellerId), username: '用户', avatar: 'default.jpg' }
    }
    await getChatMsg()
    // ✅ 进入页面自动标记已读
try {
  await axios.get(`${API_BASE}/msg/markRead`, {
    params: {
      userId: myId.value,
      otherId: sellerId
    }
  })
  await getChatList() // 刷新未读
} catch (e) {
  console.error('自动标记已读失败', e)
}
    // 如果有商品信息，显示商品卡片
    if (pid && pname) {
      productName.value = pname
      productImage.value = pimage || 'default.jpg'
      showProductCard.value = true
    }
  }
})
const goBack = () => {
  router.back()
}
</script>

<style scoped>
.chat-page {
  display: flex;
  height: 100vh;
  background: white;
}

/* 左侧聊天列表 */
.left {
  width: 320px;
  background: white;
  border-right: 1px solid rgba(37, 99, 235, 0.1);
  overflow-y: auto;
}

.left-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: white;
  border-bottom: 1px solid rgba(37, 99, 235, 0.1);
  position: sticky;
  top: 0;
  z-index: 10;
}

.back-btn {
  padding: 6px 14px;
  background: linear-gradient(135deg, #2563eb, #1e40af);
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.3s;
}

.back-btn:hover {
  transform: translateX(-2px);
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
}

.chat-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid rgba(37, 99, 235, 0.05);
  cursor: pointer;
  transition: all 0.3s;
}

.item:hover {
  background: rgba(37, 99, 235, 0.05);
}

.item.active {
  background: rgba(37, 99, 235, 0.08);
  border-left: 3px solid #2563eb;
}

.list-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid white;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}

.list-info {
  flex: 1;
}

.list-name {
  font-weight: 600;
  margin-bottom: 4px;
  color: #1f2937;
}

.list-msg {
  font-size: 12px;
  color: #6b7280;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.unread {
  background: #ef4444;
  color: white;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 12px;
  min-width: 18px;
  text-align: center;
}

/* 右侧聊天区 */
.right {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  margin: 10px 10px 10px 0;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(37, 99, 235, 0.08);
}

.header {
  padding: 16px 20px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  font-weight: 600;
  font-size: 16px;
  color: #1f2937;
}

/* 商品卡片 */
.product-card {
  display: flex;
  align-items: center;
  gap: 15px;
  margin: 16px 20px;
  padding: 14px;
  background: #f8fafc;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(37, 99, 235, 0.15);
}

.card-img {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  object-fit: cover;
}

.card-name {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
}

.send-product-btn {
  padding: 8px 18px;
  background: linear-gradient(135deg, #2563eb, #1e40af);
  color: white;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.3s;
}

.send-product-btn:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
}

/* 消息区域 */
.msg-box {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: #f9fafb;
}

.msg-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.msg-row.me {
  justify-content: flex-end;
}

.msg-row.other {
  justify-content: flex-start;
}

.msg-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid white;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}

.bubble-wrapper {
  max-width: 65%;
}

.bubble {
  padding: 10px 16px;
  border-radius: 20px;
  font-size: 14px;
  line-height: 1.5;
  word-wrap: break-word;
}

.me .bubble {
  background: linear-gradient(135deg, #2563eb, #1e40af);
  color: white;
  border-bottom-right-radius: 4px;
}

.other .bubble {
  background: white;
  color: #1f2937;
  border: 1px solid #e5e7eb;
  border-bottom-left-radius: 4px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.02);
}

.time {
  font-size: 10px;
  color: #9ca3af;
  margin-top: 4px;
  padding: 0 4px;
}

/* 输入框 */
.send-box {
  padding: 16px 20px;
  background: white;
  border-top: 1px solid #e5e7eb;
  position: relative;
}

.input-wrapper {
  display: flex;
  gap: 8px;
  align-items: center;
}

.emoji-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s;
}

.emoji-btn:hover {
  background: #f3f4f6;
}

.send-box input {
  flex: 1;
  padding: 10px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 30px;
  outline: none;
  font-size: 14px;
  transition: all 0.3s;
}

.send-box input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
}

.send-btn {
  padding: 10px 24px;
  background: linear-gradient(135deg, #2563eb, #1e40af);
  color: white;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
}

.send-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
}

/* Emoji 选择器 */
.emoji-picker {
  position: absolute;
  bottom: 70px;
  left: 20px;
  background: white;
  border-radius: 16px;
  padding: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  width: 260px;
  z-index: 100;
  border: 1px solid #e5e7eb;
}

.emoji-item {
  font-size: 24px;
  cursor: pointer;
  padding: 6px;
  border-radius: 8px;
  transition: all 0.2s;
}

.emoji-item:hover {
  background: #f3f4f6;
  transform: scale(1.1);
}

/* 快捷回复 */
.quick-reply {
  display: flex;
  gap: 10px;
  padding: 12px 16px;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
  flex-wrap: wrap;
}

.quick-reply button {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 30px;
  padding: 6px 14px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  color: #4b5563;
}

.quick-reply button:hover {
  background: linear-gradient(135deg, #2563eb, #1e40af);
  color: white;
  border-color: transparent;
}

.location-btn {
  background: #f3f4f6 !important;
}

.location-btn:hover {
  background: linear-gradient(135deg, #f97316, #ea580c) !important;
}

/* 滚动条 */
.msg-box::-webkit-scrollbar {
  width: 6px;
}

.msg-box::-webkit-scrollbar-track {
  background: #e5e7eb;
  border-radius: 10px;
}

.msg-box::-webkit-scrollbar-thumb {
  background: #9ca3af;
  border-radius: 10px;
}

.msg-box::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}
</style>