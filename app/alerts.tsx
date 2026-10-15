import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRoadAlerts } from '@presentation/hooks/useRoadAlerts';
import { useAlertsStore } from '@presentation/store/useAlertsStore';
import { AlertCard } from '@presentation/components/AlertCard';
import { AlertSeverity } from '@domain/models/RoadAlert';

const SEVERITIES: Array<AlertSeverity | 'TODAS'> = ['TODAS', 'ALTA', 'MEDIA', 'BAJA'];

export default function AlertsScreen() {
  const { alerts, isLoading, syncAlerts, isSyncing } = useRoadAlerts();
  const { selectedSeverity, setSelectedSeverity } = useAlertsStore();

  const filteredAlerts = alerts.filter((alert) => {
    if (selectedSeverity === 'TODAS') return true;
    return alert.severity === selectedSeverity;
  });

  return (
    <View style={styles.container}>
      {/* Filter Chips */}
      <View style={styles.filterRow}>
        {SEVERITIES.map((sev) => {
          const isSelected = selectedSeverity === sev;
          return (
            <TouchableOpacity
              key={sev}
              style={[styles.chip, isSelected && styles.chipActive]}
              onPress={() => setSelectedSeverity(sev)}
            >
              <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                {sev}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Sync Button */}
      <View style={styles.syncRow}>
        <Text style={styles.counterText}>
          {filteredAlerts.length} incidencias registradas
        </Text>
        <TouchableOpacity
          style={styles.refreshBtn}
          onPress={() => syncAlerts()}
          disabled={isSyncing}
        >
          {isSyncing ? (
            <ActivityIndicator size="small" color="#38BDF8" />
          ) : (
            <Text style={styles.refreshText}>Actualizar #767</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* List */}
      {isLoading ? (
        <ActivityIndicator color="#38BDF8" size="large" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filteredAlerts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <AlertCard alert={item} />}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No hay alertas con la severidad seleccionada.
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
  filterRow: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  chipActive: {
    backgroundColor: '#0284C7',
    borderColor: '#38BDF8',
  },
  chipText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  syncRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  counterText: {
    color: '#64748B',
    fontSize: 13,
  },
  refreshBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  refreshText: {
    color: '#38BDF8',
    fontSize: 13,
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    paddingTop: 4,
  },
  emptyContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#64748B',
    fontSize: 14,
  },
});
