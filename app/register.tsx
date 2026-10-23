import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/presentation/hooks/useAuth';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading, error } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim()) {
      Alert.alert('Campos incompletos', 'Nombre y correo son obligatorios');
      return;
    }

    try {
      await register(email.trim(), fullName.trim(), vehiclePlate.trim());
      router.push({
        pathname: '/verify-otp',
        params: { email: email.trim().toLowerCase(), flow: 'register' },
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al registrar conductor';
      Alert.alert('Registro', msg);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.card}>
        <Text style={styles.title}>Registro de Conductor</Text>
        <Text style={styles.subtitle}>
          Crea tu perfil de transportador comercial con validación oficial por correo.
        </Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Text style={styles.label}>Nombre y Apellidos</Text>
        <TextInput
          style={styles.input}
          placeholder="Juan Pérez"
          placeholderTextColor="#64748B"
          value={fullName}
          onChangeText={setFullName}
          editable={!isLoading}
        />

        <Text style={styles.label}>Correo Electrónico Corporativo</Text>
        <TextInput
          style={styles.input}
          placeholder="juan.perez@transporte.co"
          placeholderTextColor="#64748B"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          editable={!isLoading}
        />

        <Text style={styles.label}>Placa del Vehículo de Carga (Opcional)</Text>
        <TextInput
          style={styles.input}
          placeholder="SZK-456"
          placeholderTextColor="#64748B"
          autoCapitalize="characters"
          value={vehiclePlate}
          onChangeText={setVehiclePlate}
          editable={!isLoading}
        />

        <TouchableOpacity
          style={[styles.primaryBtn, isLoading && styles.btnDisabled]}
          onPress={handleRegister}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryBtnText}>Crear Cuenta y Validar Código</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>¿Ya tienes una cuenta?</Text>
          <TouchableOpacity onPress={() => router.push('/login')}>
            <Text style={styles.linkText}>Ingresar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    backgroundColor: '#090D16',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  title: {
    color: '#F8FAFC',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6,
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 20,
  },
  label: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#090D16',
    color: '#F8FAFC',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1E293B',
    fontSize: 15,
    marginBottom: 16,
  },
  primaryBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    marginBottom: 12,
    backgroundColor: '#EF444420',
    padding: 8,
    borderRadius: 6,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
  },
  footerText: {
    color: '#64748B',
    fontSize: 13,
  },
  linkText: {
    color: '#38BDF8',
    fontSize: 13,
    fontWeight: '700',
  },
});
