<template>
  <router-view />

  <div class="ai-float-btn" @click="goToAIChat">
    <span class="icon">💬</span>
    <span class="label">AI客服</span>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()

const goToAIChat = () => {
  router.push('/ai-chat')
}
</script>

<style>

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.ai-float-btn {
  position: fixed;
  bottom: 70px;
  right: 20px;
  background: #409eff;
  color: #fff;
  padding: 10px 16px;
  border-radius: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s ease;
}
.ai-float-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}
.icon {
  font-size: 18px;
}
.label {
  font-size: 14px;
  font-weight: 500;
}


</style>