<template>
  <div class="min-h-screen bg-gray-50 w-full overflow-x-hidden">
    <!-- Шапка -->
    <header class="bg-white shadow w-full">
      <div class="w-full px-4">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <h1 class="text-xl font-bold text-primary-600">Система управления бизнесом</h1>
            </div>
            <nav class="ml-6 flex space-x-4">
              <router-link
                v-for="(item, index) in navigationItems"
                :key="index"
                :to="item.route"
                class="px-3 py-2 rounded-md text-sm font-medium"
                :class="[$route.path.startsWith(item.pathMatch) ? 'bg-primary-100 text-primary-700' : 'text-gray-700 hover:bg-gray-100']"
              >
                {{ item.title }}
              </router-link>
            </nav>
          </div>
          <div class="flex items-center">
            <div class="ml-3 relative">
              <div class="flex items-center">
                <span class="text-gray-700 mr-2">{{ currentUser ? currentUser.name : 'Пользователь' }}</span>
                <button
                  @click="isUserMenuOpen = !isUserMenuOpen"
                  class="bg-white rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <span class="sr-only">Открыть меню пользователя</span>
                  <div class="h-8 w-8 rounded-full bg-primary-200 flex items-center justify-center text-primary-700">
                    {{ userInitials }}
                  </div>
                </button>
              </div>
              
              <!-- Выпадающее меню пользователя -->
              <div
                v-if="isUserMenuOpen"
                class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-10"
              >
                <router-link
                  to="/profile"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  @click="isUserMenuOpen = false"
                >
                  Профиль
                </router-link>
                <a
                  href="#"
                  @click.prevent="logout"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Выйти
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Основной контент -->
    <main class="w-full">
      <div class="w-full px-4 py-6">
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
    </main>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter, useRoute } from 'vue-router';

export default {
  name: 'DefaultLayout',
  setup() {
    const store = useStore();
    const router = useRouter();
    const route = useRoute();
    const isUserMenuOpen = ref(false);

    // Получение данных о пользователе из хранилища Vuex
    const currentUser = computed(() => store.getters['auth/currentUser']);
    
    // Получение инициалов пользователя для аватара
    const userInitials = computed(() => {
      if (!currentUser.value) return '';
      const nameParts = currentUser.value.name ? currentUser.value.name.split(' ') : 
        (currentUser.value.email ? [currentUser.value.email] : ['User']);
      
      if (nameParts.length > 1) {
        return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
      }
      return nameParts[0][0].toUpperCase();
    });
    
    // Пункты меню навигации
    const navigationItems = [
      { title: 'Дашборд', route: '/dashboard', pathMatch: '/dashboard' },
      { title: 'Записи', route: '/appointments', pathMatch: '/appointments' },
      { title: 'Клиенты', route: '/clients', pathMatch: '/clients' },
      { title: 'Услуги и прайс', route: '/services', pathMatch: '/services' },
      { title: 'Филиалы', route: '/branches', pathMatch: '/branches' },
      { title: 'Статистика', route: '/statistics', pathMatch: '/statistics' }
    ];
    
    // Состояние загрузки и уведомления
    const loading = computed(() => store.state.loading);
    const notification = computed(() => store.state.notification);
    
    // Методы
    const logout = () => {
      store.dispatch('auth/logout');
      router.push('/auth/login');
    };
    
    const clearNotification = () => {
      store.dispatch('clearNotification');
    };
    
    // Закрытие меню пользователя при клике вне его
    const closeUserMenu = (e) => {
      if (isUserMenuOpen.value) {
        isUserMenuOpen.value = false;
      }
    };
    
    // Добавляем слушатель кликов на документ
    document.addEventListener('click', closeUserMenu);
    
    return {
      currentUser,
      userInitials,
      navigationItems,
      isUserMenuOpen,
      loading,
      notification,
      route,
      logout,
      clearNotification,
    };
  },
};
</script>

<style scoped>
.min-h-screen {
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
}
</style> 