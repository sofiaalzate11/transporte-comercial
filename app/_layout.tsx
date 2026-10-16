import React from 'react';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#0F172A',
          },
          headerTintColor: '#F8FAFC',
          headerTitleStyle: {
            fontWeight: '700',
          },
          contentStyle: {
            backgroundColor: '#0B1120',
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'Transporte Colombia',
          }}
        />
        <Stack.Screen
          name="alerts"
          options={{
            title: 'Alertas Viales #767',
          }}
        />
        <Stack.Screen
          name="tolls"
          options={{
            title: 'Peajes y Tarifas SODA',
          }}
        />
        
    <Stack.Screen
      name="reports"
      options={{
        title: 'Mis Reportes de Incidentes',
      }}
/>

      </Stack>
    </QueryClientProvider>
  );
}
