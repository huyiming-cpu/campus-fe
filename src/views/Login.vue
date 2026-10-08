<template>
  <div class="login-container">
    <!-- 蓝天背景 -->
    <div class="sky-bg">
      <div class="cloud cloud-1">☁️</div>
      <div class="cloud cloud-2">☁️</div>
      <div class="cloud cloud-3">☁️</div>
    </div>

    <!-- 教学楼剪影 -->
    <div class="school-silhouette">
      <div class="building"></div>
      <div class="building short"></div>
      <div class="building tall"></div>
      <div class="tree"></div>
      <div class="tree tree2"></div>
    </div>

    <!-- 登录卡片 -->
    <div class="login-card">
      <div class="card-header">
        <div class="logo">
          <span class="logo-icon">🎓</span>
          <span class="logo-text">校园宝</span>
        </div>
        <p class="subtitle">Campus Bao</p>
      </div>

      <form @submit.prevent="handleLogin">
        <div class="input-group">
          <div class="input-field">
            <span class="field-icon">👤</span>
            <input 
              type="text" 
              v-model="loginForm.username" 
              placeholder="用户名 / 学号"
            />
          </div>
          <div class="input-field">
            <span class="field-icon">🔐</span>
            <input 
              type="password" 
              v-model="loginForm.password" 
              placeholder="密码"
            />
          </div>
        </div>

        <button class="login-btn" type="submit">
          <span>登录校园宝</span>
          <span class="btn-arrow">→</span>
        </button>

        <div class="card-footer">
          <span class="link" @click="goRegister">📝 立即注册</span>
          <span class="link" @click="goForget">❓ 忘记密码</span>
        </div>
      </form>

      <div class="campus-tagline">
        <span>📚 让闲置流动起来</span>
        <span>💚 绿色校园，循环共享</span>
      </div>
    </div>

  
  </div>
</template>

<script setup>
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080'
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()

const loginForm = ref({
  username: '',
  password: ''
})

const getStarStyle = () => {
  const size = Math.random() * 2 + 1
  const left = Math.random() * 100
  const top = Math.random() * 60
  const duration = Math.random() * 3 + 2
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

const handleLogin = async () => {
  try {
    const res = await axios.post(`\${API_BASE}/user/login`, loginForm.value)

    if (!res || !res.data) {
      ElMessage.error("服务器异常")
      return
    }

    if (res.data.code === 200) {
      ElMessage.success('登录成功')

      // 先存用户信息
      sessionStorage.setItem("loginUser", JSON.stringify(res.data.data))
      sessionStorage.setItem("userId", res.data.data.id)
      sessionStorage.setItem("university", res.data.data.university);
      sessionStorage.setItem("username", res.data.data.username);
      sessionStorage.setItem("avatar", res.data.data.avatar);
      sessionStorage.setItem("token", res.data.data.token);

      // 用后端返回的用户名判断是否是管理员（而不是表单输入的密码）
      if (res.data.data.username === 'admin') {
        sessionStorage.setItem("isAdmin", "true")
        router.push('/admin')
      } else {
        router.push('/productHome')
      }
    } else {
      ElMessage.error(res.data.msg || "登录失败")
    }

  } catch (err) {
    console.error("登录异常", err)
    ElMessage.error("账号或密码错误")
  }
}

const goRegister = () => {
  router.push('/register')
}

const goForget = () => {
  router.push('/forget')
}
</script>

<style scoped>
.login-container {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
  background: linear-gradient(145deg, #e8f4ff 0%, #d4e8ff 100%);
}

/* ========== 蓝天背景 ========== */
.sky-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.cloud {
  position: absolute;
  font-size: 80px;
  opacity: 0.5;
  animation: floatCloud 20s linear infinite;
}

.cloud-1 {
  top: 10%;
  left: -10%;
  animation-duration: 25s;
}

.cloud-2 {
  top: 20%;
  right: -10%;
  left: auto;
  animation-duration: 30s;
  animation-direction: reverse;
}

.cloud-3 {
  top: 60%;
  left: -5%;
  font-size: 60px;
  animation-duration: 35s;
}

@keyframes floatCloud {
  from { transform: translateX(0); }
  to { transform: translateX(120vw); }
}

/* ========== 教学楼剪影 ========== */
.school-silhouette {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 200px;
  z-index: 1;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 15px;
  padding: 0 20px;
}

.building {
  width: 100px;
  height: 140px;
  background: linear-gradient(180deg, #5a7fb5 0%, #3a5a8a 100%);
  border-radius: 8px 8px 0 0;
  position: relative;
  animation: fadeInUp 1s ease-out;
}

.building::before {
  content: '■ ■ ■';
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(255,255,255,0.3);
  font-size: 12px;
  letter-spacing: 8px;
}

.building.short {
  height: 100px;
  width: 80px;
}

.building.tall {
  height: 170px;
  width: 90px;
}

.tree {
  width: 30px;
  height: 50px;
  background: #4a7a3a;
  border-radius: 20px 20px 0 0;
  position: relative;
  margin-bottom: 0;
}

.tree::before {
  content: '🌳';
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 28px;
}

.tree2 {
  margin-left: 10px;
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

/* ========== 登录卡片 ========== */
.login-card {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 460px;
  background: rgba(255, 255, 255, 0.98);
  border-radius: 32px;
  padding: 40px 36px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  z-index: 20;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(102, 126, 234, 0.2);
  animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translate(-50%, -40%);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%);
  }
}

/* 卡片头部 */
.card-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 8px;
}

.logo-icon {
  font-size: 36px;
}

.logo-text {
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, #2563eb, #1e40af);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.subtitle {
  font-size: 12px;
  color: #6b7280;
  letter-spacing: 1px;
}

/* 输入框 */
.input-group {
  margin-bottom: 28px;
}

.input-field {
  display: flex;
  align-items: center;
  background: #f3f4f6;
  border-radius: 16px;
  padding: 0 16px;
  margin-bottom: 16px;
  transition: all 0.3s;
  border: 1px solid transparent;
}

.input-field:focus-within {
  background: white;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.field-icon {
  font-size: 18px;
  color: #9ca3af;
  margin-right: 12px;
  transition: color 0.3s;
}

.input-field:focus-within .field-icon {
  color: #2563eb;
}

.input-field input {
  flex: 1;
  height: 52px;
  background: transparent;
  border: none;
  outline: none;
  font-size: 15px;
}

.input-field input::placeholder {
  color: #cbd5e1;
}

/* 登录按钮 */
.login-btn {
  width: 100%;
  height: 52px;
  background: linear-gradient(135deg, #2563eb, #1e40af);
  border: none;
  border-radius: 16px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 24px;
  position: relative;
  overflow: hidden;
}

.login-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s;
}

.login-btn:hover::before {
  left: 100%;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(37, 99, 235, 0.4);
}

.btn-arrow {
  transition: transform 0.3s;
}

.login-btn:hover .btn-arrow {
  transform: translateX(6px);
}

/* 卡片底部 */
.card-footer {
  display: flex;
  justify-content: space-between;
  margin-bottom: 28px;
}

.link {
  font-size: 14px;
  color: #2563eb;
  cursor: pointer;
  transition: all 0.2s;
}

.link:hover {
  color: #1e40af;
  transform: translateX(3px);
}

.link:first-child:hover {
  transform: translateX(-3px);
}

/* 校园标语 */
.campus-tagline {
  display: flex;
  justify-content: center;
  gap: 24px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.campus-tagline span {
  font-size: 12px;
  color: #6b7280;
}

/* ========== 星星背景 ========== */
.star-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 60%;
  overflow: hidden;
  z-index: 0;
  pointer-events: none;
}

.star {
  position: absolute;
  background: #fbbf24;
  border-radius: 50%;
  animation: twinkle 2s infinite alternate;
  opacity: 0.6;
}

@keyframes twinkle {
  0% {
    opacity: 0.2;
    transform: scale(1);
  }
  100% {
    opacity: 1;
    transform: scale(1.2);
  }
}
</style>