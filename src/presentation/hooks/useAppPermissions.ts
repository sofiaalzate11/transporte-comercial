import { useState, useEffect } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import * as Location from 'expo-location';

export interface PermissionsState {
  hasLocationPermission: boolean;
  isLoading: boolean;
  canAskAgain: boolean;
  requestLocationPermission: () => Promise<boolean>;
  openDeviceSettings: () => Promise<void>;
}

export function useAppPermissions(): PermissionsState {
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [canAskAgain, setCanAskAgain] = useState(true);

  const checkAndRequest = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      // 1. Verificar estado actual del permiso de ubicación
      const current = await Location.getForegroundPermissionsAsync();

      if (current.granted) {
        setHasLocationPermission(true);
        setIsLoading(false);
        return true;
      }

      // 2. Si no está otorgado, solicitarlo al usuario
      if (current.canAskAgain) {
        const response = await Location.requestForegroundPermissionsAsync();
        const granted = response.granted;
        setHasLocationPermission(granted);
        setCanAskAgain(response.canAskAgain);

        if (!granted && !response.canAskAgain) {
          showDeniedAlert();
        }
        setIsLoading(false);
        return granted;
      } else {
        setCanAskAgain(false);
        showDeniedAlert();
        setIsLoading(false);
        return false;
      }
    } catch {
      setIsLoading(false);
      return false;
    }
  };

  const showDeniedAlert = () => {
    Alert.alert(
      'Permiso de Ubicación Requerido',
      'Transporte Colombia necesita acceder a tu ubicación GPS para detectar alertas viales cercanas y calcular rutas en tiempo real.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Abrir Configuración', onPress: openDeviceSettings },
      ]
    );
  };

  const openDeviceSettings = async () => {
    if (Platform.OS === 'ios') {
      await Linking.openURL('app-settings:');
    } else {
      await Linking.openSettings();
    }
  };

  useEffect(() => {
    let isMounted = true;
    checkAndRequest().then((granted) => {
      if (isMounted) {
        setHasLocationPermission(granted);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  return {
    hasLocationPermission,
    isLoading,
    canAskAgain,
    requestLocationPermission: checkAndRequest,
    openDeviceSettings,
  };
}