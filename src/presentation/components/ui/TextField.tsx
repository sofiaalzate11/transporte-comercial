import React, { useState } from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

interface Props extends TextInputProps {
  label: string;
  error?: string;
  esContrasena?: boolean;
  contenedorStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
}

export const TextField: React.FC<Props> = ({
  label,
  error,
  esContrasena = false,
  contenedorStyle,
  inputStyle,
  ...inputProps
}) => {
  const [oculta, setOculta] = useState(true);

  return (
    <View style={[styles.contenedor, contenedorStyle]}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputRow, error ? styles.inputRowError : null]}>
        <TextInput
          style={[styles.input, inputStyle]}
          placeholderTextColor="#94a3b8"
          secureTextEntry={esContrasena ? oculta : false}
          {...inputProps}
        />
        {esContrasena ? (
          <TouchableOpacity
            onPress={() => setOculta((valor) => !valor)}
            style={styles.toggle}
            accessibilityRole="button"
            accessibilityLabel={oculta ? 'Mostrar contraseña' : 'Ocultar contraseña'}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.toggleText}>
              {oculta ? 'Mostrar' : 'Ocultar'}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  contenedor: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    backgroundColor: '#f8fafc',
  },
  inputRowError: {
    borderColor: '#dc2626',
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0f172a',
  },
  toggle: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderLeftWidth: 1,
    borderLeftColor: '#e2e8f0',
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1e3a8a',
  },
  error: {
    marginTop: 5,
    fontSize: 12,
    color: '#dc2626',
  },
});
