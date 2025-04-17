import api from '@/api';

export default {
  namespaced: true,
  state: {
    appointments: [],
    appointment: null,
  },
  mutations: {
    SET_APPOINTMENTS(state, appointments) {
      state.appointments = appointments;
    },
    SET_APPOINTMENT(state, appointment) {
      state.appointment = appointment;
    },
    ADD_APPOINTMENT(state, appointment) {
      state.appointments.push(appointment);
    },
    UPDATE_APPOINTMENT(state, updatedAppointment) {
      const index = state.appointments.findIndex(appointment => appointment.id === updatedAppointment.id);
      if (index !== -1) {
        state.appointments.splice(index, 1, updatedAppointment);
      }
    },
    REMOVE_APPOINTMENT(state, appointmentId) {
      state.appointments = state.appointments.filter(appointment => appointment.id !== appointmentId);
    },
  },
  actions: {
    async fetchAppointments({ commit, dispatch }, query = {}) {
      try {
        dispatch('setLoading', true, { root: true });
        const response = await api.getAppointments(query);
        commit('SET_APPOINTMENTS', response.data.data || response.data);
        return response.data.data || response.data;
      } catch (error) {
        const message = error.response?.data?.message || 'Ошибка при получении записей';
        dispatch('setError', message, { root: true });
        throw error;
      } finally {
        dispatch('setLoading', false, { root: true });
      }
    },
    async fetchAppointment({ commit, dispatch }, id) {
      try {
        dispatch('setLoading', true, { root: true });
        const response = await api.getAppointment(id);
        commit('SET_APPOINTMENT', response.data);
        return response.data;
      } catch (error) {
        const message = error.response?.data?.message || 'Ошибка при получении записи';
        dispatch('setError', message, { root: true });
        throw error;
      } finally {
        dispatch('setLoading', false, { root: true });
      }
    },
    async createAppointment({ commit, dispatch }, appointmentData) {
      try {
        dispatch('setLoading', true, { root: true });
        const response = await api.createAppointment(appointmentData);
        commit('ADD_APPOINTMENT', response.data);
        dispatch('setNotification', {
          type: 'success',
          message: 'Запись успешно создана',
        }, { root: true });
        return response.data;
      } catch (error) {
        const message = error.response?.data?.message || 'Ошибка при создании записи';
        dispatch('setError', message, { root: true });
        throw error;
      } finally {
        dispatch('setLoading', false, { root: true });
      }
    },
    async updateAppointment({ commit, dispatch }, { id, appointmentData }) {
      try {
        dispatch('setLoading', true, { root: true });
        const response = await api.updateAppointment(id, appointmentData);
        commit('UPDATE_APPOINTMENT', response.data);
        dispatch('setNotification', {
          type: 'success',
          message: 'Запись успешно обновлена',
        }, { root: true });
        return response.data;
      } catch (error) {
        const message = error.response?.data?.message || 'Ошибка при обновлении записи';
        dispatch('setError', message, { root: true });
        throw error;
      } finally {
        dispatch('setLoading', false, { root: true });
      }
    },
    async deleteAppointment({ commit, dispatch }, id) {
      try {
        dispatch('setLoading', true, { root: true });
        await api.deleteAppointment(id);
        commit('REMOVE_APPOINTMENT', id);
        dispatch('setNotification', {
          type: 'success',
          message: 'Запись успешно удалена',
        }, { root: true });
      } catch (error) {
        const message = error.response?.data?.message || 'Ошибка при удалении записи';
        dispatch('setError', message, { root: true });
        throw error;
      } finally {
        dispatch('setLoading', false, { root: true });
      }
    },
  },
  getters: {
    appointments: state => state.appointments,
    appointment: state => state.appointment,
    appointmentsByStatus: state => status => state.appointments.filter(appointment => appointment.status === status),
    appointmentsByDate: state => date => state.appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.startTime).toISOString().split('T')[0];
      return appointmentDate === date;
    }),
  },
}; 