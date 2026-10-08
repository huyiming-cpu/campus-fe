<template>
  <div class="about-page">
    <!-- 导航栏 -->
    <nav class="navbar">
      <div class="nav-container">
        <div class="logo" @click="goHome">
          <span class="logo-icon">🎓</span>
          <span class="logo-text">校园宝</span>
        </div>
        <div class="nav-menu">
          <a href="#" @click.prevent="goHome">首页</a>
          <a href="#" @click.prevent="goToNeed">需求广场</a>
          <a href="#" @click.prevent="goMyCenter">我的</a>
        </div>
      </div>
    </nav>

    <!-- 主体内容 -->
    <div class="about-container">
      <div class="about-header">
        <h1>🎓 校园宝</h1>
        <p>Campus Secondhand Systeam</p>
      </div>

      <!-- Tab 切换 -->
      <div class="tab-bar">
        <div class="tab" :class="{ active: currentTab === 'about' }" @click="currentTab = 'about'">
          📖 关于我们
        </div>
        <div class="tab" :class="{ active: currentTab === 'help' }" @click="currentTab = 'help'">
          ❓ 帮助中心
        </div>
        <div class="tab" :class="{ active: currentTab === 'contact' }" @click="currentTab = 'contact'">
          📞 联系我们
        </div>
        <div class="tab" :class="{ active: currentTab === 'links' }" @click="currentTab = 'links'">
          🔗 友情链接
        </div>
      </div>

      <!-- 关于我们 -->
      <div class="tab-content" v-if="currentTab === 'about'">
        <div class="content-card">
          <h2>关于校园宝</h2>
          <p>校园宝是一款专为在校师生打造的校园二手交易平台，致力于解决校园内二手物品流通难、交易信任缺失的问题。</p>
          
          <h3>🎯 平台使命</h3>
          <p>让闲置流动起来，让校园更美好。我们希望通过便捷的交易方式和可靠的信用体系，让每一件闲置物品都能找到新的主人。</p>
          
          <h3>✨ 平台特色</h3>
          <ul>
            <li><strong>🔒 实名认证</strong> - 学号+一卡通双重认证，确保身份真实</li>
            <li><strong>🤝 信用体系</strong> - 交易评价影响信用分，诚信有保障</li>
            <li><strong>💬 实时聊天</strong> - 买卖双方即时沟通，问题不过夜</li>
            <li><strong>🚚 双模式交易</strong> - 线上快递+线下自提，随心选择</li>
            <li><strong>🤖 AI智能客服</strong> - 7×24小时在线，解答您的疑问</li>
            <li><strong>📊 智能推荐</strong> - 基于您的喜好，推荐心仪商品</li>
          </ul>
          
          <h3>👥 团队成员</h3>
          <div class="team-grid">
            <div class="team-card">
              <div class="team-avatar">👨‍💻</div>
              <div class="team-name">组员A</div>
              <div class="team-desc">用户体系 + 个人中心+AI客服+智能推荐</div>
            </div>
            <div class="team-card">
              <div class="team-avatar">👩‍💻</div>
              <div class="team-name">组员B</div>
              <div class="team-desc">商品展示 + 首页 + 需求广场+特色栏目</div>
            </div>
            <div class="team-card">
              <div class="team-avatar">🧑‍💻</div>
              <div class="team-name">组员C</div>
              <div class="team-desc">交易流程 + 购物车 + 订单 + 聊天</div>
            </div>
          </div>
          
          <h3>🛠️ 技术栈</h3>
          <div class="tech-stack">
            <span class="tech-tag">Vue 3</span>
            <span class="tech-tag">Element Plus</span>
            <span class="tech-tag">Spring Boot</span>
            <span class="tech-tag">Spring Data JPA</span>
            <span class="tech-tag">MySQL</span>
            <span class="tech-tag">WebSocket</span>
            <span class="tech-tag">Axios</span>
            <span class="tech-tag">百度千帆大模型</span>
          </div>
        </div>
      </div>

      <!-- 帮助中心 -->
      <div class="tab-content" v-if="currentTab === 'help'">
        <div class="content-card">
          <h2>帮助中心</h2>
          
          <div class="help-section">
            <h3>📝 如何发布商品？</h3>
            <p>登录后进入「我的宝贝」页面，点击「发布商品」，填写商品名称、价格、类型、描述，上传图片，选择交易方式后点击发布即可。</p>
          </div>
          
          <div class="help-section">
            <h3>🛒 如何购买商品？</h3>
            <p>浏览首页或搜索商品，进入商品详情页点击「立即购买」或「加入购物车」，确认订单后选择支付方式完成支付。</p>
          </div>
          
          <div class="help-section">
            <h3>💰 如何充值？</h3>
            <p>进入「我的钱包」页面，点击「充值」，输入金额后确认即可完成充值。</p>
          </div>
          
          <div class="help-section">
            <h3>📦 如何发货？</h3>
            <p>卖家在「我的订单-我卖出的」中找到待发货订单，线上交易填写物流信息，线下交易设置自提点后确认发货。</p>
          </div>
          
          <div class="help-section">
            <h3>🔙 如何申请退款？</h3>
            <p>在订单详情页点击「申请退款」，填写原因后提交，等待卖家处理。卖家同意后金额将原路返回。</p>
          </div>
          
          <div class="help-section">
            <h3>⭐ 信用分怎么提高？</h3>
            <p>完成交易后给买家/卖家好评可以获得信用分，5星+3分，4星+2分，3星+1分。参与诚信问答小游戏也可获得信用分。</p>
          </div>
          
          <div class="help-section">
            <h3>🤖 AI客服怎么用？</h3>
            <p>点击页面右下角的AI客服悬浮图标，输入问题即可获得智能回答。</p>
          </div>
        </div>
      </div>

      <!-- 联系我们 -->
      <div class="tab-content" v-if="currentTab === 'contact'">
        <div class="content-card">
          <h2>联系我们</h2>
          
          <div class="contact-info">
            <div class="contact-item">
              <span class="contact-icon">📧</span>
              <div>
                <h4>邮箱</h4>
                <p>service@campusbao.com</p>
              </div>
            </div>
            <div class="contact-item">
              <span class="contact-icon">📞</span>
              <div>
                <h4>客服电话</h4>
                <p>400-888-1234（工作日 9:00-18:00）</p>
              </div>
            </div>
            <div class="contact-item">
              <span class="contact-icon">💬</span>
              <div>
                <h4>在线客服</h4>
                <p>点击右下角AI客服图标，或添加微信 campus_kf</p>
              </div>
            </div>
            <div class="contact-item">
              <span class="contact-icon">📍</span>
              <div>
                <h4>地址</h4>
                <p>四川省成都市市西南交通大学计算机与人工智能学院</p>
              </div>
            </div>
          </div>
          
          <div class="feedback">
            <h3>意见反馈</h3>
            <p>如果您在使用过程中遇到任何问题，或有任何建议，欢迎通过以下方式联系我们：</p>
            <ul>
              <li>邮箱：feedback@campusbao.com</li>
              <li>电话：028-12345678</li>
              <li>或在AI客服中直接反馈</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- 友情链接 -->
      <div class="tab-content" v-if="currentTab === 'links'">
        <div class="content-card">
          <h2>友情链接</h2>
          
          <div class="links-grid">
            <a href="#" class="link-card" @click.prevent>
              <span>🏫</span>
              <div>
                <h4>西南交通大学官网</h4>
                <p>学校官方网站</p>
              </div>
            </a>
            <a href="#" class="link-card" @click.prevent>
              <span>📚</span>
              <div>
                <h4>校图书馆</h4>
                <p>图书借阅系统</p>
              </div>
            </a>
            <a href="#" class="link-card" @click.prevent>
              <span>💼</span>
              <div>
                <h4>就业指导中心</h4>
                <p>招聘信息发布</p>
              </div>
            </a>
            <a href="#" class="link-card" @click.prevent>
              <span>🎓</span>
              <div>
                <h4>学工部</h4>
                <p>学生事务管理</p>
              </div>
            </a>
            <a href="#" class="link-card" @click.prevent>
              <span>🍽️</span>
              <div>
                <h4>校园卡服务中心</h4>
                <p>一卡通服务</p>
              </div>
            </a>
            <a href="#" class="link-card" @click.prevent>
              <span>🚲</span>
              <div>
                <h4>共享单车</h4>
                <p>校园出行</p>
              </div>
            </a>
          </div>
          
          <div class="partner">
            <h3>合作伙伴</h3>
            <div class="partner-list">
              <span>西南交通大学计算机与人工智能学院</span>
             
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 页脚 -->
    <footer class="footer">
      <div class="footer-content">
        <div class="footer-logo">
          <span>🎓</span>
          <span>校园宝</span>
        </div>
        <div class="footer-links">
          <span @click="currentTab = 'about'">关于我们</span>
          <span @click="currentTab = 'help'">帮助中心</span>
          <span @click="currentTab = 'contact'">联系我们</span>
          <span @click="currentTab = 'links'">友情链接</span>
        </div>
        <div class="footer-copyright">
          © 2026 校园宝 | 校园二手交易平台
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const currentTab = ref('about')

// 根据URL参数设置Tab
onMounted(() => {
  const tab = route.query.tab
  if (tab && ['about', 'help', 'contact', 'links'].includes(tab)) {
    currentTab.value = tab
  }
})

const goHome = () => {
  router.push('/productHome')
}

const goToNeed = () => {
  router.push('/need-square')
}

const goMyCenter = () => {
  router.push('/myCenter')
}
</script>

<style scoped>
.about-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f0f4ff 0%, #ffffff 100%);
}

/* 导航栏 */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.05);
  z-index: 1000;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 5%;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.logo-icon {
  font-size: 28px;
}

.logo-text {
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, #2563eb, #1e40af);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.nav-menu {
  display: flex;
  gap: 32px;
}

.nav-menu a {
  text-decoration: none;
  color: #4b5563;
  font-weight: 500;
  transition: color 0.2s;
  cursor: pointer;
}

.nav-menu a:hover {
  color: #2563eb;
}

/* 主体内容 */
.about-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 100px 20px 60px;
}

.about-header {
  text-align: center;
  margin-bottom: 40px;
}

.about-header h1 {
  font-size: 42px;
  margin-bottom: 10px;
  color: #1f2937;
}

.about-header p {
  font-size: 16px;
  color: #6b7280;
}

/* Tab栏 */
.tab-bar {
  display: flex;
  gap: 8px;
  background: white;
  padding: 6px;
  border-radius: 50px;
  margin-bottom: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
}

.tab {
  flex: 1;
  text-align: center;
  padding: 12px 20px;
  border-radius: 40px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  color: #6b7280;
  transition: all 0.2s;
}

.tab.active {
  background: linear-gradient(135deg, #2563eb, #1e40af);
  color: white;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.2);
}

/* 内容卡片 */
.content-card {
  background: white;
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
}

.content-card h2 {
  font-size: 28px;
  margin-bottom: 20px;
  color: #1f2937;
}

.content-card h3 {
  font-size: 20px;
  margin: 24px 0 12px;
  color: #1f2937;
}

.content-card p {
  color: #4b5563;
  line-height: 1.6;
}

.content-card ul {
  margin: 0;
  padding-left: 20px;
}

.content-card li {
  color: #4b5563;
  margin: 8px 0;
  line-height: 1.5;
}

/* 团队展示 */
.team-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 16px;
}

.team-card {
  background: #f8fafc;
  border-radius: 16px;
  padding: 20px;
  text-align: center;
}

.team-avatar {
  font-size: 48px;
  margin-bottom: 10px;
}

.team-name {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.team-desc {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

/* 技术栈 */
.tech-stack {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tech-tag {
  background: #e5e7eb;
  padding: 6px 14px;
  border-radius: 30px;
  font-size: 13px;
  color: #4b5563;
}

/* 帮助中心 */
.help-section {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.help-section:last-child {
  border-bottom: none;
}

/* 联系我们 */
.contact-info {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 32px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.contact-icon {
  font-size: 28px;
}

.contact-item h4 {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.contact-item p {
  color: #6b7280;
}

.feedback ul {
  margin-top: 8px;
}

/* 友情链接 */
.links-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 32px;
}

.link-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 16px;
  text-decoration: none;
  transition: all 0.2s;
}

.link-card:hover {
  background: #eff6ff;
  transform: translateX(5px);
}

.link-card span {
  font-size: 28px;
}

.link-card h4 {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.link-card p {
  font-size: 12px;
  color: #6b7280;
}

.partner-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 12px;
}

.partner-list span {
  background: #f8fafc;
  padding: 8px 16px;
  border-radius: 30px;
  font-size: 13px;
  color: #4b5563;
}

/* 页脚 */
.footer {
  background: #1f2937;
  padding: 40px 20px;
  color: #9ca3af;
  margin-top: 60px;
}

.footer-content {
  text-align: center;
  max-width: 1000px;
  margin: 0 auto;
}

.footer-logo {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 16px;
  color: white;
}

.footer-logo span:first-child {
  font-size: 24px;
  margin-right: 8px;
}

.footer-links {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.footer-links span {
  cursor: pointer;
  font-size: 14px;
  transition: color 0.2s;
}

.footer-links span:hover {
  color: white;
}

.footer-copyright {
  font-size: 12px;
}

/* 响应式 */
@media (max-width: 768px) {
  .team-grid {
    grid-template-columns: 1fr;
  }
  
  .links-grid {
    grid-template-columns: 1fr;
  }
  
  .tab-bar {
    flex-wrap: wrap;
    border-radius: 24px;
  }
  
  .tab {
    flex: auto;
    padding: 8px 16px;
  }
}
</style>