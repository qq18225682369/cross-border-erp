<template>
  <div class="chat-container">
    <div class="chat-header">
      <h3>智能客服</h3>
      <el-button class="clear-btn" @click="clearChat">
        <el-icon><Delete /></el-icon>
        清空对话
      </el-button>
    </div>
    
    <div class="chat-messages" ref="chatBoxRef">
      <div 
        v-for="(msg, index) in chatMessages" 
        :key="index" 
        class="message"
        :class="msg.role"
      >
        <div class="message-avatar">
          <el-icon v-if="msg.role === 'user'"><User /></el-icon>
          <el-icon v-else><Service /></el-icon>
        </div>
        <div class="message-content">
          <div class="message-text">{{ msg.content }}</div>
          <div class="message-time">{{ formatTime(msg.timestamp) }}</div>
        </div>
      </div>
    </div>
    
    <div class="chat-input">
      <el-input 
        v-model="inputMessage" 
        placeholder="输入您的问题..." 
        @keyup.enter="sendMessage"
        :disabled="loading"
      />
      <el-button type="primary" @click="sendMessage" :loading="loading">
        发送
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { User, Service } from '@element-plus/icons-vue'

const chatMessages = ref([])
const inputMessage = ref('')
const loading = ref(false)

const formatTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

const sendMessage = async () => {
  if (!inputMessage.value.trim()) {
    ElMessage.warning('请输入您的问题')
    return
  }
  
  const userMessage = inputMessage.value
  inputMessage.value = ''
  loading.value = true
  
  // 添加用户消息
  chatMessages.value.push({
    role: 'user',
    content: userMessage,
    timestamp: Date.now()
  })
  
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userMessage,
        history: chatMessages.value.slice(0, -1)
      })
    })
    
    const data = await res.json()
    
    if (data.code === 200) {
      // 添加助手回复
      chatMessages.value.push({
        role: 'assistant',
        content: data.data?.reply || data.message,
        timestamp: Date.now()
      })
      
      // 滚动到底部
      setTimeout(() => {
        const chatBox = document.querySelector('.chat-messages')
        if (chatBox) {
          chatBox.scrollTop = chatBox.scrollHeight
        }
      }, 100)
    } else {
      ElMessage.error(data.message || '发送失败')
    }
  } catch (error) {
    ElMessage.error('发送失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const clearChat = () => {
  chatMessages.value = []
  inputMessage.value = ''
}

onMounted(() => {
  // 欢迎消息
  chatMessages.value.push({
    role: 'assistant',
    content: '您好！我是跨境电商ERP系统的智能客服助手。我可以帮您解答关于产品管理、数据统计、库存管理等问题。请问有什么可以帮助您的？',
    timestamp: Date.now()
  })
})
</script>

<style scoped>
.chat-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

.chat-header {
  padding: 16px 20px;
  background: linear-gradient(135deg, #1a1f36 0%, #2d3561 100%);
  color: #fff;
  border-radius: 12px 12px 0 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.chat-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.clear-btn {
  background: transparent;
  border: none;
  color: rgba(255,255,255,0.7);
  cursor: pointer;
  padding: 8px;
}

.clear-btn:hover {
  color: #fff;
}

.chat-messages {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  background: #fff;
}

.message {
  display: flex;
  margin-bottom: 16px;
}

.message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: linear-gradient(135deg, #1a1f36 0%, #2d3561 100%);
  color: #fff;
}

.message.assistant .message-avatar {
  background: linear-gradient(135deg, #67C23A 0%, #85ce61 100%);
}

.message-content {
  max-width: 70%;
  display: flex;
  flex-direction: column;
}

.message.user .message-content {
  align-items: flex-end;
}

.message.assistant .message-content {
  align-items: flex-start;
}

.message-text {
  padding: 12px 16px;
  border-radius: 12px;
  line-height: 1.5;
  word-break: break-word;
}

.message.user .message-text {
  background: linear-gradient(135deg, #1a1f36 0%, #2d3561 100%);
  color: #fff;
}

.message.assistant .message-text {
  background: #f5f7fa;
  color: #303133;
}

.message-time {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.chat-input {
  padding: 16px;
  background: #fff;
  border-radius: 0 0 12px 12px;
  display: flex;
  gap: 12px;
  align-items: center;
  border-top: 1px solid #e4e7ed;
}

.chat-input .el-input {
  flex: 1;
}

.chat-input .el-button {
  flex-shrink: 0;
}
</style>
