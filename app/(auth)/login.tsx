import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../src/presentation/context/AuthContext';
import { AuthScreen } from '../../src/presentation/components/ui/AuthScreen';
import { Button } from '../../src/presentation/components/ui/Button';
import { Checkbox } from '../../src/presentation/components/ui/Checkbox';
import { MessageBanner } from '../../src/presentation/components/ui/MessageBanner';
import { TextField } from '../../src/presentation/components/ui/TextField';
import {
  validarContrasena,
  validarCorreo,
} from '../../src/shared/utils/auth.validation';

type ErroresLogin = {
  correo?: string;
  contrasena?: string;
};

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const params = useLocalSearchParams<{ correo?: string; mensaje?: string }>();

  const correoParam = Array.isArray(params.correo) ? params.correo[0] : params.correo;
  const mensajeParam = Array.isArray(params.mensaje)
    ? params.mensaje[0]
    : params.mensaje;

  const [correo, setCorreo] = useState(correoParam ?? '');
  const [contrasena, setContrasena] = useState('');
  const [recordarme, setRecordarme] = useState(false);
  const [errores, setErrores] = useState<ErroresLogin>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(
    mensajeParam ?? null,
  );
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (correoParam) {
      setCorreo(correoParam);
    }
  }, [correoParam]);

  useEffect(() => {
    if (mensajeParam) {
      setMensajeExito(mensajeParam);
    }
  }, [mensajeParam]);

  const handleLogin = async () => {
    const nuevosErrores: ErroresLogin = {
      correo: validarCorreo(correo) ?? undefined,
      contrasena: contrasena ? undefined : 'Ingresa tu contraseña',
    };

    setErrores(nuevosErrores);
    setErrorGeneral(null);
    setMensajeExito(null);

    if (nuevosErrores.correo || nuevosErrores.contrasena) {
      return;
    }

    setEnviando(true);
    const resultado = await login(correo.trim(), contrasena, recordarme);
    setEnviando(false);

    if (!resultado.ok) {
      setErrorGeneral(resultado.error);
    }
  };

  return (
    <AuthScreen
      titulo="Transporte Colombia"
      subtitulo="Monitoreo vial y control de retrasos"
    >
      {mensajeExito ? (
        <MessageBanner mensaje={mensajeExito} tipo="exito" />
      ) : null}

      {errorGeneral ? (
        <MessageBanner mensaje={errorGeneral} tipo="error" />
      ) : null}

      <TextField
        label="Correo electrónico"
        placeholder="correo@ejemplo.com"
        value={correo}
        onChangeText={(valor) => {
          setCorreo(valor);
          if (errores.correo) {
            setErrores((previos) => ({ ...previos, correo: undefined }));
          }
        }}
        error={errores.correo}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        textContentType="emailAddress"
        editable={!enviando}
      />

      <TextField
        label="Contraseña"
        placeholder="••••••••"
        value={contrasena}
        onChangeText={(valor) => {
          setContrasena(valor);
          if (errores.contrasena) {
            setErrores((previos) => ({ ...previos, contrasena: undefined }));
          }
        }}
        error={errores.contrasena}
        esContrasena
        autoCapitalize="none"
        autoCorrect={false}
        textContentType="password"
        editable={!enviando}
        onSubmitEditing={handleLogin}
      />

      <View style={styles.filaOpciones}>
        <Checkbox
          checked={recordarme}
          onChange={setRecordarme}
          label="Recordarme"
        />
        <TouchableOpacity
          onPress={() => router.push('/(auth)/recuperar')}
          accessibilityRole="button"
        >
          <Text style={styles.enlace}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>
      </View>

      <Button
        title="Iniciar sesión"
        onPress={handleLogin}
        cargando={enviando}
        style={styles.botonPrincipal}
      />

      <View style={styles.pie}>
        <Text style={styles.pieTexto}>¿No tienes cuenta?</Text>
        <TouchableOpacity
          onPress={() => router.push('/(auth)/registro')}
          accessibilityRole="button"
        >
          <Text style={styles.enlacePie}>Crear cuenta</Text>
        </TouchableOpacity>
      </View>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  filaOpciones: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 4,
    flexWrap: 'wrap',
    rowGap: 8,
  },
  enlace: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e3a8a',
  },
  botonPrincipal: {
    marginTop: 20,
  },
  pie: {
    marginTop: 22,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  pieTexto: {
    fontSize: 13,
    color: '#64748b',
  },
  enlacePie: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
});
