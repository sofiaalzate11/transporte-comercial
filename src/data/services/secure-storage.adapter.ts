import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

let isSecureStoreSupported: boolean | null = null;

async function checkSecureStore(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  if (isSecureStoreSupported !== null) return isSecureStoreSupported;
  try {
    isSecureStoreSupported = await SecureStore.isAvailableAsync();
  } catch {
    isSecureStoreSupported = false;
  }
  return !!isSecureStoreSupported;
}

export async function getSecureItem(key: string): Promise<string | null> {
  try {
    if (await checkSecureStore()) {
      return await SecureStore.getItemAsync(key);
    }
  } catch (error) {
    console.warn(`[SecureStoreAdapter] getItem fallo para ${key}, usando AsyncStorage`, error);
  }
  try {
    return await AsyncStorage.getItem(key);
  } catch {
    return null;
  }
}

export async function setSecureItem(key: string, value: string): Promise<void> {
  try {
    if (await checkSecureStore()) {
      await SecureStore.setItemAsync(key, value);
      return;
    }
  } catch (error) {
    console.warn(`[SecureStoreAdapter] setItem fallo para ${key}, usando AsyncStorage`, error);
  }
  try {
    await AsyncStorage.setItem(key, value);
  } catch (error) {
    console.error(`[SecureStoreAdapter] Error guardando ${key} en AsyncStorage`, error);
  }
}

export async function deleteSecureItem(key: string): Promise<void> {
  try {
    if (await checkSecureStore()) {
      await SecureStore.deleteItemAsync(key);
      return;
    }
  } catch (error) {
    console.warn(`[SecureStoreAdapter] deleteItem fallo para ${key}, usando AsyncStorage`, error);
  }
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`[SecureStoreAdapter] Error eliminando ${key} en AsyncStorage`, error);
  }
}
