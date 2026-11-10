import React, { useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export const LogoutButton: React.FC = () => {
  const { logout } = useAuth();
  const [saliendo, setSaliendo] = useState(false);

  const handleLogout = async () => {
    setSaliendo(true);
    try {
      await logout();
    } catch {
      setSaliendo(false);
    }
  };

  return (
    <TouchableOpacity
      style={styles.boton}
      onPress={handleLogout}
      disabled={saliendo}
      accessibilityRole="button"
      accessibilityLabel="Cerrar sesión"
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      {saliendo ? (
        <ActivityIndicator size="small" color="#ffffff" />
      ) : (
        <Text style={styles.texto}>Cerrar sesión</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  boton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  texto: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
});
