import axios from 'axios';

export default {
  namespaced: true,
  state: {
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user')) || null,
  },
  mutations: {
    SET_AUTH(state, { token, user }) {
      state.token = token;
      state.user = user;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    },
    CLEAR_AUTH(state) {
      state.token = null;
      state.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  },
  actions: {
    async login({ commit, dispatch }, credentials) {
      try {
        dispatch('setLoading', true, { root: true });
        const response = await axios.post('/auth/login', credentials);
        commit('SET_AUTH', {
          token: response.data.access_token,
          user: response.data.user,
        });
        dispatch('setNotification', {
          type: 'success',
          message: 'Вы успешно вошли в систему',
        }, { root: true });
        return response.data;
      } catch (error) {
        const message = error.response?.data?.message || 'Ошибка входа';
        dispatch('setError', message, { root: true });
        throw error;
      } finally {
        dispatch('setLoading', false, { root: true });
      }
    },
    async register({ commit, dispatch }, userData) {
      try {
        dispatch('setLoading', true, { root: true });
        const response = await axios.post('/auth/register', userData);
        commit('SET_AUTH', {
          token: response.data.access_token,
          user: response.data.user,
        });
        dispatch('setNotification', {
          type: 'success',
          message: 'Вы успешно зарегистрировались',
        }, { root: true });
        return response.data;
      } catch (error) {
        const message = error.response?.data?.message || 'Ошибка регистрации';
        dispatch('setError', message, { root: true });
        throw error;
      } finally {
        dispatch('setLoading', false, { root: true });
      }
    },
    logout({ commit, dispatch }) {
      commit('CLEAR_AUTH');
      dispatch('setNotification', {
        type: 'success',
        message: 'Вы успешно вышли из системы',
      }, { root: true });
    },
  },
  getters: {
    isAuthenticated: state => !!state.token,
    currentUser: state => state.user,
    isAdmin: state => state.user && state.user.role === 'ADMIN',
    isManager: state => state.user && (state.user.role === 'MANAGER' || state.user.role === 'ADMIN'),
  },
}; 