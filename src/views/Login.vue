<template>
  <div class="login-container">
    <div class="login-left">
      <div class="brand-section">
        <div class="brand-logo">
          <el-icon :size="48"><Box /></el-icon>
        </div>
        <h1 class="brand-title">跨境电商ERP</h1>
        <p class="brand-subtitle">Cross-border E-commerce ERP System</p>
        <div class="brand-features">
          <div class="feature-item">
            <el-icon><Goods /></el-icon>
            <span>产品管理</span>
          </div>
          <div class="feature-item">
            <el-icon><PriceTag /></el-icon>
            <span>智能定价</span>
          </div>
          <div class="feature-item">
            <el-icon><TrendCharts /></el-icon>
            <span>数据分析</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="login-right">
      <div class="login-box">
        <div class="login-header">
          <h2>欢迎登录</h2>
          <p>请输入您的账号信息</p>
        </div>

        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="rules"
          class="login-form"
          @submit.prevent="handleLogin"
        >
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              placeholder="用户名"
              size="large"
              :prefix-icon="User"
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="密码"
              size="large"
              :prefix-icon="Lock"
              show-password
              @keyup.enter="handleLogin"
            />
          </el-form-item>

          <el-form-item>
            <el-button 
              type="primary" 
              class="login-button" 
              :loading="loading"
              @click="handleLogin"
            >
              {{ loading ? '登录中...' : '登 录' }}
            </el-button>
          </el-form-item>
        </el-form>

        <div class="login-footer">
          <p class="default-account">
            默认账号：admin / 密码：任意
          </p>
        </div>
      </div>
      
      <div class="copyright">
        <p>© 2026 跨境电商ERP系统 版权所有</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, Lock, Box, Goods, PriceTag, TrendCharts } from '@element-plus/icons-vue'
import { login } from '@/api/auth'

const router = useRouter()
const loginFormRef = ref(null)
const loading = ref(false)

const loginForm = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return

  await loginFormRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true

    try {
      const res = await login({
        username: loginForm.username,
        password: loginForm.password
      })
      
      const data = res.data
      const token = data.token
      const user = data.user || data
      
      localStorage.setItem('token', token)
      localStorage.setItem('username', user.username || loginForm.username)
      localStorage.setItem('userInfo', JSON.stringify(user))

      ElMessage.success('登录成功，欢迎回来！')
      router.push('/')
    } catch (error) {
      // 错误已在拦截器中处理
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
.login-container {
  width: 100%;
  height: 100vh;
  display: flex;
  background: #f5f7fa;
}

.login-left {
  width: 50%;
  background: linear-gradient(135deg, #1a1f36 0%, #2d3561 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.login-left::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 50%);
  animation: pulse 15s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.brand-section {
  text-align: center;
  color: #fff;
  position: relative;
  z-index: 1;
}

.brand-logo {
  width: 80px;
  height: 80px;
  background: rgba(255,255,255,0.1);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  backdrop-filter: blur(10px);
}

.brand-title {
  font-size: 32px;
  font-weight: 600;
  margin-bottom: 8px;
  letter-spacing: 2px;
}

.brand-subtitle {
  font-size: 14px;
  color: rgba(255,255,255,0.7);
  margin-bottom: 48px;
  letter-spacing: 1px;
}

.brand-features {
  display: flex;
  gap: 32px;
  justify-content: center;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: rgba(255,255,255,0.8);
}

.feature-item .el-icon {
  font-size: 24px;
}

.feature-item span {
  font-size: 13px;
}

.login-right {
  width: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.login-box {
  width: 100%;
  max-width: 400px;
  background: #fff;
  border-radius: 12px;
  padding: 48px 40px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-header h2 {
  font-size: 24px;
  font-weight: 600;
  color: #1a1f36;
  margin-bottom: 8px;
}

.login-header p {
  font-size: 14px;
  color: #909399;
}

.login-form {
  margin-top: 24px;
}

.login-form :deep(.el-form-item) {
  margin-bottom: 20px;
}

.login-form :deep(.el-input__wrapper) {
  padding: 4px 16px;
  border-radius: 8px;
}

.login-form :deep(.el-input__inner) {
  height: 44px;
}

.login-button {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 8px;
  background: #1a1f36;
  border-color: #1a1f36;
}

.login-button:hover {
  background: #2d3561;
  border-color: #2d3561;
}

.login-footer {
  margin-top: 24px;
  text-align: center;
}

.default-account {
  font-size: 13px;
  color: #909399;
  background: #f5f7fa;
  padding: 12px 16px;
  border-radius: 8px;
}

.copyright {
  margin-top: 32px;
  text-align: center;
}

.copyright p {
  font-size: 12px;
  color: #c0c4cc;
}

@media (max-width: 768px) {
  .login-container {
    flex-direction: column;
  }
  
  .login-left {
    width: 100%;
    height: 40vh;
    padding: 40px 20px;
  }
  
  .login-right {
    width: 100%;
    height: 60vh;
    padding: 20px;
  }
  
  .brand-title {
    font-size: 24px;
  }
  
  .brand-features {
    gap: 20px;
  }
  
  .login-box {
    padding: 32px 24px;
  }
}
</style>
