import * as SecureStore from 'expo-secure-store';
import { AuthSession } from '../../../domain/models/AuthUser';

export class SecureTokenStorage {
  private static readonly KEY_SESSION = 'tc_auth_session_secure_v1';

  public static async saveSession(session: AuthSession): Promise<void> {
    const serialized = JSON.stringify(session);
    try {
      await SecureStore.setItemAsync(this.KEY_SESSION, serialized, {
        keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
      });
    } catch {
      // Fallback en memoria si SecureStore no está disponible (ej. entornos de test o SSR)
      if (typeof globalThis !== 'undefined') {
        (globalThis as unknown as { __tc_memory_session?: string }).__tc_memory_session = serialized;
      }
    }
  }

  public static async getSession(): Promise<AuthSession | null> {
    try {
      const serialized = await SecureStore.getItemAsync(this.KEY_SESSION);
      if (serialized) {
        return JSON.parse(serialized) as AuthSession;
      }
    } catch {
      if (typeof globalThis !== 'undefined') {
        const mem = (globalThis as unknown as { __tc_memory_session?: string }).__tc_memory_session;
        if (mem) return JSON.parse(mem) as AuthSession;
      }
    }
    return null;
  }

  public static async clearSession(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(this.KEY_SESSION);
    } catch {
      // noop
    }
    if (typeof globalThis !== 'undefined') {
      delete (globalThis as unknown as { __tc_memory_session?: string }).__tc_memory_session;
    }
  }
}
