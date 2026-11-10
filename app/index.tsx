import React from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '../src/presentation/context/AuthContext';
import { LoadingScreen } from '../src/presentation/components/ui/LoadingScreen';

export default function IndexScreen() {
  const { usuario, cargando } = useAuth();

  if (cargando) {
    return <LoadingScreen mensaje="Cargando sesión..." />;
  }

  return (
    <Redirect href={usuario ? '/(tabs)/rutas' : '/(auth)/login'} />
  );
}
