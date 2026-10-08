<template>
  <div class="detail-page">
    
    <div class="back-bar">
      <button @click="goBack">← 返回</button>
    </div>

    <div class="detail-container" v-if="product.id">
      <div class="left">
        <img 
          :src="`${API_BASE}/products/${product.image}`" 
          alt="商品图片" 
          class="big-img"
          @error="handleImageError"
        />
      </div>

      <div class="right">
        <h2 class="name">
          {{ product.name }}
          <span v-if="product.hot === 1" class="hot-tag">🔥 热门</span>
        </h2>
        <p class="price">¥ {{ product.price }}</p>
        <p class="type">📂 分类：{{ product.type }}</p>
        <p class="status">📦 状态：{{ product.status === 0 ? "出售中" : "已售出" }}</p>
        <p class="desc">📝 {{ product.info }}</p>

        <div class="seller" v-if="product.user" @click="goSellerHome">
          <img 
            :src="`${API_BASE}/avatar/${product.user.avatar}`" 
            class="avatar" 
            @error="handleAvatarError"
          />
          <div class="seller-info">
            <span class="seller-name">{{ product.user.username }}</span>
            <span class="seller-credit">信用：{{ product.user.creditLevel || '良好' }}</span>
          </div>
        </div>

        <div class="btn-group">
          <div class="left-btn">
            <button class="collect-btn" @click="toggleCollect">
              {{ isCollect ? "✅ 已收藏" : "⭐ 收藏" }}
            </button>
          </div>
          <div class="right-btn">
            <button class="cart-btn" @click="addCart">🛒 加入购物车</button>
            <button class="buy-btn" @click="goToBuy">💰 立即购买</button>
            <button class="chat-btn" @click="goToChat">💬 聊一聊</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 更多好物推荐 -->
    <div class="recommend-section" v-if="randomList.length > 0">
      <h3 class="recommend-title">🔥 更多好物推荐</h3>
      <div class="recommend-list">
        <div 
          class="recommend-card" 
          v-for="item in randomList" 
          :key="item.id"
          @click="goToDetail(item.id)"
        >
          <img 
            :src="`${API_BASE}/products/${item.image}`" 
            class="recommend-img"
            @error="handleRecommendImageError"
          />
          <div class="recommend-name">{{ item.name }}</div>
          <div class="recommend-price">¥{{ item.price }}</div>
          <div class="recommend-seller">
            <img 
              :src="`${API_BASE}/avatar/${item.user?.avatar || 'default.jpg'}`" 
              class="recommend-avatar"
              @error="handleAvatarError"
            />
            <span>{{ item.user?.username || '匿名' }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!product.id" class="loading">加载中...</div>
  </div>
</template>

<script setup>
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080'
import { ref, onMounted } from "vue";
import axios from "axios";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const productId = route.params.id;
const product = ref({});
const userId = sessionStorage.getItem("userId");
const isCollect = ref(false);
const randomList = ref([]);

document.onkeydown = (e) => {
  if (e.key === 'Escape') {
    window.history.back()
    setTimeout(() => window.location.reload(), 100)
  }
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
const goBack = () => {
  window.history.back()
  setTimeout(() => window.location.reload(), 100)
}

const goToDetail = (id) => {
  router.push(`/product/detail/${id}`).then(() => {
    window.location.reload()
  })
}

//更多好物推荐
const getRandomRecommend = async () => {
  try {
    const res = await axios.get(`${API_BASE}/product/recommend/byPurchase`, {
      params: { currentProductId: productId },
      withCredentials: true
    });
    randomList.value = res.data.data || [];
  } catch (err) {
    console.error("获取推荐失败", err);
    // 降级：使用原来的随机推荐
    const fallbackRes = await axios.get(`${API_BASE}/product/list`);
    let all = fallbackRes.data.data || [];
    all = all.filter(item => item.id !== parseInt(productId) && item.status === 0);
    for (let i = all.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [all[i], all[j]] = [all[j], all[i]];
    }
    randomList.value = all.slice(0, 10);
  }
};

const handleImageError = (e) => {
  e.target.src = `${API_BASE}/products/default.jpg`;
};
const handleAvatarError = (e) => {
  e.target.src = `${API_BASE}/avatar/default.jpg`;
};
const handleRecommendImageError = (e) => {
  e.target.src = `${API_BASE}/products/default.jpg`;
};

const getDetail = async () => {
  try {
    const res = await axios.get(`${API_BASE}/product/detail/${productId}`);
    if (res.data?.data) {
      product.value = res.data.data;
      checkCollectStatus();
      getRandomRecommend();
    } else {
      alert('商品不存在');
    }
  } catch (e) {
    console.error(e);
    alert("加载失败");
  }
};

const addCart = async () => {
  if (!userId) {
    alert("请先登录");
    return;
  }
  try {
    const res = await axios.post(`${API_BASE}/product/cart/add`, null, {
      params: { userId, productId },
    });
    alert(res.data.msg);  
  } catch (e) {
    console.error('加入购物车失败:', e);
    alert("加入购物车失败");
  }
};

const checkCollectStatus = async () => {
  if (!userId || !productId) return;
  try {
    const res = await axios.get(`${API_BASE}/product/collect/my`, {
      params: { userId }
    });
    const collectList = res.data.data || [];
    const found = collectList.some(item => item.product.id == productId);
    isCollect.value = found;
  } catch (err) {
    console.error('查询收藏状态失败', err);
    isCollect.value = false;
  }
};

const toggleCollect = async () => {
  if (!userId) {
    alert("请先登录");
    return;
  }
  try {
    const res = await axios.post(`${API_BASE}/product/collect/toggle`, null, {
      params: { userId, productId },
    });
    isCollect.value = !isCollect.value;
    
  } catch (e) {
    console.error('操作失败:', e);
    alert(e.response?.data?.msg || "操作失败");
  }
};

const goSellerHome = () => {
  const uid = product.value.user?.id
  if (uid) router.push(`/seller/${uid}`)
}

const goToChat = () => {
  if (!product.value.user || !product.value.user.id) {
    alert("卖家信息不存在");
    return;
  }
  router.push({
    path: '/chat',
    query: {
      pid: product.value.id,
      pname: product.value.name,
      pimage: product.value.image,
      sellerId: product.value.user.id
    }
  })
}

const goToBuy = () => {
  if (!userId) {
    alert("请先登录");
    return;
  }
  if (!product.value.user || !product.value.user.id) {
    alert("卖家信息不存在");
    return;
  }
  
  router.push({
    path: '/create-order',
    query: {
      productId: product.value.id,
      productName: product.value.name,
      productPrice: product.value.price,
      productImage: product.value.image,
      sellerId: product.value.user.id,
      sellerName: product.value.user.username
    }
  })
}

onMounted(() => {
  getDetail();
});
</script>

<style scoped>
.detail-page {
  width: 100vw;
  min-height: 100vh;
  margin: 0;
  padding: 20px;
  box-sizing: border-box;
  background: linear-gradient(145deg, #e8f4ff 0%, #d4e8ff 100%);
  background-attachment: fixed;
}

.back-bar {
  margin-bottom: 24px;
}

.back-bar button {
  padding: 8px 20px;
  background: rgba(37, 99, 235, 0.1);
  color: #2563eb;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.back-bar button:hover {
  background: rgba(37, 99, 235, 0.2);
  transform: translateX(-2px);
}

.detail-container {
  display: flex;
  gap: 50px;
  padding-bottom: 40px;
  border-bottom: 1px solid rgba(37, 99, 235, 0.1);
}

.left {
  width: 400px;
}

.big-img {
  width: 100%;
  border-radius: 20px;
  object-fit: cover;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.right {
  flex: 1;
  color: #02060c;
}

.name {
  font-size: 28px;
  margin-bottom: 12px;
  font-weight: 700;
  color: #1f2937;
}

.hot-tag {
  color: #f97316;
  font-size: 14px;
  font-weight: bold;
  margin-left: 12px;
  background: #fef3c7;
  padding: 4px 12px;
  border-radius: 30px;
}

.price {
  font-size: 32px;
  color: #2563eb;
  font-weight: bold;
  margin: 15px 0;
}

.type, .status, .desc {
  font-size: 15px;
  margin: 10px 0;
  opacity: 0.8;
  line-height: 1.5;
  color: #4b5563;
}

.seller {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 20px 0;
  padding: 12px 18px;
  background: white;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid rgba(37, 99, 235, 0.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

.seller:hover {
  background: #f8fafc;
  transform: translateX(5px);
  border-color: rgba(37, 99, 235, 0.2);
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.seller-info {
  display: flex;
  flex-direction: column;
}

.seller-name {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.seller-credit {
  font-size: 12px;
  color: #6b7280;
}

.btn-group {
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
}

.left-btn, .right-btn {
  display: flex;
  gap: 12px;
}

button {
  padding: 12px 20px;
  border: none;
  border-radius: 40px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s;
}

button:hover {
  transform: translateY(-2px);
}

.collect-btn {
  background: white;
  color: #2563eb;
  border: 1px solid rgba(37, 99, 235, 0.3);
}

.collect-btn:hover {
  background: #eff6ff;
  border-color: #2563eb;
}

.cart-btn {
  background: white;
  color: #2563eb;
  border: 1px solid rgba(37, 99, 235, 0.3);
}

.cart-btn:hover {
  background: #eff6ff;
  border-color: #2563eb;
}

.buy-btn {
  background: linear-gradient(135deg, #2563eb, #1e40af);
  color: white;
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
}

.chat-btn {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
}

/* 推荐区域 */
.recommend-section {
  margin-top: 50px;
}

.recommend-title {
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 25px;
  padding-left: 15px;
  border-left: 4px solid #2563eb;
  color: #1f2937;
}

.recommend-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
}

.recommend-card {
  width: 200px;
  background: white;
  border-radius: 16px;
  padding: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid rgba(37, 99, 235, 0.08);
}

.recommend-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.1);
}

.recommend-img {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 12px;
}

.recommend-name {
  margin-top: 10px;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #1f2937;
}

.recommend-price {
  color: #2563eb;
  font-size: 16px;
  font-weight: bold;
  margin-top: 5px;
}

.recommend-seller {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #6b7280;
}

.recommend-avatar {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  object-fit: cover;
}

.loading {
  text-align: center;
  padding: 50px;
  font-size: 18px;
  color: #6b7280;
}
</style>