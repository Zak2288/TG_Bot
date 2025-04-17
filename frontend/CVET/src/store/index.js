import { createStore } from 'vuex';
import { auth, appointments, clients, services, branches, sales, notifications, telegram } from '../api';

// Создание хранилища Vuex
export default createStore({
  state: {
    user: null,
    token: localStorage.getItem('token') || null,
    appointments: [],
    clients: [],
    services: [],
    branches: [],
    sales: [],
    notifications: [],
    loading: false,
    error: null,
  },
  getters: {
    isAuthenticated: state => !!state.token,
    currentUser: state => state.user,
    getServiceById: state => id => state.services.find(service => service.id === id),
    getClientById: state => id => state.clients.find(client => client.id === id),
    getAppointmentById: state => id => state.appointments.find(appointment => appointment.id === id),
    getBranchById: state => id => state.branches.find(branch => branch.id === id),
  },
  mutations: {
    SET_USER(state, user) {
      state.user = user;
    },
    SET_TOKEN(state, token) {
      state.token = token;
      localStorage.setItem('token', token);
    },
    SET_APPOINTMENTS(state, appointments) {
      state.appointments = appointments;
    },
    SET_CLIENTS(state, clients) {
      state.clients = clients;
    },
    SET_SERVICES(state, services) {
      state.services = services;
    },
    SET_BRANCHES(state, branches) {
      state.branches = branches;
    },
    SET_SALES(state, sales) {
      state.sales = sales;
    },
    SET_NOTIFICATIONS(state, notifications) {
      state.notifications = notifications;
    },
    SET_LOADING(state, loading) {
      state.loading = loading;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    CLEAR_AUTH(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
    },
    UPDATE_SERVICE(state, updatedService) {
      const index = state.services.findIndex(s => s.id === updatedService.id);
      if (index !== -1) {
        state.services.splice(index, 1, updatedService);
      }
    },
    UPDATE_CLIENT(state, updatedClient) {
      const index = state.clients.findIndex(c => c.id === updatedClient.id);
      if (index !== -1) {
        state.clients.splice(index, 1, updatedClient);
      }
    },
    UPDATE_APPOINTMENT(state, updatedAppointment) {
      const index = state.appointments.findIndex(a => a.id === updatedAppointment.id);
      if (index !== -1) {
        state.appointments.splice(index, 1, updatedAppointment);
      }
    },
    UPDATE_BRANCH(state, updatedBranch) {
      const index = state.branches.findIndex(b => b.id === updatedBranch.id);
      if (index !== -1) {
        state.branches.splice(index, 1, updatedBranch);
      }
    },
    REMOVE_SERVICE(state, id) {
      state.services = state.services.filter(s => s.id !== id);
    },
    REMOVE_CLIENT(state, id) {
      state.clients = state.clients.filter(c => c.id !== id);
    },
    REMOVE_APPOINTMENT(state, id) {
      state.appointments = state.appointments.filter(a => a.id !== id);
    },
    REMOVE_BRANCH(state, id) {
      state.branches = state.branches.filter(b => b.id !== id);
    }
  },
  actions: {
    async login({ commit }, credentials) {
      try {
        commit('SET_LOADING', true);
        const response = await auth.login(credentials);
        commit('SET_TOKEN', response.data.token);
        commit('SET_USER', response.data.user);
        return response;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Ошибка входа');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async register({ commit }, userData) {
      try {
        commit('SET_LOADING', true);
        const response = await auth.register(userData);
        return response;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Ошибка регистрации');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async logout({ commit }) {
      commit('CLEAR_AUTH');
    },

    async fetchAppointments({ commit }) {
      try {
        commit('SET_LOADING', true);
        const response = await appointments.getAll();
        commit('SET_APPOINTMENTS', response.data);
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Ошибка загрузки записей');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async fetchClients({ commit }) {
      try {
        commit('SET_LOADING', true);
        const response = await clients.getAll();
        commit('SET_CLIENTS', response.data);
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Ошибка загрузки клиентов');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async fetchServices({ commit }) {
      try {
        commit('SET_LOADING', true);
        const response = await services.getAll();
        commit('SET_SERVICES', response.data);
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Ошибка загрузки услуг');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async fetchBranches({ commit }) {
      try {
        commit('SET_LOADING', true);
        const response = await branches.getAll();
        commit('SET_BRANCHES', response.data);
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Ошибка загрузки филиалов');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async fetchSales({ commit }) {
      try {
        commit('SET_LOADING', true);
        const response = await sales.getAll();
        commit('SET_SALES', response.data);
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Ошибка загрузки продаж');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async fetchNotifications({ commit }) {
      try {
        commit('SET_LOADING', true);
        const response = await notifications.getAll();
        commit('SET_NOTIFICATIONS', response.data);
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Ошибка загрузки уведомлений');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async markNotificationAsRead({ commit }, id) {
      try {
        await notifications.markAsRead(id);
        await this.dispatch('fetchNotifications');
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Ошибка обновления уведомления');
        throw error;
      }
    },

    async sendTelegramMessage({ commit }, data) {
      try {
        commit('SET_LOADING', true);
        const response = await telegram.sendMessage(data);
        return response;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Ошибка отправки сообщения');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async createService({ commit }, serviceData) {
      try {
        commit('SET_LOADING', true);
        const response = await services.create(serviceData);
        commit('SET_SERVICES', [...state.services, response.data]);
        return response;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Ошибка создания услуги');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async updateService({ commit }, { id, ...serviceData }) {
      try {
        commit('SET_LOADING', true);
        const response = await services.update(id, serviceData);
        commit('UPDATE_SERVICE', response.data);
        return response;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Ошибка обновления услуги');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async deleteService({ commit }, id) {
      try {
        commit('SET_LOADING', true);
        await services.delete(id);
        commit('REMOVE_SERVICE', id);
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Ошибка удаления услуги');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async fetchServiceById({ commit }, id) {
      try {
        commit('SET_LOADING', true);
        const response = await services.getById(id);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Ошибка загрузки услуги');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async fetchBranch({ commit }, id) {
      try {
        commit('SET_LOADING', true);
        const response = await branches.getById(id);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Ошибка загрузки филиала');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async createBranch({ commit, state }, branchData) {
      try {
        commit('SET_LOADING', true);
        const response = await branches.create(branchData);
        commit('SET_BRANCHES', [...state.branches, response.data]);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Ошибка создания филиала');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async updateBranch({ commit }, { id, ...branchData }) {
      try {
        commit('SET_LOADING', true);
        const response = await branches.update(id, branchData);
        commit('UPDATE_BRANCH', response.data);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Ошибка обновления филиала');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async deleteBranch({ commit }, id) {
      try {
        commit('SET_LOADING', true);
        await branches.delete(id);
        commit('REMOVE_BRANCH', id);
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Ошибка удаления филиала');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
  },
  getters: {
    appointments: (state) => state.appointments,
    clients: (state) => state.clients,
    services: (state) => state.services,
    branches: (state) => state.branches,
    sales: (state) => state.sales,
    notifications: (state) => state.notifications,
    unreadNotifications: (state) => state.notifications.filter(n => !n.read),
    loading: (state) => state.loading,
    error: (state) => state.error,
  },
}); 