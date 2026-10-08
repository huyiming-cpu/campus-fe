<template>
  <div class="ai-chat-container">
    <div class="chat-header">
      <div class="back-btn" @click="goBack">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <div class="header-content">
        <div class="ai-icon">🤖</div>
        <div class="header-text">
          <span class="title">AI 智能客服</span>
          <span class="status">在线 · 秒回复</span>
        </div>
      </div>
    </div>

    <div class="msg-list" ref="msgListRef">
      <!-- AI欢迎语 -->
      <div class="msg ai">
        <div class="avatar-icon ai-avatar">🤖</div>
        <div class="bubble-wrapper">
          <div class="bubble">{{ msgList[0].content }}</div>
          <div class="time">刚刚</div>
        </div>
      </div>
      
      <!-- 用户和AI的对话 -->
      <div 
        v-for="(msg, idx) in msgList.slice(1)" 
        :key="idx" 
        :class="['msg', msg.role]"
      >
        <template v-if="msg.role === 'ai'">
          <div class="avatar-icon ai-avatar">🤖</div>
          <div class="bubble-wrapper">
            <div class="bubble">{{ msg.content }}</div>
            <div class="time">{{ getTime() }}</div>
          </div>
        </template>
        <template v-else>
          <div class="bubble-wrapper">
            <div class="bubble">{{ msg.content }}</div>
            <div class="time time-right">{{ getTime() }}</div>
          </div>
          <div class="avatar-icon user-avatar">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
        </template>
      </div>
      
      <!-- 加载动画 -->
      <div v-if="isLoading" class="msg ai">
        <div class="avatar-icon ai-avatar">🤖</div>
        <div class="bubble-wrapper">
          <div class="bubble loading-bubble">
            <div class="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="input-bar">
      <div class="input-wrapper">
        <input 
          v-model="inputText" 
          @keyup.enter="send" 
          placeholder="输入问题..."
          :disabled="isLoading"
        />
        <button @click="send" :disabled="isLoading">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
          <span>发送</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080'
import { ref, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

const msgList = ref([
  { role: 'ai', content: '你好！我是校园二手AI客服 ✨\n\n有什么可以帮你的吗？我可以帮你：\n📦 查询商品信息\n🛒 购物车问题\n📝 订单状态\n💬 其他任何问题' }
])
const inputText = ref('')
const isLoading = ref(false)
const msgListRef = ref(null)

const goBack = () => {
  router.back()
}

const getTime = () => {
  const now = new Date()
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
}

const scrollToBottom = () => {
  nextTick(() => {
    if (msgListRef.value) {
      msgListRef.value.scrollTop = msgListRef.value.scrollHeight
    }
  })
}

const send = async () => {
  const text = inputText.value.trim()
  if (!text) return
  if (isLoading.value) return

  msgList.value.push({ role: 'user', content: text })
  inputText.value = ''
  scrollToBottom()

  isLoading.value = true
  scrollToBottom()

  try {
    const res = await axios.post(`\${API_BASE}/ai/chat`, {
      message: text
    })

    if (res.data && res.data.data) {
      msgList.value.push({ role: 'ai', content: res.data.data })
    } else {
      msgList.value.push({ role: 'ai', content: 'AI 暂时无法回复，请稍后再试~' })
    }
    scrollToBottom()
  } catch (err) {
    console.error('AI调用失败：', err)
    msgList.value.push({ role: 'ai', content: '网络开小差了，请稍后再试~' })
    scrollToBottom()
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  scrollToBottom()
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.ai-chat-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(145deg, #e8f4ff 0%, #d4e8ff 100%);
  overflow: hidden;
}

/* 头部样式 */
.chat-header {
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 4px 20px rgba(37, 99, 235, 0.15);
  position: relative;
  z-index: 10;
}

.back-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
  color: white;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.ai-icon {
  width: 44px;
  height: 44px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  backdrop-filter: blur(10px);
}

.header-text {
  display: flex;
  flex-direction: column;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: white;
  letter-spacing: 0.5px;
}

.status {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 2px;
}

/* 消息列表 */
.msg-list {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 自定义滚动条 */
.msg-list::-webkit-scrollbar {
  width: 6px;
}

.msg-list::-webkit-scrollbar-track {
  background: #e5e7eb;
  border-radius: 10px;
}

.msg-list::-webkit-scrollbar-thumb {
  background: #9ca3af;
  border-radius: 10px;
}

.msg-list::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}

/* 消息样式 */
.msg {
  display: flex;
  gap: 10px;
  animation: fadeIn 0.3s ease-out;
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

.msg.ai {
  justify-content: flex-start;
}

.msg.user {
  justify-content: flex-end;
}

.avatar-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 20px;
}

.ai-avatar {
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
}

.user-avatar {
  background: #10b981;
  color: white;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.bubble-wrapper {
  max-width: 70%;
  display: flex;
  flex-direction: column;
}

.bubble {
  padding: 12px 16px;
  border-radius: 18px;
  font-size: 14px;
  line-height: 1.5;
  word-wrap: break-word;
  white-space: pre-wrap;
}

.msg.ai .bubble {
  background: white;
  color: #1f2937;
  border-bottom-left-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(37, 99, 235, 0.1);
}

.msg.user .bubble {
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  color: white;
  border-bottom-right-radius: 4px;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
}

.time {
  font-size: 10px;
  color: #9ca3af;
  margin-top: 4px;
  padding: 0 4px;
}

.time-right {
  text-align: right;
}

/* 加载动画 */
.loading-bubble {
  background: white;
  padding: 12px 20px;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  align-items: center;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background: #9ca3af;
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out both;
}

.typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
.typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

@keyframes typing {
  0%, 80%, 100% { transform: scale(0); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
}

/* 输入框 */
.input-bar {
  padding: 16px 20px;
  background: white;
  border-top: 1px solid #e5e7eb;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.03);
}

.input-wrapper {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  gap: 12px;
  align-items: center;
}

.input-wrapper input {
  flex: 1;
  padding: 12px 18px;
  border: 2px solid #e5e7eb;
  border-radius: 28px;
  outline: none;
  font-size: 14px;
  transition: all 0.2s;
  background: #f9fafb;
  color: #1f2937;
}

.input-wrapper input:focus {
  border-color: #2563eb;
  background: white;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.input-wrapper input:disabled {
  background: #f3f4f6;
  cursor: not-allowed;
}

.input-wrapper button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 24px;
  background: linear-gradient(135deg, #2563eb, #1e40af);
  color: white;
  border: none;
  border-radius: 28px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  box-shadow: 0 2px 6px rgba(37, 99, 235, 0.3);
}

.input-wrapper button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
}

.input-wrapper button:active:not(:disabled) {
  transform: translateY(0);
}

.input-wrapper button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  box-shadow: none;
}

/* 响应式 */
@media (max-width: 768px) {
  .bubble-wrapper {
    max-width: 80%;
  }
  
  .input-wrapper button span {
    display: none;
  }
  
  .input-wrapper button {
    padding: 10px 16px;
  }
}
</style>