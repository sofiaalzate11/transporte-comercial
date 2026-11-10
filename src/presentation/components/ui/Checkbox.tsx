import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}

export const Checkbox: React.FC<Props> = ({ checked, onChange, label }) => {
  return (
    <TouchableOpacity
      style={styles.contenedor}
      onPress={() => onChange(!checked)}
      activeOpacity={0.7}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={label}
    >
      <View style={[styles.caja, checked && styles.cajaMarcada]}>
        {checked ? <Text style={styles.marca}>✓</Text> : null}
      </View>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  contenedor: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  caja: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#94a3b8',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  cajaMarcada: {
    backgroundColor: '#1e3a8a',
    borderColor: '#1e3a8a',
  },
  marca: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
    lineHeight: 16,
  },
  label: {
    fontSize: 14,
    color: '#334155',
  },
});
