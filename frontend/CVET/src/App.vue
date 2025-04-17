<script>
import { mapGetters, mapActions } from 'vuex';

export default {
  name: 'App',
  data() {
    return {
      showProfileMenu: false,
      showNotifications: false,
      navigation: [
        { name: 'Дашборд', to: '/' },
        { name: 'Записи', to: '/appointments' },
        { name: 'Клиенты', to: '/clients' },
        { name: 'Услуги', to: '/services' },
        { name: 'Филиалы', to: '/branches' },
        { name: 'Продажи', to: '/sales' }
      ]
    };
  },
  computed: {
    ...mapGetters(['isAuthenticated', 'user', 'notifications', 'unreadNotifications'])
  },
  methods: {
    ...mapActions(['logout', 'markNotificationAsRead']),
    async markAsRead(id) {
      await this.markNotificationAsRead(id);
      this.showNotifications = false;
    }
  },
  created() {
    if (this.isAuthenticated) {
      this.$store.dispatch('fetchNotifications');
    }
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <nav v-if="isAuthenticated" class="bg-white shadow-lg">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <router-link to="/" class="text-xl font-bold text-gray-800">
                Цвет Взгляда
              </router-link>
            </div>
            <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
              <router-link
                v-for="item in navigation"
                :key="item.name"
                :to="item.to"
                class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                :class="[
                  $route.path === item.to
                    ? 'border-indigo-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                ]"
              >
                {{ item.name }}
              </router-link>
            </div>
          </div>
          <div class="hidden sm:ml-6 sm:flex sm:items-center">
            <div class="ml-3 relative">
              <div class="flex items-center">
                <button
                  @click="showNotifications = !showNotifications"
                  class="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <span class="sr-only">Уведомления</span>
                  <div class="relative">
                    <svg
                      class="h-6 w-6"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                      />
                    </svg>
                    <span
                      v-if="unreadNotifications.length"
                      class="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center"
                    >
                      {{ unreadNotifications.length }}
                    </span>
                  </div>
                </button>
                <div
                  v-if="showNotifications"
                  class="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                >
                  <div
                    v-if="notifications.length"
                    class="max-h-96 overflow-y-auto"
                  >
                    <div
                      v-for="notification in notifications"
                      :key="notification.id"
                      class="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                      @click="markAsRead(notification.id)"
                    >
                      {{ notification.message }}
                    </div>
                  </div>
                  <div v-else class="px-4 py-2 text-sm text-gray-500">
                    Нет уведомлений
                  </div>
                </div>
              </div>
            </div>
            <div class="ml-3 relative">
              <div>
                <button
                  @click="showProfileMenu = !showProfileMenu"
                  class="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <span class="sr-only">Открыть меню пользователя</span>
                  <img
                    class="h-8 w-8 rounded-full"
                    :src="user?.avatar || 'https://via.placeholder.com/32'"
                    alt=""
                  />
                </button>
              </div>
              <div
                v-if="showProfileMenu"
                class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
              >
                <router-link
                  to="/profile"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Профиль
                </router-link>
                <router-link
                  to="/settings"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Настройки
                </router-link>
                <button
                  @click="logout"
                  class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Выйти
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <main>
      <router-view />
    </main>
  </div>
</template>

<style>
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';
</style>
