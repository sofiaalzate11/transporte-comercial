import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSessionStore } from '@presentation/store/useSessionStore';

// =========================================================================
// [INTEGRANTE 3: PASO 5] Descomentar las siguientes 2 lineas de importacion:
// import { useTollStations } from '@presentation/hooks/useTollStations';
// import { TollCard } from '@presentation/components/TollCard';
// =========================================================================

const CATEGORIES = ['I', 'II', 'III', 'IV', 'V'];

export default function TollsScreen() {
  const { vehicleCategory, setDriverInfo, driverName, vehiclePlate } = useSessionStore();
  const [activeCategory, setActiveCategory] = useState<string>(vehicleCategory);

  // =======================================================================
  // [INTEGRANTE 3: PASO 6] Descomentar la linea del hook y eliminar la simulacion:
  // const { tolls, isLoading, syncTolls, isSyncing } = useTollStations();
  const tolls: any[] = [];
  const isLoading = false;
  const isSyncing = false;
  const syncTolls = () => {};
  // =======================================================================

  const handleSelectCategory = (cat: string) => {
    setActiveCategory(cat);
    setDriverInfo(driverName, vehiclePlate, cat);
  };

  const totalCalculated = tolls.reduce((acc, curr) => {
    const rate = curr.rates?.find((r: any) => r.category === activeCategory);
    return acc + (rate?.priceCop ?? 0);
  }, 0);

  return (
    <View style={styles.container}>
      {/* Selector de categoria */}
      <View style={styles.catHeader}>
        <Text style={styles.headerLabel}>Categoria Vehicular (Resolucion Mintransporte):</Text>
        <View style={styles.catRow}>
          {CATEGORIES.map((cat) => {
            const isSelected = activeCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.catBtn, isSelected && styles.catBtnActive]}
                onPress={() => handleSelectCategory(cat)}
              >
                <Text style={[styles.catBtnText, isSelected && styles.catBtnTextActive]}>
                  Cat {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Tarjeta de Costo Acumulado */}
      <View style={styles.summaryCard}>
        <View>
          <Text style={styles.summaryLabel}>Total Estimado Ruta ({tolls.length} peajes)</Text>
          <Text style={styles.summarySub}>Categoria {activeCategory}</Text>
        </View>
        <Text style={styles.summaryValue}>
          ${totalCalculated.toLocaleString('es-CO')} COP
        </Text>
      </View>

      {/* Barra de sincronizacion */}
      <View style={styles.syncRow}>
        <Text style={styles.infoText}>Datos Abiertos Colombia (SODA REST)</Text>
        <TouchableOpacity
          style={styles.refreshBtn}
          onPress={() => syncTolls()}
          disabled={isSyncing}
        >
          {isSyncing ? (
            <ActivityIndicator size="small" color="#38BDF8" />
          ) : (
            <Text style={styles.refreshText}>Actualizar Peajes</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Lista de peajes */}
      {isLoading ? (
        <ActivityIndicator color="#38BDF8" size="large" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={tolls}
          keyExtractor={(item) => item.id}
          // [INTEGRANTE 3] Descomentar la siguiente linea al crear TollCard:
          // renderItem={({ item }) => <TollCard toll={item} selectedCategory={activeCategory} />}
          renderItem={({ item }) => (
            <View style={styles.tempItem}>
              <Text style={{ color: '#FFFFFF' }}>{item.name}</Text>
            </View>
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Modulo de peajes listo para activacion por Integrante 3.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1120',
  },
  catHeader: {
    padding: 16,
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  headerLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  catRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  catBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: '#334155',
  },
  catBtnActive: {
    backgroundColor: '#0284C7',
    borderColor: '#38BDF8',
  },
  catBtnText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
  },
  catBtnTextActive: {
    color: '#FFFFFF',
  },
  summaryCard: {
    backgroundColor: '#1E293B',
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  summaryLabel: {
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '600',
  },
  summarySub: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
  summaryValue: {
    color: '#34D399',
    fontSize: 20,
    fontWeight: '800',
  },
  syncRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  infoText: {
    color: '#64748B',
    fontSize: 12,
  },
  refreshBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  refreshText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  emptyContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#64748B',
    fontSize: 14,
  },
  tempItem: {
    padding: 12,
    backgroundColor: '#1E293B',
    borderRadius: 8,
    marginBottom: 8,
  },
});
