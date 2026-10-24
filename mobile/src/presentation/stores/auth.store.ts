import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { UserRole } from '../../shared/types';

interface AuthState {
  token: string | null;
  usuario: { id: string; nombre: string; documento: string; rol: UserRole } | null;
  isLoading: boolean;
  login: (documento: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  usuario: null,
  isLoading: true,

  login: async (documento: string, password: string) => {
    try {
      const res = await axios.post('http://10.0.2.2:3000/auth/login', {
        documento,
        password,
      });

      const { token, usuario } = res.data;
      await SecureStore.setItemAsync('auth_token', token);
      await SecureStore.setItemAsync('user_data', JSON.stringify(usuario));

      set({ token, usuario });
      return true;
    } catch {
      return false;
    }
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('auth_token');
    await SecureStore.deleteItemAsync('user_data');
    set({ token: null, usuario: null });
  },

  checkSession: async () => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      const rawUser = await SecureStore.getItemAsync('user_data');
      if (token && rawUser) {
        set({ token, usuario: JSON.parse(rawUser), isLoading: false });
      } else {
        set({ token: null, usuario: null, isLoading: false });
      }
    } catch {
      set({ token: null, usuario: null, isLoading: false });
    }
  },
}));
