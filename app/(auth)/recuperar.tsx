import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/presentation/context/AuthContext';
import { AuthScreen } from '../../src/presentation/components/ui/AuthScreen';
import { Button } from '../../src/presentation/components/ui/Button';
import { MessageBanner } from '../../src/presentation/components/ui/MessageBanner';
import { TextField } from '../../src/presentation/components/ui/TextField';
import {
  validarContrasena,
  validarCorreo,
} from '../../src/shared/utils/auth.validation';

type Fase = 'correo' | 'respuesta' | 'nueva';

type ErroresRecuperar = {
  correo?: string;
  respuesta?: string;
  contrasena?: string;
  confirmar?: string;
};

export default function RecuperarScreen() {
  const router = useRouter();
  const { obtenerPregunta, verificarRespuesta, recuperar } = useAuth();

  const [fase, setFase] = useState<Fase>('correo');
  const [correo, setCorreo] = useState('');
  const [pregunta, setPregunta] = useState('');
  const [respuesta, setRespuesta] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [errores, setErrores] = useState<ErroresRecuperar>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const limpiarError = (campo: keyof ErroresRecuperar) => {
    if (errores[campo]) {
      setErrores((previos) => ({ ...previos, [campo]: undefined }));
    }
  };

  const handleBuscarCuenta = async () => {
    const errorCorreo = validarCorreo(correo);
    setErrores({ correo: errorCorreo ?? undefined });
    setErrorGeneral(null);

    if (errorCorreo) {
      return;
    }

    setCargando(true);
    const resultado = await obtenerPregunta(correo.trim());
    setCargando(false);

    if (!resultado.ok) {
      setErrores({ correo: resultado.error });
      return;
    }

    setPregunta(resultado.datos);
    setFase('respuesta');
  };

  const handleVerificarRespuesta = async () => {
    const errorRespuesta = respuesta.trim()
      ? null
      : 'Ingresa la respuesta de seguridad';

    setErrores({ respuesta: errorRespuesta ?? undefined });
    setErrorGeneral(null);

    if (errorRespuesta) {
      return;
    }

    setCargando(true);
    const resultado = await verificarRespuesta(correo.trim(), respuesta);
    setCargando(false);

    if (!resultado.ok) {
      setErrores({ respuesta: resultado.error });
      return;
    }

    setFase('nueva');
  };

  const handleCambiarContrasena = async () => {
    const nuevosErrores: ErroresRecuperar = {
      contrasena: validarContrasena(contrasena) ?? undefined,
      confirmar: !confirmar
        ? 'Confirma tu nueva contraseña'
        : contrasena !== confirmar
          ? 'Las contraseñas no coinciden'
          : undefined,
    };

    setErrores(nuevosErrores);
    setErrorGeneral(null);

    if (nuevosErrores.contrasena || nuevosErrores.confirmar) {
      return;
    }

    setCargando(true);
    const resultado = await recuperar(
      correo.trim(),
      respuesta,
      contrasena,
    );
    setCargando(false);

    if (!resultado.ok) {
      setErrorGeneral(resultado.error);
      return;
    }

    router.replace({
      pathname: '/(auth)/login',
      params: {
        correo: correo.trim().toLowerCase(),
        mensaje:
          'Contraseña actualizada. Ya puedes iniciar sesión con tu nueva contraseña',
      },
    });
  };

  const reiniciar = () => {
    setFase('correo');
    setPregunta('');
    setRespuesta('');
    setContrasena('');
    setConfirmar('');
    setErrores({});
    setErrorGeneral(null);
  };

  return (
    <AuthScreen
      titulo="Recuperar contraseña"
      subtitulo="Responde tu pregunta de seguridad para definir una nueva contraseña"
    >
      {errorGeneral ? (
        <MessageBanner mensaje={errorGeneral} tipo="error" />
      ) : null}

      {fase === 'correo' ? (
        <>
          <TextField
            label="Correo electrónico"
            placeholder="correo@ejemplo.com"
            value={correo}
            onChangeText={(valor) => {
              setCorreo(valor);
              limpiarError('correo');
            }}
            error={errores.correo}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="emailAddress"
            editable={!cargando}
            onSubmitEditing={handleBuscarCuenta}
          />

          <Button
            title="Buscar cuenta"
            onPress={handleBuscarCuenta}
            cargando={cargando}
            style={styles.boton}
          />
        </>
      ) : null}

      {fase === 'respuesta' ? (
        <>
          <View style={styles.tarjetaPregunta}>
            <Text style={styles.etiquetaPregunta}>Pregunta de seguridad</Text>
            <Text style={styles.textoPregunta}>{pregunta}</Text>
          </View>

          <TextField
            label="Tu respuesta"
            placeholder="Escribe tu respuesta"
            value={respuesta}
            onChangeText={(valor) => {
              setRespuesta(valor);
              limpiarError('respuesta');
            }}
            error={errores.respuesta}
            autoCapitalize="sentences"
            editable={!cargando}
            onSubmitEditing={handleVerificarRespuesta}
          />

          <Button
            title="Verificar respuesta"
            onPress={handleVerificarRespuesta}
            cargando={cargando}
            style={styles.boton}
          />

          <TouchableOpacity
            onPress={reiniciar}
            style={styles.enlaceSecundario}
            accessibilityRole="button"
            disabled={cargando}
          >
            <Text style={styles.enlace}>Usar otro correo</Text>
          </TouchableOpacity>
        </>
      ) : null}

      {fase === 'nueva' ? (
        <>
          <MessageBanner
            mensaje="Respuesta correcta. Define tu nueva contraseña."
            tipo="exito"
          />

          <TextField
            label="Nueva contraseña"
            placeholder="Mínimo 8 caracteres"
            value={contrasena}
            onChangeText={(valor) => {
              setContrasena(valor);
              limpiarError('contrasena');
            }}
            error={errores.contrasena}
            esContrasena
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="newPassword"
            editable={!cargando}
          />

          <TextField
            label="Confirmar nueva contraseña"
            placeholder="Repite tu nueva contraseña"
            value={confirmar}
            onChangeText={(valor) => {
              setConfirmar(valor);
              limpiarError('confirmar');
            }}
            error={errores.confirmar}
            esContrasena
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="newPassword"
            editable={!cargando}
          />

          <Button
            title="Cambiar contraseña"
            onPress={handleCambiarContrasena}
            cargando={cargando}
            style={styles.boton}
          />

          <TouchableOpacity
            onPress={reiniciar}
            style={styles.enlaceSecundario}
            accessibilityRole="button"
            disabled={cargando}
          >
            <Text style={styles.enlace}>Usar otro correo</Text>
          </TouchableOpacity>
        </>
      ) : null}

      <View style={styles.pie}>
        <TouchableOpacity
          onPress={() => router.replace('/(auth)/login')}
          accessibilityRole="button"
          disabled={cargando}
        >
          <Text style={styles.enlacePie}>Volver al inicio de sesión</Text>
        </TouchableOpacity>
      </View>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  tarjetaPregunta: {
    backgroundColor: '#eff6ff',
    borderLeftWidth: 4,
    borderLeftColor: '#1e3a8a',
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
  },
  etiquetaPregunta: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  textoPregunta: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    lineHeight: 20,
  },
  boton: {
    marginTop: 8,
  },
  enlaceSecundario: {
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 4,
  },
  enlace: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e3a8a',
  },
  pie: {
    marginTop: 22,
    alignItems: 'center',
  },
  enlacePie: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
});
