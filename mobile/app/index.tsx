import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/presentation/stores/auth.store';

export default function IndexScreen() {
  const router = useRouter();
  const { token, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading) {
      if (token) {
        router.replace('/(tabs)/rutas');
      } else {
        router.replace('/(auth)/login');
      }
    }
  }, [isLoading, token]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#1e3a8a" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
});
