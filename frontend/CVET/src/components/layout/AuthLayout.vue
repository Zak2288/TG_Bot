<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Система управления бизнесом
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Управление записями клиентов и учет продаж
        </p>
      </div>
      
      <!-- Уведомления -->
      <div v-if="notification" class="mb-4">
        <div
          class="rounded-md p-4"
          :class="{
            'bg-green-50 text-green-800': notification.type === 'success',
            'bg-red-50 text-red-800': notification.type === 'error',
            'bg-blue-50 text-blue-800': notification.type === 'info',
          }"
        >
          <div class="flex">
            <div class="flex-shrink-0">
              <span v-if="notification.type === 'success'" class="h-5 w-5 text-green-400">✓</span>
              <span v-else-if="notification.type === 'error'" class="h-5 w-5 text-red-400">✗</span>
              <span v-else class="h-5 w-5 text-blue-400">ℹ</span>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium">{{ notification.message }}</p>
            </div>
            <div class="ml-auto pl-3">
              <div class="-mx-1.5 -my-1.5">
                <button
                  @click="clearNotification"
                  class="inline-flex rounded-md p-1.5"
                  :class="{
                    'bg-green-50 text-green-500 hover:bg-green-100': notification.type === 'success',
                    'bg-red-50 text-red-500 hover:bg-red-100': notification.type === 'error',
                    'bg-blue-50 text-blue-500 hover:bg-blue-100': notification.type === 'info',
                  }"
                >
                  <span class="sr-only">Dismiss</span>
                  <span class="h-5 w-5">×</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Индикатор загрузки -->
      <div v-if="loading" class="flex justify-center my-8">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
      
      <!-- Контент -->
      <router-view v-else></router-view>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import { useStore } from 'vuex';

export default {
  name: 'AuthLayout',
  setup() {
    const store = useStore();
    
    // Состояние загрузки и уведомления
    const loading = computed(() => store.state.loading);
    const notification = computed(() => store.state.notification);
    
    // Методы
    const clearNotification = () => {
      store.dispatch('clearNotification');
    };
    
    return {
      loading,
      notification,
      clearNotification,
    };
  },
};
</script> 