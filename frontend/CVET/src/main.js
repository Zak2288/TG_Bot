import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

const app = createApp(App)

// Global error handler
app.config.errorHandler = (err, vm, info) => {
  console.error('Global error:', err)
  store.dispatch('setNotification', {
    type: 'error',
    message: 'Произошла ошибка в приложении. Пожалуйста, попробуйте еще раз или обратитесь в поддержку.'
  }, { root: true })
}

app.use(router)
app.use(store)
app.mount('#app')
