<template>
  <div class="forget-container">
    <div class="star-bg">
      <div v-for="i in 100" :key="i" class="star" :style="getStarStyle(i)"></div>
      <!-- 教学楼剪影 -->
<div class="school-silhouette">
  <div class="building short"></div>
  <div class="building tall"></div>
  <div class="building"></div>
  <div class="tree"></div>
  <div class="building short"></div>
</div>
    </div>
    <div class="forget-box">
      <div class="logo-area">
  <div class="logo-icon">🔐</div>
  <h2>重置密码</h2>
</div>

      <form @submit.prevent="doReset">
        <div class="input-item">
          <input v-model="form.username" placeholder="请输入用户名" />
        </div>

        <div class="input-item">
          <input v-model="form.phone" placeholder="请输入手机号" />
        </div>

        <!-- 验证码行 -->
        <div class="code-row">
          <input v-model="form.code" placeholder="请输入验证码" />
          <button type="button" class="code-btn" @click="sendCode" :disabled="!canSend">
            {{ codeText }}
          </button>
        </div>

        <div class="input-item">
          <input type="password" v-model="form.password" placeholder="请输入新密码" />
        </div>

        <div class="btn-box">
          <button class="reset-btn" type="submit">重置密码</button>
        </div>
      </form>

      <div class="to-login" @click="goLogin">
        返回登录
      </div>
    </div>
  </div>
</template>

<script setup>
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080'
import { ref } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()
const form = ref({
  username: '',
  phone: '',
  password: '',
  code: ''
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
// 验证码相关
const codeText = ref('发送验证码')
const canSend = ref(true)
let realCode = '' // 真实的随机验证码

// 发送验证码（生成随机数）
const sendCode = () => {
  if (!form.value.username || !form.value.phone) {
    ElMessage.warning('请先输入用户名和手机号')
    return
  }
  // 生成 4 位随机验证码
  realCode = Math.floor(1000 + Math.random() * 9000).toString()
  ElMessage.success('验证码：' + realCode)

  // 按钮倒计时
  canSend.value = false
  codeText.value = '60s'
  let sec = 60
  const timer = setInterval(() => {
    sec--
    codeText.value = sec + 's'
    if (sec <= 0) {
      clearInterval(timer)
      canSend.value = true
      codeText.value = '发送验证码'
    }
  }, 1000)
}

// 重置密码
const doReset = async () => {
  if (!realCode) {
    ElMessage.warning('请先发送验证码')
    return
  }
  if (form.value.code !== realCode) {
    ElMessage.error('验证码错误！')
    return
  }

  try {
    await axios.post(`\${API_BASE}/user/resetPassword`, form.value)
    ElMessage.success('密码重置成功！')
    router.push('/login')
  } catch (err) {
    ElMessage.error('用户名或手机号错误')
  }
}

// 返回登录
const goLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.forget-container {
  width: 100vw;
  height: 100vh;
  background: linear-gradient(145deg, #e8f4ff 0%, #d4e8ff 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
}

/* 蓝天背景云朵 */
.forget-container::before {
  content: '☁️';
  position: absolute;
  top: 10%;
  left: -10%;
  font-size: 120px;
  opacity: 0.3;
  animation: floatCloud 25s linear infinite;
}

.forget-container::after {
  content: '☁️';
  position: absolute;
  bottom: 15%;
  right: -10%;
  font-size: 100px;
  opacity: 0.25;
  animation: floatCloud 30s linear infinite reverse;
}

@keyframes floatCloud {
  from { transform: translateX(0); }
  to { transform: translateX(120vw); }
}

/* 教学楼剪影 */
.school-silhouette {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 150px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 15px;
  z-index: 0;
}

.building {
  width: 80px;
  height: 120px;
  background: linear-gradient(180deg, #5a7fb5 0%, #3a5a8a 100%);
  border-radius: 8px 8px 0 0;
  animation: fadeInUp 1s ease-out;
}

.building::before {
  content: '■ ■ ■';
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(255,255,255,0.25);
  font-size: 10px;
  letter-spacing: 6px;
}

.building.short {
  height: 90px;
  width: 65px;
}

.building.tall {
  height: 150px;
  width: 70px;
}

.tree {
  width: 25px;
  height: 40px;
  background: #4a7a3a;
  border-radius: 20px 20px 0 0;
  position: relative;
}

.tree::before {
  content: '🌳';
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 24px;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.forget-box {
  width: 420px;
  padding: 40px 36px;
  background: rgba(255, 255, 255, 0.98);
  border-radius: 32px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(37, 99, 235, 0.15);
  animation: slideUp 0.5s ease-out;
  z-index: 10;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.logo-area {
  text-align: center;
  margin-bottom: 28px;
}

.logo-icon {
  font-size: 48px;
  margin-bottom: 8px;
  display: inline-block;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

.forget-box h2 {
  text-align: center;
  margin-bottom: 8px;
  font-size: 26px;
  font-weight: 700;
  background: linear-gradient(135deg, #2563eb, #1e40af);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.subtitle {
  text-align: center;
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 28px;
  letter-spacing: 1px;
}

/* 输入框 */
.input-item {
  margin-bottom: 18px;
}

.input-item input {
  width: 100%;
  height: 50px;
  padding: 0 18px;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  box-sizing: border-box;
  font-size: 14px;
  background: #f9fafb;
  transition: all 0.3s;
}

.input-item input:focus {
  outline: none;
  border-color: #2563eb;
  background: white;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

/* 验证码行 */
.code-row {
  display: flex;
  gap: 12px;
  margin-bottom: 18px;
}

.code-row input {
  flex: 1;
  height: 50px;
  padding: 0 18px;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  background: #f9fafb;
  font-size: 14px;
  transition: all 0.3s;
}

.code-row input:focus {
  outline: none;
  border-color: #2563eb;
  background: white;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.code-btn {
  width: 120px;
  height: 50px;
  background: linear-gradient(135deg, #2563eb, #1e40af);
  color: #fff;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s;
}

.code-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px -5px rgba(37, 99, 235, 0.4);
}

.code-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  opacity: 0.6;
}

/* 重置按钮 */
.reset-btn {
  width: 100%;
  height: 52px;
  background: linear-gradient(135deg, #2563eb, #1e40af);
  color: #fff;
  border: none;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 16px;
  position: relative;
  overflow: hidden;
}

.reset-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s;
}

.reset-btn:hover::before {
  left: 100%;
}

.reset-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(37, 99, 235, 0.4);
}

/* 登录链接 */
.to-login {
  text-align: center;
  margin-top: 24px;
  color: #2563eb;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.to-login:hover {
  color: #1e40af;
  transform: translateX(3px);
}

/* 底部标语 */
.campus-tagline {
  text-align: center;
  margin-top: 28px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: center;
  gap: 20px;
}

.campus-tagline span {
  font-size: 11px;
  color: #9ca3af;
}
</style>