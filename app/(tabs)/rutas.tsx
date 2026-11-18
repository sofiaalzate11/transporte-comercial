import React, { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoutesStore } from '../../src/presentation/stores/routes.store';
import { RouteCard } from '../../src/presentation/components/RouteCard';
import { useRouter } from 'expo-router';

export default function RutasScreen() {
  const {
    rutas,
    cargando,
    cargarDatos,
    seleccionarRuta,
    rutaSeleccionada,
    evaluacionRetraso,
  } = useRoutesStore();
  const router = useRouter();

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleSelectRoute = (ruta: any) => {
    seleccionarRuta(ruta);
  };

  const handleOpenMap = () => {
    router.push('/(tabs)/mapa');
  };

  return (
    <View style={styles.container}>
      <View style={styles.topActions}>
        <Text style={styles.headerTitle}>Rutas Asignadas ({rutas.length})</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={cargarDatos}
          activeOpacity={0.8}
        >
          <Ionicons name="refresh-outline" size={16} color="#1e3a8a" style={{ marginRight: 4 }} />
          <Text style={styles.refreshButtonText}>Actualizar</Text>
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
              <Text style={styles.emptyTitle}>Sin rutas asignadas</Text>
              <Text style={styles.emptyText}>
                Las órdenes de despacho de carga son creadas y asignadas por el operador de control logístico.
              </Text>
              <TouchableOpacity style={styles.emptyButton} onPress={cargarDatos}>
                <Ionicons name="sync-outline" size={16} color="#ffffff" style={{ marginRight: 6 }} />
                <Text style={styles.emptyButtonText}>Verificar Nuevos Despachos</Text>
              </TouchableOpacity>
            </View>
          ) : undefined
        }
        contentContainerStyle={styles.listContent}
      />
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
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e2e8f0',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  refreshButtonText: {
    color: '#1e3a8a',
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
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 12,
  },
  emptyText: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
  emptyButton: {
    marginTop: 16,
    backgroundColor: '#1e3a8a',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
});
