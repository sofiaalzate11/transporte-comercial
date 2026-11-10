import React from 'react';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '../src/presentation/context/AuthContext';
import { LoadingScreen } from '../src/presentation/components/ui/LoadingScreen';

const queryClient = new QueryClient();

function Navegacion() {
  const { cargando } = useAuth();

  if (cargando) {
    return <LoadingScreen mensaje="Cargando sesión..." />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Navegacion />
      </AuthProvider>
    </QueryClientProvider>
  );
}
