import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { RouteModel } from '../../domain/entities/route.model';

interface Props {
  route: RouteModel;
  onPress: (route: RouteModel) => void;
  isSelected?: boolean;
}

export const RouteCard: React.FC<Props> = ({ route, onPress, isSelected }) => {
  return (
    <TouchableOpacity
      style={[styles.card, isSelected && styles.selectedCard]}
      onPress={() => onPress(route)}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{route.origenNombre} → {route.destinoNombre}</Text>
        <Text style={[styles.status, route.estado === 'retrasada' && styles.statusDelayed]}>
          {route.estado.toUpperCase()}
        </Text>
      </View>

      <View style={styles.details}>
        <Text style={styles.detailText}>Distancia: {route.distanciaTotalKm} km</Text>
        <Text style={styles.detailText}>Tiempo Base: {route.tiempoEstimadoBaseMin} min</Text>
        <Text style={styles.detailText}>
          ETA Pactado: {new Date(route.etaPactado).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    elevation: 2,
  },
  selectedCard: {
    borderColor: '#1e3a8a',
    backgroundColor: '#eff6ff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
  },
  status: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#059669',
  },
  statusDelayed: {
    color: '#dc2626',
  },
  details: {
    flexDirection: 'column',
    gap: 4,
  },
  detailText: {
    fontSize: 13,
    color: '#4b5563',
  },
});
