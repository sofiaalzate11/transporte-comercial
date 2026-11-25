import React, { useEffect, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { consultarRemesaDemo } from '../../data/services/tracking-demo.service';
import { ISeguimientoRemesa } from '../../shared/types';
import {
  normalizarCodigoManifiesto,
  validarCodigoManifiesto,
} from '../../shared/utils/manifiesto.validation';
import { Button } from './ui/Button';
import { MessageBanner } from './ui/MessageBanner';
import { TextField } from './ui/TextField';
import { DetalleCargaCliente } from './DetalleCargaCliente';

interface Props {
  visible: boolean;
  onClose: () => void;
  /** Inyectable para conectar el endpoint público real sin cambiar la UI. */
  consultarRemesa?: (codigo: string) => Promise<ISeguimientoRemesa>;
}

export const TrackingClienteModal: React.FC<Props> = ({
  visible,
  onClose,
  consultarRemesa = consultarRemesaDemo,
}) => {
  const [codigo, setCodigo] = useState('');
  const [errorCodigo, setErrorCodigo] = useState<string | undefined>();
  const [errorConsulta, setErrorConsulta] = useState<string | null>(null);
  const [buscando, setBuscando] = useState(false);
  const [seguimiento, setSeguimiento] = useState<ISeguimientoRemesa | null>(null);

  useEffect(() => {
    if (!visible) {
      setCodigo('');
      setErrorCodigo(undefined);
      setErrorConsulta(null);
      setSeguimiento(null);
      setBuscando(false);
    }
  }, [visible]);

  const handleBuscar = async () => {
    const error = validarCodigoManifiesto(codigo);
    setErrorCodigo(error ?? undefined);
    setErrorConsulta(null);

    if (error) {
      return;
    }

    setBuscando(true);
    try {
      const datos = await consultarRemesa(normalizarCodigoManifiesto(codigo));
      setSeguimiento(datos);
    } catch (err) {
      setSeguimiento(null);
      setErrorConsulta(
        err instanceof Error
          ? err.message
          : 'No se pudo consultar la remesa. Inténtalo de nuevo.',
      );
    } finally {
      setBuscando(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.contenedor}>
        <View style={styles.encabezado}>
          <View style={styles.titulos}>
            <Text style={styles.titulo}>Rastrea tu remesa</Text>
            <Text style={styles.subtitulo}>
              Consulta pública con tu código de manifiesto
            </Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Cerrar rastreo"
            style={styles.botonCerrar}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.textoCerrar}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator
        >
          <Text style={styles.ayuda}>
            Ingresa el código que aparece en tu manifiesto (MAN-XXXXX). No necesitas
            iniciar sesión como operador.
          </Text>

          <TextField
            label="Código de remesa"
            placeholder="MAN-10425"
            value={codigo}
            onChangeText={(valor) => {
              setCodigo(valor);
              setErrorCodigo(undefined);
            }}
            error={errorCodigo}
            autoCapitalize="characters"
            autoCorrect={false}
            editable={!buscando}
            onSubmitEditing={handleBuscar}
          />

          <Button
            title="Consultar estado"
            onPress={handleBuscar}
            cargando={buscando}
          />

          {errorConsulta ? (
            <View style={styles.mensaje}>
              <MessageBanner mensaje={errorConsulta} tipo="error" />
            </View>
          ) : null}

          {seguimiento ? (
            <DetalleCargaCliente seguimiento={seguimiento} />
          ) : null}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  encabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#1e3a8a',
  },
  titulos: {
    flex: 1,
    paddingRight: 12,
  },
  titulo: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  subtitulo: {
    marginTop: 2,
    fontSize: 12,
    color: '#bfdbfe',
  },
  botonCerrar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  textoCerrar: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },
  ayuda: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 19,
    marginBottom: 16,
  },
  mensaje: {
    marginTop: 16,
  },
});
