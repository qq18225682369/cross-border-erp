<template>
  <div class="layout-container">
    <Sidebar :isCollapsed="isCollapsed" />
    <div class="main-container" :class="{ collapsed: isCollapsed }">
      <Header :isCollapsed="isCollapsed" @toggle-collapse="toggleCollapse" />
      <div class="content-wrapper">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Sidebar from './components/Sidebar.vue'
import Header from './components/Header.vue'

const isCollapsed = ref(false)

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}
</script>

<style scoped>
.layout-container {
  display: flex;
  min-height: 100vh;
  width: 100%;
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 220px;
  transition: margin-left 0.3s;
  min-height: 100vh;
  background-color: #f5f7fa;
}

.main-container.collapsed {
  margin-left: 64px;
}

.content-wrapper {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
