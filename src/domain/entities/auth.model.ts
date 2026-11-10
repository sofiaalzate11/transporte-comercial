export interface StoredUser {
  id: string;
  nombre: string;
  correo: string;
  contrasenaHash: string;
  contrasenaSal: string;
  preguntaSeguridad: string;
  respuestaHash: string;
  respuestaSal: string;
  creadoEn: string;
}

export interface AuthUser {
  id: string;
  nombre: string;
  correo: string;
}

export interface RegistroDatos {
  nombre: string;
  correo: string;
  contrasena: string;
  preguntaSeguridad: string;
  respuestaSeguridad: string;
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
