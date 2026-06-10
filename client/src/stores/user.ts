import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '');
  const userInfo = ref(JSON.parse(localStorage.getItem('user') || '{}'));

  function setLogin(data: any) {
    token.value = data.accessToken;
    userInfo.value = { id: data.id, username: data.username, name: data.name, role: data.role };
    localStorage.setItem('token', data.accessToken);
    localStorage.setItem('user', JSON.stringify(userInfo.value));
  }

  function logout() {
    token.value = '';
    userInfo.value = {};
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  const isAdmin = () => userInfo.value.role === 'admin';

  return { token, userInfo, setLogin, logout, isAdmin };
});
