import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../src/presentation/hooks/useAuth';

export default function VerifyOtpScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string; flow?: string }>();
  const email = params.email || '';

  const { verifyOtp, resendOtp, isLoading, error } = useAuth();
  const [code, setCode] = useState('');
  const [cooldown, setCooldown] = useState(60);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleVerify = async () => {
    if (!code.trim() || code.trim().length !== 6) {
      Alert.alert('Código incompleto', 'Ingrese los 6 dígitos numéricos del código');
      return;
    }

    try {
      await verifyOtp(email, code.trim());
      Alert.alert('Acceso Autorizado', 'Sesión iniciada con token JWT protegido.', [
        {
          text: 'Continuar',
          onPress: () => router.replace('/'),
        },
      ]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al validar código';
      Alert.alert('Validación Fallida', msg);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    try {
      await resendOtp(email);
      setCooldown(60);
      Alert.alert('Código Reenviado', `Se generó un nuevo código para ${email}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al reenviar código';
      Alert.alert('Límite de Solicitudes', msg);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.badgeRow}>
          <Text style={styles.badgeText}>Validación por Correo</Text>
        </View>

        <Text style={styles.title}>Verificar Código OTP</Text>
        <Text style={styles.subtitle}>
          Hemos enviado un código numérico de 6 dígitos a:
        </Text>
        <Text style={styles.emailHighlight}>{email}</Text>

        {email.toLowerCase() === 'conductor.prueba@transporte.co' ? (
          <TouchableOpacity
            style={styles.testHintBtn}
            onPress={() => setCode('767767')}
          >
            <Text style={styles.testHintText}>🔑 Código de prueba: 767767 (Tocar para rellenar)</Text>
          </TouchableOpacity>
        ) : null}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Text style={styles.label}>Código de 6 Dígitos</Text>
        <TextInput
          style={styles.otpInput}
          placeholder="000000"
          placeholderTextColor="#475569"
          keyboardType="number-pad"
          maxLength={6}
          value={code}
          onChangeText={(val) => setCode(val.replace(/\D/g, ''))}
          editable={!isLoading}
        />

        <TouchableOpacity
          style={[styles.primaryBtn, isLoading && styles.btnDisabled]}
          onPress={handleVerify}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryBtnText}>Validar y Activar Sesión</Text>
          )}
        </TouchableOpacity>

        <View style={styles.resendSection}>
          <Text style={styles.resendInfo}>¿No recibiste el código?</Text>
          <TouchableOpacity
            onPress={handleResend}
            disabled={cooldown > 0 || isLoading}
          >
            <Text style={[styles.resendBtnText, cooldown > 0 && styles.resendDisabled]}>
              {cooldown > 0
                ? `Reenviar en ${cooldown}s (Protección antispam)`
                : 'Reenviar código ahora'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  badgeRow: {
    alignSelf: 'flex-start',
    backgroundColor: '#0284C720',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 12,
  },
  badgeText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '700',
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
  },
  emailHighlight: {
    color: '#38BDF8',
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 16,
  },
  label: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  otpInput: {
    backgroundColor: '#090D16',
    color: '#34D399',
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 10,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 16,
  },
  primaryBtn: {
    backgroundColor: '#0284C7',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
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
  resendSection: {
    marginTop: 24,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 16,
  },
  resendInfo: {
    color: '#64748B',
    fontSize: 12,
    marginBottom: 6,
  },
  resendBtnText: {
    color: '#38BDF8',
    fontSize: 13,
    fontWeight: '700',
  },
  resendDisabled: {
    color: '#64748B',
  },
  testHintBtn: {
    backgroundColor: '#0284C715',
    borderWidth: 1,
    borderColor: '#0284C740',
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
    alignItems: 'center',
  },
  testHintText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
});
