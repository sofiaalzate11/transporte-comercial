import React, { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
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
              <Text style={styles.emptyText}>No hay rutas asignadas</Text>
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
  listContent: {
    padding: 16,
  },
  alertBox: {
    margin: 16,
    marginBottom: 0,
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
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 4,
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
  },
});
