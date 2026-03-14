<template>
  <div class="header">
    <div class="header-left">
      <el-icon 
        class="collapse-btn" 
        :size="20" 
        @click="toggleCollapse"
      >
        <Fold v-if="!isCollapsed" />
        <Expand v-else />
      </el-icon>
      <el-breadcrumb separator="/">
        <el-breadcrumb-item v-for="item in breadcrumbs" :key="item.path">
          {{ item.title }}
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    
    <div class="header-right">
      <el-dropdown @command="handleCommand">
        <div class="user-info">
          <div class="avatar">
            {{ username.charAt(0).toUpperCase() }}
          </div>
          <span class="username">{{ username }}</span>
          <el-icon><ArrowDown /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">
              <el-icon><User /></el-icon>
              个人中心
            </el-dropdown-item>
            <el-dropdown-item command="settings">
              <el-icon><Setting /></el-icon>
              系统设置
            </el-dropdown-item>
            <el-dropdown-item divided command="logout">
              <el-icon><SwitchButton /></el-icon>
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Fold, 
  Expand, 
  ArrowDown, 
  User, 
  Setting, 
  SwitchButton 
} from '@element-plus/icons-vue'

const props = defineProps({
  isCollapsed: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['toggle-collapse'])

const route = useRoute()
const router = useRouter()

const username = computed(() => {
  const storedUsername = localStorage.getItem('username')
  if (storedUsername && storedUsername !== 'undefined' && storedUsername !== 'null') {
    return storedUsername
  }
  try {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
    return userInfo.username || userInfo.nickname || '用户'
  } catch {
    return '用户'
  }
})

const breadcrumbs = computed(() => {
  const matched = route.matched.filter(item => item.meta && item.meta.title)
  const crumbs = [{ path: '/', title: '首页' }]
  
  if (route.path !== '/') {
    matched.forEach(item => {
      crumbs.push({
        path: item.path,
        title: item.meta.title
      })
    })
  }
  
  return crumbs
})

const toggleCollapse = () => {
  emit('toggle-collapse')
}

const handleCommand = (command) => {
  switch (command) {
    case 'profile':
      ElMessage.info('个人中心功能开发中')
      break
    case 'settings':
      router.push('/settings')
      break
    case 'logout':
      handleLogout()
      break
  }
}

const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    localStorage.removeItem('userInfo')
    ElMessage.success('已退出登录')
    router.push('/login')
  }).catch(() => {})
}
</script>

<style scoped>
.header {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background-color: #ffffff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.collapse-btn {
  cursor: pointer;
  color: #606266;
  transition: all 0.3s;
  padding: 8px;
  border-radius: 8px;
}

.collapse-btn:hover {
  color: #1a1f36;
  background-color: #f5f7fa;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 8px;
  transition: all 0.3s;
}

.user-info:hover {
  background-color: #f5f7fa;
}

.avatar {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #1a1f36 0%, #2d3561 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
}

.username {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

:deep(.el-dropdown-menu__item) {
  padding: 10px 20px;
}

:deep(.el-dropdown-menu__item .el-icon) {
  margin-right: 8px;
}
</style>
