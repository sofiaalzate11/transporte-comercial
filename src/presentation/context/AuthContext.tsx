import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  AuthUser,
  RegistroDatos,
  Resultado,
  ResultadoAccion,
} from '../../domain/entities/auth.model';
import {
  borrarSesion,
  crearUsuario,
  guardarSesion,
  iniciarSesion,
  obtenerPreguntaSeguridad,
  obtenerSesion,
  obtenerUsuarioPorId,
  restablecerContrasena,
  verificarRespuestaSeguridad,
} from '../../data/services/auth.storage';
import { validarContrasena } from '../../shared/utils/auth.validation';

interface AuthContextValue {
  usuario: AuthUser | null;
  cargando: boolean;
  login: (
    correo: string,
    contrasena: string,
    recordarme: boolean,
  ) => Promise<ResultadoAccion>;
  registrar: (datos: RegistroDatos) => Promise<ResultadoAccion>;
  logout: () => Promise<void>;
  obtenerPregunta: (correo: string) => Promise<Resultado<string>>;
  verificarRespuesta: (
    correo: string,
    respuesta: string,
  ) => Promise<ResultadoAccion>;
  recuperar: (
    correo: string,
    respuesta: string,
    nuevaContrasena: string,
  ) => Promise<ResultadoAccion>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<AuthUser | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activo = true;

    const restaurarSesion = async () => {
      try {
        const sesion = await obtenerSesion();
        if (!sesion) {
          return;
        }

        const usuarioGuardado = await obtenerUsuarioPorId(sesion.userId);
        if (usuarioGuardado) {
          if (activo) {
            setUsuario(usuarioGuardado);
          }
        } else {
          await borrarSesion();
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    };

    restaurarSesion();

    return () => {
      activo = false;
    };
  }, []);

  const login = useCallback(
    async (
      correo: string,
      contrasena: string,
      recordarme: boolean,
    ): Promise<ResultadoAccion> => {
      const resultado = await iniciarSesion(correo, contrasena);
      if (!resultado.ok) {
        return { ok: false, error: resultado.error };
      }

      try {
        await guardarSesion(resultado.datos.id, recordarme);
      } catch {
        return {
          ok: false,
          error: 'No se pudo guardar la sesión. Inténtalo de nuevo.',
        };
      }

      setUsuario(resultado.datos);
      return { ok: true };
    },
    [],
  );

  const registrar = useCallback(
    async (datos: RegistroDatos): Promise<ResultadoAccion> => {
      const resultado = await crearUsuario(datos);
      if (!resultado.ok) {
        return { ok: false, error: resultado.error };
      }
      return { ok: true };
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await borrarSesion();
    } finally {
      setUsuario(null);
    }
  }, []);

  const obtenerPregunta = useCallback(
    (correo: string) => obtenerPreguntaSeguridad(correo),
    [],
  );

  const verificarRespuesta = useCallback(
    async (correo: string, respuesta: string): Promise<ResultadoAccion> => {
      const resultado = await verificarRespuestaSeguridad(correo, respuesta);
      if (!resultado.ok) {
        return { ok: false, error: resultado.error };
      }
      return { ok: true };
    },
    [],
  );

  const recuperar = useCallback(
    async (
      correo: string,
      respuesta: string,
      nuevaContrasena: string,
    ): Promise<ResultadoAccion> => {
      const errorContrasena = validarContrasena(nuevaContrasena);
      if (errorContrasena) {
        return { ok: false, error: errorContrasena };
      }

      const resultado = await restablecerContrasena(
        correo,
        respuesta,
        nuevaContrasena,
      );
      if (!resultado.ok) {
        return { ok: false, error: resultado.error };
      }
      return { ok: true };
    },
    [],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      usuario,
      cargando,
      login,
      registrar,
      logout,
      obtenerPregunta,
      verificarRespuesta,
      recuperar,
    }),
    [
      usuario,
      cargando,
      login,
      registrar,
      logout,
      obtenerPregunta,
      verificarRespuesta,
      recuperar,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const contexto = useContext(AuthContext);
  if (!contexto) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return contexto;
}
