import React from 'react';
import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: '#1e3a8a' },
        headerTintColor: '#ffffff',
        tabBarActiveTintColor: '#1e3a8a',
        tabBarInactiveTintColor: '#64748b',
        headerTitleStyle: { fontWeight: 'bold' },
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
