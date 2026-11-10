import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface Props {
  mensaje: string;
  tipo?: 'exito' | 'error' | 'info';
}

const ESTILOS = {
  exito: {
    contenedor: '#dcfce7',
    borde: '#16a34a',
    texto: '#166534',
  },
  error: {
    contenedor: '#fee2e2',
    borde: '#dc2626',
    texto: '#991b1b',
  },
  info: {
    contenedor: '#eff6ff',
    borde: '#1e3a8a',
    texto: '#1e3a8a',
  },
} as const;

export const MessageBanner: React.FC<Props> = ({ mensaje, tipo = 'info' }) => {
  const colores = ESTILOS[tipo];

  return (
    <View
      style={[
        styles.contenedor,
        {
          backgroundColor: colores.contenedor,
          borderLeftColor: colores.borde,
        },
      ]}
      accessibilityRole="alert"
    >
      <Text style={[styles.texto, { color: colores.texto }]}>{mensaje}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  contenedor: {
    borderLeftWidth: 4,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  texto: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
});
