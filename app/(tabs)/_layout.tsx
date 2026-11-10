import React from 'react';
import { Redirect, Tabs } from 'expo-router';
import { Text } from 'react-native';
import { useAuth } from '../../src/presentation/context/AuthContext';
import { LogoutButton } from '../../src/presentation/components/LogoutButton';

export default function TabsLayout() {
  const { usuario } = useAuth();

  if (!usuario) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: '#1e3a8a' },
        headerTintColor: '#ffffff',
        headerTitleStyle: { fontWeight: 'bold' },
        headerRight: () => <LogoutButton />,
        tabBarActiveTintColor: '#1e3a8a',
        tabBarInactiveTintColor: '#64748b',
      }}
    >
      <Tabs.Screen
        name="rutas"
        options={{
          title: 'Mis Rutas',
          tabBarLabel: 'Rutas',
          tabBarIcon: () => <Text style={{ fontSize: 16 }}>📋</Text>,
        }}
      />
      <Tabs.Screen
        name="mapa"
        options={{
          title: 'Mapa Vial',
          tabBarLabel: 'Mapa',
          tabBarIcon: () => <Text style={{ fontSize: 16 }}>🗺️</Text>,
        }}
      />
    </Tabs>
  );
}
