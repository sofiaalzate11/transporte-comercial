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
  validarRequerido,
} from '../../src/shared/utils/auth.validation';

const PREGUNTAS_SEGURIDAD = [
  '¿Cuál es el nombre de tu primera mascota?',
  '¿Cuál es el nombre de tu ciudad natal?',
  '¿Cuál es el nombre de tu mejor amigo de la infancia?',
  '¿Cuál es tu plato favorito?',
];

type ErroresRegistro = Partial<
  Record<
    'nombre' | 'correo' | 'contrasena' | 'confirmar' | 'pregunta' | 'respuesta',
    string
  >
>;

export default function RegistroScreen() {
  const router = useRouter();
  const { registrar } = useAuth();

  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [pregunta, setPregunta] = useState('');
  const [respuesta, setRespuesta] = useState('');
  const [errores, setErrores] = useState<ErroresRegistro>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const limpiarError = (campo: keyof ErroresRegistro) => {
    if (errores[campo]) {
      setErrores((previos) => ({ ...previos, [campo]: undefined }));
    }
  };

  const validar = (): ErroresRegistro => {
    const nuevosErrores: ErroresRegistro = {
      nombre: validarRequerido(nombre, 'Ingresa tu nombre') ?? undefined,
      correo: validarCorreo(correo) ?? undefined,
      contrasena: validarContrasena(contrasena) ?? undefined,
      confirmar: !confirmar
        ? 'Confirma tu contraseña'
        : contrasena !== confirmar
          ? 'Las contraseñas no coinciden'
          : undefined,
      pregunta: pregunta ? undefined : 'Selecciona una pregunta de seguridad',
      respuesta:
        validarRequerido(
          respuesta,
          'Ingresa la respuesta de seguridad',
        ) ?? undefined,
    };

    return nuevosErrores;
  };

  const handleRegistro = async () => {
    const nuevosErrores = validar();
    setErrores(nuevosErrores);
    setErrorGeneral(null);

    if (Object.values(nuevosErrores).some(Boolean)) {
      return;
    }

    setEnviando(true);
    const resultado = await registrar({
      nombre: nombre.trim(),
      correo: correo.trim(),
      contrasena,
      preguntaSeguridad: pregunta,
      respuestaSeguridad: respuesta,
    });
    setEnviando(false);

    if (!resultado.ok) {
      if (resultado.error === 'Este correo ya está registrado') {
        setErrores((previos) => ({
          ...previos,
          correo: resultado.error,
        }));
      } else {
        setErrorGeneral(resultado.error);
      }
      return;
    }

    router.replace({
      pathname: '/(auth)/login',
      params: {
        correo: correo.trim().toLowerCase(),
        mensaje:
          '¡Cuenta creada! Ya puedes iniciar sesión con tu correo y contraseña',
      },
    });
  };

  return (
    <AuthScreen
      titulo="Crear cuenta"
      subtitulo="Registra tus datos para ingresar a la aplicación"
    >
      {errorGeneral ? (
        <MessageBanner mensaje={errorGeneral} tipo="error" />
      ) : null}

      <TextField
        label="Nombre completo"
        placeholder="Ej: Juan Pérez"
        value={nombre}
        onChangeText={(valor) => {
          setNombre(valor);
          limpiarError('nombre');
        }}
        error={errores.nombre}
        autoCapitalize="words"
        textContentType="name"
        editable={!enviando}
      />

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
        editable={!enviando}
      />

      <TextField
        label="Contraseña"
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
        editable={!enviando}
      />

      <TextField
        label="Confirmar contraseña"
        placeholder="Repite tu contraseña"
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
        editable={!enviando}
      />

      <View style={styles.bloquePregunta}>
        <Text style={styles.etiqueta}>Pregunta de seguridad</Text>
        <View style={styles.listaPreguntas}>
          {PREGUNTAS_SEGURIDAD.map((opcion) => {
            const seleccionada = pregunta === opcion;
            return (
              <TouchableOpacity
                key={opcion}
                style={[
                  styles.opcionPregunta,
                  seleccionada && styles.opcionSeleccionada,
                ]}
                onPress={() => {
                  setPregunta(opcion);
                  limpiarError('pregunta');
                }}
                disabled={enviando}
                activeOpacity={0.8}
                accessibilityRole="radio"
                accessibilityState={{ selected: seleccionada }}
              >
                <View style={[styles.radio, seleccionada && styles.radioActivo]}>
                  {seleccionada ? <View style={styles.radioPunto} /> : null}
                </View>
                <Text
                  style={[
                    styles.textoPregunta,
                    seleccionada && styles.textoPreguntaSeleccionada,
                  ]}
                >
                  {opcion}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {errores.pregunta ? (
          <Text style={styles.errorPregunta}>{errores.pregunta}</Text>
        ) : null}
      </View>

      <TextField
        label="Respuesta de seguridad"
        placeholder="Tu respuesta"
        value={respuesta}
        onChangeText={(valor) => {
          setRespuesta(valor);
          limpiarError('respuesta');
        }}
        error={errores.respuesta}
        autoCapitalize="sentences"
        editable={!enviando}
      />

      <Text style={styles.ayuda}>
        La respuesta no distingue mayúsculas de minúsculas. La usarás para
        recuperar tu contraseña.
      </Text>

      <Button
        title="Crear cuenta"
        onPress={handleRegistro}
        cargando={enviando}
        style={styles.boton}
      />

      <View style={styles.pie}>
        <Text style={styles.pieTexto}>¿Ya tienes cuenta?</Text>
        <TouchableOpacity
          onPress={() => router.replace('/(auth)/login')}
          accessibilityRole="button"
          disabled={enviando}
        >
          <Text style={styles.enlacePie}>Iniciar sesión</Text>
        </TouchableOpacity>
      </View>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  bloquePregunta: {
    marginBottom: 14,
  },
  etiqueta: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  listaPreguntas: {
    gap: 8,
  },
  opcionPregunta: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  opcionSeleccionada: {
    borderColor: '#1e3a8a',
    backgroundColor: '#eff6ff',
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#94a3b8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    backgroundColor: '#ffffff',
  },
  radioActivo: {
    borderColor: '#1e3a8a',
  },
  radioPunto: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1e3a8a',
  },
  textoPregunta: {
    flex: 1,
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
  },
  textoPreguntaSeleccionada: {
    color: '#1e3a8a',
    fontWeight: '600',
  },
  errorPregunta: {
    marginTop: 5,
    fontSize: 12,
    color: '#dc2626',
  },
  ayuda: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 17,
    marginBottom: 4,
  },
  boton: {
    marginTop: 16,
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
