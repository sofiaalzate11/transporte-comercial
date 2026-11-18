import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoutesStore } from '../../src/presentation/stores/routes.store';
import { RouteCard } from '../../src/presentation/components/RouteCard';
import { useRouter } from 'expo-router';

const PRESET_ROUTES = [
  {
    origenNombre: 'Bogotá (Terminal Salitre)',
    origenLat: 4.6533,
    origenLon: -74.1089,
    destinoNombre: 'Medellín (Parque Industrial)',
    destinoLat: 6.2442,
    destinoLon: -75.5812,
    distanciaTotalKm: 420,
    tiempoEstimadoBaseMin: 480,
  },
  {
    origenNombre: 'Cali (Zona Franca)',
    origenLat: 3.4516,
    origenLon: -76.5320,
    destinoNombre: 'Buenaventura (Puerto Marítimo)',
    destinoLat: 3.8801,
    destinoLon: -77.0312,
    distanciaTotalKm: 125,
    tiempoEstimadoBaseMin: 150,
  },
  {
    origenNombre: 'Medellín (Centro Logístico)',
    origenLat: 6.2442,
    origenLon: -75.5812,
    destinoNombre: 'Manizales (Terminal)',
    destinoLat: 5.0689,
    destinoLon: -75.5174,
    distanciaTotalKm: 215,
    tiempoEstimadoBaseMin: 280,
  },
];

export default function RutasScreen() {
  const {
    rutas,
    cargando,
    cargarDatos,
    seleccionarRuta,
    rutaSeleccionada,
    evaluacionRetraso,
    crearRuta,
  } = useRoutesStore();
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [creando, setCreando] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleSelectRoute = (ruta: any) => {
    seleccionarRuta(ruta);
  };

  const handleOpenMap = () => {
    router.push('/(tabs)/mapa');
  };

  const handleCreatePreset = async (preset: typeof PRESET_ROUTES[0]) => {
    setCreando(true);
    const etaPactado = new Date(Date.now() + preset.tiempoEstimadoBaseMin * 60000).toISOString();
    await crearRuta({
      ...preset,
      etaPactado,
      estado: 'pendiente',
    });
    setCreando(false);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topActions}>
        <Text style={styles.headerTitle}>Rutas de Transporte ({rutas.length})</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="add-circle-outline" size={18} color="#ffffff" style={{ marginRight: 6 }} />
          <Text style={styles.addButtonText}>Nueva Ruta</Text>
        </TouchableOpacity>
      </View>

      {evaluacionRetraso && (
        <View
          style={[
            styles.alertBox,
            evaluacionRetraso.isDelayed ? styles.alertDelayed : styles.alertOk,
          ]}
        >
          <Text style={styles.alertTitle}>
            {evaluacionRetraso.isDelayed
              ? `ALERTA DE RETRASO: +${evaluacionRetraso.deltaMinutes} min`
              : 'TIEMPO ESTIMADO EN CRONOGRAMA'}
          </Text>
          <Text style={styles.alertSub}>
            Incidentes en ruta: {evaluacionRetraso.affectingIncidentsCount} | ETA:{' '}
            {new Date(evaluacionRetraso.recalculatedEta).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
          <TouchableOpacity style={styles.mapButton} onPress={handleOpenMap}>
            <Ionicons name="map-outline" size={14} color="#ffffff" style={{ marginRight: 4 }} />
            <Text style={styles.mapButtonText}>Ver en Mapa</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={rutas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RouteCard
            route={item}
            isSelected={rutaSeleccionada?.id === item.id}
            onPress={handleSelectRoute}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={cargando} onRefresh={cargarDatos} />
        }
        ListEmptyComponent={
          !cargando ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="trail-sign-outline" size={48} color="#94a3b8" />
              <Text style={styles.emptyText}>No hay rutas asignadas</Text>
              <TouchableOpacity style={styles.emptyButton} onPress={() => setModalVisible(true)}>
                <Text style={styles.emptyButtonText}>Crear Ruta de Carga</Text>
              </TouchableOpacity>
            </View>
          ) : undefined
        }
        contentContainerStyle={styles.listContent}
      />

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Crear Ruta de Prueba</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>
              Seleccione un corredor logístico nacional de carga:
            </Text>

            {PRESET_ROUTES.map((preset, index) => (
              <TouchableOpacity
                key={index}
                style={styles.presetItem}
                onPress={() => handleCreatePreset(preset)}
                disabled={creando}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.presetRoute}>{preset.origenNombre} → {preset.destinoNombre}</Text>
                  <Text style={styles.presetInfo}>{preset.distanciaTotalKm} km · {preset.tiempoEstimadoBaseMin / 60} horas estimadas</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#1e3a8a" />
              </TouchableOpacity>
            ))}

            {creando && (
              <View style={styles.loadingBox}>
                <ActivityIndicator color="#1e3a8a" />
                <Text style={{ marginLeft: 8, color: '#1e3a8a' }}>Guardando ruta...</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  topActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e3a8a',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  alertBox: {
    margin: 16,
    marginBottom: 8,
    padding: 14,
    borderRadius: 8,
  },
  alertDelayed: {
    backgroundColor: '#fee2e2',
    borderLeftWidth: 4,
    borderLeftColor: '#dc2626',
  },
  alertOk: {
    backgroundColor: '#dcfce7',
    borderLeftWidth: 4,
    borderLeftColor: '#16a34a',
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  alertSub: {
    fontSize: 12,
    color: '#4b5563',
    marginTop: 4,
  },
  mapButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: '#1e3a8a',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  mapButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
  },
  emptyButton: {
    marginTop: 12,
    backgroundColor: '#1e3a8a',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  emptyButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 16,
  },
  presetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  presetRoute: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  presetInfo: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
});
