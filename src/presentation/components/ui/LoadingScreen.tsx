import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

interface Props {
  mensaje?: string;
}

export const LoadingScreen: React.FC<Props> = ({ mensaje = 'Cargando...' }) => {
  return (
    <View style={styles.contenedor}>
      <ActivityIndicator size="large" color="#1e3a8a" />
      <Text style={styles.texto}>{mensaje}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  texto: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
});
