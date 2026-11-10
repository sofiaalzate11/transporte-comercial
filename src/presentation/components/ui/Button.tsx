import React from 'react';
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';

interface Props {
  title: string;
  onPress: () => void;
  cargando?: boolean;
  deshabilitado?: boolean;
  variante?: 'primario' | 'secundario';
  style?: StyleProp<ViewStyle>;
}

export const Button: React.FC<Props> = ({
  title,
  onPress,
  cargando = false,
  deshabilitado = false,
  variante = 'primario',
  style,
}) => {
  const inactivo = cargando || deshabilitado;
  const esSecundario = variante === 'secundario';

  return (
    <TouchableOpacity
      style={[
        styles.base,
        esSecundario ? styles.secundario : styles.primario,
        inactivo ? styles.inactivo : null,
        style,
      ]}
      onPress={onPress}
      disabled={inactivo}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityState={{ disabled: inactivo, busy: cargando }}
    >
      {cargando ? (
        <ActivityIndicator color={esSecundario ? '#1e3a8a' : '#ffffff'} />
      ) : (
        <Text style={[styles.texto, esSecundario && styles.textoSecundario]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  primario: {
    backgroundColor: '#1e3a8a',
  },
  secundario: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#1e3a8a',
  },
  inactivo: {
    opacity: 0.6,
  },
  texto: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  textoSecundario: {
    color: '#1e3a8a',
  },
});
