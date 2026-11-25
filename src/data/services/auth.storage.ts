import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import {
  AuthUser,
  RegistroDatos,
  Resultado,
  RolUsuario,
  StoredSession,
  StoredUser,
} from '../../domain/entities/auth.model';
import {
  deleteSecureItem,
  getSecureItem,
  setSecureItem,
} from './secure-storage.adapter';

const USUARIOS_KEY = '@transporte:usuarios';
const SESION_KEY = 'transporte_sesion';
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

const normalizarCorreo = (correo: string): string => correo.trim().toLowerCase();
const normalizarRespuesta = (respuesta: string): string =>
  respuesta.trim().toLowerCase();

interface UsuarioPrueba {
  nombre: string;
  correo: string;
  contrasena: string;
  rol: RolUsuario;
}

/** Credenciales de validación del plan QA; se crean una sola vez en el dispositivo. */
const USUARIOS_PRUEBA: UsuarioPrueba[] = [
  {
    nombre: 'Cliente Prueba',
    correo: 'cliente@transporte.com',
    contrasena: 'Prueba123!',
    rol: 'consulta',
  },
  {
    nombre: 'Operador Central',
    correo: 'operador@transporte.com',
    contrasena: 'Prueba123!',
    rol: 'operador',
  },
  {
    nombre: 'Conductor Prueba',
    correo: 'conductor@transporte.com',
    contrasena: 'Prueba123!',
    rol: 'conductor',
  },
];

const PREGUNTA_PRUEBA = '¿Cuál es tu ciudad natal?';
const RESPUESTA_PRUEBA = 'Prueba';

function mensajeError(error: unknown, porDefecto: string): string {
  return error instanceof Error && error.message ? error.message : porDefecto;
}

function generarSal(): string {
  return Array.from(Crypto.getRandomBytes(16))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function generarId(): string {
  try {
    return Crypto.randomUUID();
  } catch {
    const bytes = Array.from(Crypto.getRandomBytes(16));
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = bytes.map((byte) => byte.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }
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

function inferirRol(correo: string): AuthUser['rol'] {
  const valor = correo.toLowerCase();
  if (valor.includes('operador')) return 'operador';
  if (valor.includes('cliente')) return 'consulta';
  return 'conductor';
}

function aUsuarioPublico(usuario: StoredUser): AuthUser {
  return {
    id: usuario.id,
    nombre: usuario.nombre,
    correo: usuario.correo,
    rol: usuario.rol ?? inferirRol(usuario.correo),
  };
}

async function leerUsuarios(): Promise<StoredUser[]> {
  try {
    const crudo = await AsyncStorage.getItem(USUARIOS_KEY);
    if (!crudo) return [];

    const datos: unknown = JSON.parse(crudo);
    if (!Array.isArray(datos)) return [];

    return datos.filter(
      (item): item is StoredUser =>
        !!item &&
        typeof item === 'object' &&
        typeof (item as StoredUser).id === 'string' &&
        typeof (item as StoredUser).correo === 'string',
    );
  } catch {
    return [];
  }
}

let promesaUsuariosPrueba: Promise<void> | null = null;

async function construirUsuarioPrueba(
  usuario: UsuarioPrueba,
  existente?: StoredUser,
): Promise<StoredUser> {
  const contrasenaSal = generarSal();
  const respuestaSal = generarSal();
  const [contrasenaHash, respuestaHash] = await Promise.all([
    generarHash(usuario.contrasena, contrasenaSal),
    generarHash(normalizarRespuesta(RESPUESTA_PRUEBA), respuestaSal),
  ]);

  return {
    id: existente?.id ?? generarId(),
    nombre: usuario.nombre,
    correo: normalizarCorreo(usuario.correo),
    contrasenaHash,
    contrasenaSal,
    preguntaSeguridad: PREGUNTA_PRUEBA,
    respuestaHash,
    respuestaSal,
    rol: usuario.rol,
    creadoEn: existente?.creadoEn ?? new Date().toISOString(),
  };
}

async function necesitaReparacion(
  guardado: StoredUser,
  usuario: UsuarioPrueba,
): Promise<boolean> {
  if (
    !guardado.contrasenaHash ||
    !guardado.contrasenaSal ||
    !guardado.respuestaHash ||
    !guardado.respuestaSal ||
    guardado.preguntaSeguridad !== PREGUNTA_PRUEBA ||
    guardado.rol !== usuario.rol
  ) {
    return true;
  }

  try {
    const hash = await generarHash(usuario.contrasena, guardado.contrasenaSal);
    return !compararSeguro(hash, guardado.contrasenaHash);
  } catch {
    return true;
  }
}

/**
 * Las cuentas de prueba son administradas por la app: si ya existían con otra
 * contraseña, con un rol distinto o con campos incompletos, se reparan.
 * Así se evita el error "Correo o contraseña incorrectos" tras cambiar de
 * versión o haber registrado previamente el mismo correo.
 */
async function sembrarUsuariosPrueba(): Promise<void> {
  const usuarios = await leerUsuarios();
  let huboCambios = false;

  const resultantes = await Promise.all(
    usuarios.map(async (guardado): Promise<StoredUser> => {
      const demo = USUARIOS_PRUEBA.find(
        (usuario) => normalizarCorreo(usuario.correo) === guardado.correo,
      );
      if (!demo || !(await necesitaReparacion(guardado, demo))) {
        return guardado;
      }
      huboCambios = true;
      return construirUsuarioPrueba(demo, guardado);
    }),
  );

  for (const demo of USUARIOS_PRUEBA) {
    const correo = normalizarCorreo(demo.correo);
    if (!resultantes.some((usuario) => usuario.correo === correo)) {
      resultantes.push(await construirUsuarioPrueba(demo));
      huboCambios = true;
    }
  }

  if (huboCambios) {
    await guardarUsuarios(resultantes);
  }
}

/** Siembra las cuentas de prueba una sola vez por sesión de app. */
async function asegurarUsuariosPrueba(): Promise<void> {
  if (!promesaUsuariosPrueba) {
    promesaUsuariosPrueba = sembrarUsuariosPrueba()
      .then(() => undefined)
      .catch((error) => {
        console.warn('[auth.storage] No se pudieron sembrar usuarios de prueba', error);
      });
  }
  await promesaUsuariosPrueba;
}

/** Fuerza la reparación de las cuentas de prueba sin reiniciar la app. */
export async function restablecerCuentasPrueba(): Promise<void> {
  promesaUsuariosPrueba = null;
  await asegurarUsuariosPrueba();
}

async function obtenerUsuarios(): Promise<StoredUser[]> {
  await asegurarUsuariosPrueba();
  return leerUsuarios();
}

async function guardarUsuarios(usuarios: StoredUser[]): Promise<void> {
  try {
    await AsyncStorage.setItem(USUARIOS_KEY, JSON.stringify(usuarios));
  } catch {
    throw new Error(
      'No se pudo guardar la cuenta en el dispositivo. Verifica el espacio disponible.',
    );
  }
}

async function buscarUsuarioPorCorreo(
  correo: string,
): Promise<StoredUser | null> {
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

  try {
    const contrasenaSal = generarSal();
    const respuestaSal = generarSal();
    const [contrasenaHash, respuestaHash] = await Promise.all([
      generarHash(datos.contrasena, contrasenaSal),
      generarHash(normalizarRespuesta(datos.respuestaSeguridad), respuestaSal),
    ]);

    const usuario: StoredUser = {
      id: generarId(),
      nombre: datos.nombre.trim(),
      correo,
      contrasenaHash,
      contrasenaSal,
      preguntaSeguridad: datos.preguntaSeguridad.trim(),
      respuestaHash,
      respuestaSal,
      rol: datos.rol,
      creadoEn: new Date().toISOString(),
    };

    await guardarUsuarios([...usuarios, usuario]);
    return { ok: true, datos: aUsuarioPublico(usuario) };
  } catch (error) {
    return {
      ok: false,
      error: mensajeError(error, 'No se pudo crear la cuenta. Inténtalo de nuevo.'),
    };
  }
}

export async function iniciarSesion(
  correo: string,
  contrasena: string,
): Promise<Resultado<AuthUser>> {
  const usuario = await buscarUsuarioPorCorreo(correo);
  if (!usuario) {
    return { ok: false, error: 'Correo o contraseña incorrectos' };
  }

  try {
    const hashIngresado = await generarHash(contrasena, usuario.contrasenaSal);
    if (!compararSeguro(hashIngresado, usuario.contrasenaHash)) {
      return { ok: false, error: 'Correo o contraseña incorrectos' };
    }

    const publico = aUsuarioPublico(usuario);
    await setSecureItem(TOKEN_KEY, `local_${generarId()}`);
    await setSecureItem(USER_KEY, JSON.stringify(publico));
    return { ok: true, datos: publico };
  } catch {
    return {
      ok: false,
      error: 'No se pudo iniciar sesión. Inténtalo de nuevo.',
    };
  }
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

  try {
    const hashIngresado = await generarHash(
      normalizarRespuesta(respuesta),
      usuario.respuestaSal,
    );
    if (!compararSeguro(hashIngresado, usuario.respuestaHash)) {
      return { ok: false, error: 'La respuesta de seguridad no es correcta' };
    }
    return { ok: true, datos: true };
  } catch {
    return { ok: false, error: 'No se pudo verificar la respuesta. Inténtalo de nuevo.' };
  }
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

  try {
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
      contrasenaSal,
      contrasenaHash,
    };

    await guardarUsuarios(usuariosActualizados);
    return { ok: true, datos: true };
  } catch (error) {
    return {
      ok: false,
      error: mensajeError(error, 'No se pudo actualizar la contraseña. Inténtalo de nuevo.'),
    };
  }
}

export async function obtenerUsuarioPorId(id: string): Promise<AuthUser | null> {
  const usuarios = await obtenerUsuarios();
  const usuario = usuarios.find((item) => item.id === id);
  if (!usuario) return null;

  const publico = aUsuarioPublico(usuario);
  await setSecureItem(USER_KEY, JSON.stringify(publico));
  return publico;
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
  await setSecureItem(SESION_KEY, JSON.stringify(sesion));
}

let verificacionInicialHecha = false;

/**
 * Devuelve la sesión guardada. En el primer acceso tras abrir la app, las
 * sesiones sin "Recordarme" se descartan para volver a pedir el login.
 */
export async function obtenerSesion(): Promise<StoredSession | null> {
  try {
    const crudo = await getSecureItem(SESION_KEY);
    const sesion: StoredSession | null = crudo ? JSON.parse(crudo) : null;
    const primeraLectura = !verificacionInicialHecha;
    verificacionInicialHecha = true;

    if (!sesion?.userId || (primeraLectura && !sesion.recordarme)) {
      await borrarSesion();
      return null;
    }
    return sesion;
  } catch {
    verificacionInicialHecha = true;
    await borrarSesion();
    return null;
  }
}

export async function borrarSesion(): Promise<void> {
  await Promise.all(
    [SESION_KEY, TOKEN_KEY, USER_KEY].map((key) => deleteSecureItem(key)),
  );
}
