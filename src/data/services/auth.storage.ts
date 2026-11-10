import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import {
  AuthUser,
  RegistroDatos,
  Resultado,
  StoredSession,
  StoredUser,
} from '../../domain/entities/auth.model';

const USUARIOS_KEY = '@transporte:usuarios';
const SESION_KEY = 'transporte_sesion';

const normalizarCorreo = (correo: string): string => correo.trim().toLowerCase();
const normalizarRespuesta = (respuesta: string): string => respuesta.trim().toLowerCase();

function generarSal(): string {
  return Array.from(Crypto.getRandomBytes(16))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

async function generarHash(valor: string, sal: string): Promise<string> {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${sal}:${valor}`,
  );
}

function compararSeguro(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let diferencia = 0;
  for (let i = 0; i < a.length; i += 1) {
    diferencia |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diferencia === 0;
}

function aUsuarioPublico(usuario: StoredUser): AuthUser {
  return {
    id: usuario.id,
    nombre: usuario.nombre,
    correo: usuario.correo,
  };
}

export async function obtenerUsuarios(): Promise<StoredUser[]> {
  const crudo = await AsyncStorage.getItem(USUARIOS_KEY);
  if (!crudo) {
    return [];
  }

  try {
    const datos = JSON.parse(crudo);
    return Array.isArray(datos) ? (datos as StoredUser[]) : [];
  } catch {
    return [];
  }
}

async function guardarUsuarios(usuarios: StoredUser[]): Promise<void> {
  await AsyncStorage.setItem(USUARIOS_KEY, JSON.stringify(usuarios));
}

async function buscarUsuarioPorCorreo(correo: string): Promise<StoredUser | null> {
  const usuarios = await obtenerUsuarios();
  const correoNormalizado = normalizarCorreo(correo);
  return usuarios.find((usuario) => usuario.correo === correoNormalizado) ?? null;
}

export async function crearUsuario(
  datos: RegistroDatos,
): Promise<Resultado<AuthUser>> {
  const correo = normalizarCorreo(datos.correo);
  const usuarios = await obtenerUsuarios();

  if (usuarios.some((usuario) => usuario.correo === correo)) {
    return { ok: false, error: 'Este correo ya está registrado' };
  }

  const contrasenaSal = generarSal();
  const respuestaSal = generarSal();
  const [contrasenaHash, respuestaHash] = await Promise.all([
    generarHash(datos.contrasena, contrasenaSal),
    generarHash(normalizarRespuesta(datos.respuestaSeguridad), respuestaSal),
  ]);

  const usuario: StoredUser = {
    id: Crypto.randomUUID(),
    nombre: datos.nombre.trim(),
    correo,
    contrasenaHash,
    contrasenaSal,
    preguntaSeguridad: datos.preguntaSeguridad.trim(),
    respuestaHash,
    respuestaSal,
    creadoEn: new Date().toISOString(),
  };

  await guardarUsuarios([...usuarios, usuario]);
  return { ok: true, datos: aUsuarioPublico(usuario) };
}

export async function iniciarSesion(
  correo: string,
  contrasena: string,
): Promise<Resultado<AuthUser>> {
  const usuario = await buscarUsuarioPorCorreo(correo);
  if (!usuario) {
    return { ok: false, error: 'Correo o contraseña incorrectos' };
  }

  const hashIngresado = await generarHash(contrasena, usuario.contrasenaSal);
  if (!compararSeguro(hashIngresado, usuario.contrasenaHash)) {
    return { ok: false, error: 'Correo o contraseña incorrectos' };
  }

  return { ok: true, datos: aUsuarioPublico(usuario) };
}

export async function obtenerPreguntaSeguridad(
  correo: string,
): Promise<Resultado<string>> {
  const usuario = await buscarUsuarioPorCorreo(correo);
  if (!usuario) {
    return { ok: false, error: 'No existe una cuenta con este correo' };
  }
  return { ok: true, datos: usuario.preguntaSeguridad };
}

export async function verificarRespuestaSeguridad(
  correo: string,
  respuesta: string,
): Promise<Resultado<true>> {
  const usuario = await buscarUsuarioPorCorreo(correo);
  if (!usuario) {
    return { ok: false, error: 'No existe una cuenta con este correo' };
  }

  const hashIngresado = await generarHash(
    normalizarRespuesta(respuesta),
    usuario.respuestaSal,
  );
  if (!compararSeguro(hashIngresado, usuario.respuestaHash)) {
    return { ok: false, error: 'La respuesta de seguridad no es correcta' };
  }

  return { ok: true, datos: true };
}

export async function restablecerContrasena(
  correo: string,
  respuesta: string,
  nuevaContrasena: string,
): Promise<Resultado<true>> {
  const usuarios = await obtenerUsuarios();
  const correoNormalizado = normalizarCorreo(correo);
  const indice = usuarios.findIndex((usuario) => usuario.correo === correoNormalizado);

  if (indice === -1) {
    return { ok: false, error: 'No existe una cuenta con este correo' };
  }

  const usuario = usuarios[indice];
  const hashRespuesta = await generarHash(
    normalizarRespuesta(respuesta),
    usuario.respuestaSal,
  );

  if (!compararSeguro(hashRespuesta, usuario.respuestaHash)) {
    return { ok: false, error: 'La respuesta de seguridad no es correcta' };
  }

  const contrasenaSal = generarSal();
  const contrasenaHash = await generarHash(nuevaContrasena, contrasenaSal);
  const usuariosActualizados = [...usuarios];
  usuariosActualizados[indice] = {
    ...usuario,
    contrasenaHash,
    contrasenaSal,
  };

  await guardarUsuarios(usuariosActualizados);
  return { ok: true, datos: true };
}

export async function obtenerUsuarioPorId(id: string): Promise<AuthUser | null> {
  const usuarios = await obtenerUsuarios();
  const usuario = usuarios.find((item) => item.id === id);
  return usuario ? aUsuarioPublico(usuario) : null;
}

export async function guardarSesion(
  userId: string,
  recordarme: boolean,
): Promise<void> {
  const sesion: StoredSession = {
    userId,
    recordarme,
    creadoEn: new Date().toISOString(),
  };
  await SecureStore.setItemAsync(SESION_KEY, JSON.stringify(sesion));
}

let verificacionInicialHecha = false;

/**
 * Devuelve la sesión guardada. En el primer acceso tras abrir la app, las
 * sesiones sin "Recordarme" se descartan para volver a pedir el login.
 */
export async function obtenerSesion(): Promise<StoredSession | null> {
  try {
    const crudo = await SecureStore.getItemAsync(SESION_KEY);
    if (!crudo) {
      verificacionInicialHecha = true;
      return null;
    }

    const sesion = JSON.parse(crudo) as StoredSession;
    if (!sesion?.userId) {
      await SecureStore.deleteItemAsync(SESION_KEY);
      verificacionInicialHecha = true;
      return null;
    }

    if (!verificacionInicialHecha && !sesion.recordarme) {
      await SecureStore.deleteItemAsync(SESION_KEY);
      verificacionInicialHecha = true;
      return null;
    }

    verificacionInicialHecha = true;
    return sesion;
  } catch {
    verificacionInicialHecha = true;
    return null;
  }
}

export async function borrarSesion(): Promise<void> {
  await SecureStore.deleteItemAsync(SESION_KEY);
}
