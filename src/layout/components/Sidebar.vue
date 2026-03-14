<template>
  <div class="sidebar" :class="{ collapsed: isCollapsed }">
    <div class="logo">
      <div class="logo-icon">
        <el-icon :size="24"><Box /></el-icon>
      </div>
      <span v-show="!isCollapsed" class="logo-text">跨境电商ERP</span>
    </div>
    
    <el-scrollbar class="menu-scrollbar">
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapsed"
        :collapse-transition="false"
        background-color="transparent"
        text-color="rgba(255,255,255,0.7)"
        active-text-color="#ffffff"
        router
      >
        <el-menu-item index="/dashboard">
          <el-icon><DataBoard /></el-icon>
          <template #title>首页仪表盘</template>
        </el-menu-item>

        <el-menu-item index="/products/list">
          <el-icon><Goods /></el-icon>
          <template #title>产品管理</template>
        </el-menu-item>

        <el-menu-item index="/pricing">
          <el-icon><PriceTag /></el-icon>
          <template #title>报价管理</template>
        </el-menu-item>

        <el-menu-item index="/mapping">
          <el-icon><Connection /></el-icon>
          <template #title>配对管理</template>
        </el-menu-item>

        <el-menu-item index="/statistics">
          <el-icon><TrendCharts /></el-icon>
          <template #title>数据统计</template>
        </el-menu-item>

        <el-menu-item index="/chat">
          <el-icon><ChatDotRound /></el-icon>
          <template #title>智能客服</template>
        </el-menu-item>

        <el-sub-menu index="/settings">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>系统设置</span>
          </template>
          <el-menu-item index="/settings/users">
            <el-icon><User /></el-icon>
            <template #title>用户管理</template>
          </el-menu-item>
          <el-menu-item index="/settings/channels">
            <el-icon><Guide /></el-icon>
            <template #title>渠道管理</template>
          </el-menu-item>
          <el-menu-item index="/settings/categories">
            <el-icon><Menu /></el-icon>
            <template #title>分类管理</template>
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { 
  Box, 
  DataBoard, 
  Goods, 
  PriceTag, 
  Connection, 
  TrendCharts, 
  Setting,
  User,
  Guide,
  Menu,
  ChatDotRound
} from '@element-plus/icons-vue'

const props = defineProps({
  isCollapsed: {
    type: Boolean,
    default: false
  }
})

const route = useRoute()

const activeMenu = computed(() => {
  return route.path
})
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 220px;
  height: 100vh;
  background: linear-gradient(180deg, #1a1f36 0%, #2d3561 100%);
  transition: width 0.3s;
  overflow: hidden;
  z-index: 1001;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
}

.sidebar.collapsed {
  width: 64px;
}

.logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 0 16px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.logo-icon {
  width: 36px;
  height: 36px;
  background: rgba(255,255,255,0.1);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}

.logo-text {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  white-space: nowrap;
  letter-spacing: 1px;
}

.menu-scrollbar {
  height: calc(100vh - 64px);
}

.el-menu {
  border-right: none;
  padding: 8px;
}

.el-menu:not(.el-menu--collapse) {
  width: 220px;
}

:deep(.el-menu-item) {
  height: 48px;
  line-height: 48px;
  margin: 4px 0;
  border-radius: 8px;
  transition: all 0.3s;
}

:deep(.el-menu-item:hover) {
  background-color: rgba(255,255,255,0.1) !important;
}

:deep(.el-menu-item.is-active) {
  background: rgba(255,255,255,0.15) !important;
  color: #fff !important;
  font-weight: 500;
}

:deep(.el-menu-item.is-active .el-icon) {
  color: #fff !important;
}

:deep(.el-sub-menu__title) {
  height: 48px;
  line-height: 48px;
  margin: 4px 0;
  border-radius: 8px;
}

:deep(.el-sub-menu__title:hover) {
  background-color: rgba(255,255,255,0.1) !important;
}

:deep(.el-sub-menu .el-menu-item) {
  padding-left: 48px !important;
  min-width: auto;
}

:deep(.el-icon) {
  font-size: 18px;
}
</style>
