export type RolUsuario = 'conductor' | 'operador' | 'consulta';

export interface StoredUser {
  id: string;
  nombre: string;
  correo: string;
  contrasenaHash: string;
  contrasenaSal: string;
  preguntaSeguridad: string;
  respuestaHash: string;
  respuestaSal: string;
  /** Opcional por compatibilidad con cuentas guardadas antes del selector de rol. */
  rol?: RolUsuario;
  creadoEn: string;
}

export interface AuthUser {
  id: string;
  nombre: string;
  correo: string;
  rol?: RolUsuario | string;
}

export interface RegistroDatos {
  nombre: string;
  correo: string;
  contrasena: string;
  preguntaSeguridad: string;
  respuestaSeguridad: string;
  rol: RolUsuario;
}

export interface StoredSession {
  userId: string;
  recordarme: boolean;
  creadoEn: string;
}

export type Resultado<T> =
  | { ok: true; datos: T }
  | { ok: false; error: string };

export type ResultadoAccion = { ok: true } | { ok: false; error: string };
