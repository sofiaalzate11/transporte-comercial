import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { AuthUser, RegistroDatos, Resultado, StoredSession } from '../../domain/entities/auth.model';
import { API_BASE_URL } from '../config/api.config';

const SESION_KEY = 'transporte_sesion';
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';
const client = axios.create({ baseURL: API_BASE_URL, timeout: 10000 });
let verificacionInicialHecha = false;

function mensaje(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.message;
    if (Array.isArray(detail)) return detail.join('. ');
    if (typeof detail === 'string') return detail;
    if (!error.response) return `No se pudo conectar al servidor (${API_BASE_URL}). Verifica la red y el backend.`;
  }
  return 'No se pudo completar la solicitud. Inténtalo de nuevo.';
}

export async function crearUsuario(datos: RegistroDatos): Promise<Resultado<AuthUser>> {
  try {
    const { data } = await client.post('/auth/mobile/register', { ...datos, correo: datos.correo.trim().toLowerCase() });
    return { ok: true, datos: data.usuario };
  } catch (error) { return { ok: false, error: mensaje(error) }; }
}

export async function iniciarSesion(correo: string, contrasena: string): Promise<Resultado<AuthUser>> {
  try {
    const { data } = await client.post('/auth/mobile/login', { correo: correo.trim().toLowerCase(), contrasena });
    await SecureStore.setItemAsync(TOKEN_KEY, data.token);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(data.usuario));
    return { ok: true, datos: data.usuario };
  } catch (error) { return { ok: false, error: mensaje(error) }; }
}

export async function obtenerPreguntaSeguridad(correo: string): Promise<Resultado<string>> {
  try {
    const { data } = await client.post('/auth/mobile/recovery/question', { correo: correo.trim().toLowerCase() });
    return { ok: true, datos: data.pregunta };
  } catch (error) { return { ok: false, error: mensaje(error) }; }
}

export async function verificarRespuestaSeguridad(correo: string, respuesta: string): Promise<Resultado<true>> {
  try {
    await client.post('/auth/mobile/recovery/verify', { correo: correo.trim().toLowerCase(), respuesta });
    return { ok: true, datos: true };
  } catch (error) { return { ok: false, error: mensaje(error) }; }
}

export async function restablecerContrasena(correo: string, respuesta: string, nuevaContrasena: string): Promise<Resultado<true>> {
  try {
    await client.post('/auth/mobile/recovery/reset', { correo: correo.trim().toLowerCase(), respuesta, nuevaContrasena });
    return { ok: true, datos: true };
  } catch (error) { return { ok: false, error: mensaje(error) }; }
}

export async function obtenerUsuarioPorId(id: string): Promise<AuthUser | null> {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  if (!token) return null;
  try {
    const { data } = await client.get<AuthUser>('/auth/me', { headers: { Authorization: `Bearer ${token}` } });
    if (data.id !== id) return null;
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(data));
    return data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) return null;
    const raw = await SecureStore.getItemAsync(USER_KEY);
    if (!raw) return null;
    const user = JSON.parse(raw) as AuthUser;
    return user.id === id ? user : null;
  }
}

export async function guardarSesion(userId: string, recordarme: boolean): Promise<void> {
  const sesion: StoredSession = { userId, recordarme, creadoEn: new Date().toISOString() };
  await SecureStore.setItemAsync(SESION_KEY, JSON.stringify(sesion));
}

export async function obtenerSesion(): Promise<StoredSession | null> {
  try {
    const raw = await SecureStore.getItemAsync(SESION_KEY);
    const session: StoredSession | null = raw ? JSON.parse(raw) : null;
    const firstRead = !verificacionInicialHecha;
    verificacionInicialHecha = true;
    if (!session?.userId || (firstRead && !session.recordarme)) {
      await borrarSesion();
      return null;
    }
    return session;
  } catch { await borrarSesion(); return null; }
}

export async function borrarSesion(): Promise<void> {
  await Promise.all([SESION_KEY, TOKEN_KEY, USER_KEY].map((key) => SecureStore.deleteItemAsync(key)));
}
