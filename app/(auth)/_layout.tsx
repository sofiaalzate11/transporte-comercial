import React from 'react';
import { Redirect, Stack } from 'expo-router';
import { useAuth } from '../../src/presentation/context/AuthContext';

export default function AuthLayout() {
  const { usuario } = useAuth();

  if (usuario) {
    return <Redirect href="/(tabs)/rutas" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
