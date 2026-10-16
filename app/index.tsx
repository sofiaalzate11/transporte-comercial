import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useRoadAlerts } from '@presentation/hooks/useRoadAlerts';
// Linea 12: [INTEGRANTE 3] Descomentar cuando implemente useTollStations
// import { useTollStations } from '@presentation/hooks/useTollStations';
import { useSessionStore } from '@presentation/store/useSessionStore';
import { AlertCard } from '@presentation/components/AlertCard';

export default function HomeScreen() {
  const router = useRouter();
  const { alerts, isLoading: loadingAlerts, syncAlerts, isSyncing } = useRoadAlerts();
  
  // Linea 20: [INTEGRANTE 3] Descomentar la siguiente linea al conectar useTollStations
  // const { tolls } = useTollStations();
  const tollsCount = 0; // [INTEGRANTE 3] Reemplazar por tolls.length

  const { vehicleCategory, vehiclePlate, driverName } = useSessionStore();

  const criticalAlerts = alerts.filter(
    (a) => a.severity === 'ALTA' || a.alertType === 'CIERRE_TOTAL'
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Session Header Card */}
      <View style={styles.sessionCard}>
        <View style={styles.sessionHeader}>
          <Text style={styles.driverLabel}>Transportador Activo</Text>
          <View style={styles.onlineBadge}>
            <Text style={styles.onlineText}>SQLite Offline-First</Text>
          </View>
        </View>
        <Text style={styles.driverName}>{driverName}</Text>
        <Text style={styles.plateInfo}>
          Placa: {vehiclePlate} • Categoria {vehicleCategory}
        </Text>
      </View>

      {/* KPI Metrics */}
      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricVal}>{alerts.length}</Text>
          <Text style={styles.metricLabel}>Alertas Viales</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={[styles.metricVal, { color: '#EF4444' }]}>
            {criticalAlerts.length}
          </Text>
          <Text style={styles.metricLabel}>Cierres / Criticas</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={[styles.metricVal, { color: '#38BDF8' }]}>
            {tollsCount}
          </Text>
          <Text style={styles.metricLabel}>Peajes Registrados</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.actionPrimary]}
          onPress={() => router.push('/alerts')}
        >
          <Text style={styles.actionBtnText}>Ver Alertas #767</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.actionSecondary]}
          onPress={() => router.push('/tolls')}
        >
          <Text style={styles.actionBtnSecondaryText}>Tarifas de Peajes</Text>
        </TouchableOpacity>
         <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#10B981' }]}
            onPress={() => router.push('/reports')}
        >
        <Text style={styles.actionBtnText}>Mis Reportes</Text>
  </TouchableOpacity>
        
      </View>

      {/* Sync bar */}
      <View style={styles.syncContainer}>
        <TouchableOpacity
          style={styles.syncBtn}
          onPress={() => syncAlerts()}
          disabled={isSyncing}
        >
          {isSyncing ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.syncBtnText}>Sincronizar Datos Oficiales</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Critical Alerts Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Cierres y Puntos Criticos</Text>
        <Text style={styles.sectionSub}>Fuentes INVIAS HERMES y SODA</Text>
      </View>

      {loadingAlerts ? (
        <ActivityIndicator color="#38BDF8" style={{ marginTop: 20 }} />
      ) : criticalAlerts.length > 0 ? (
        criticalAlerts.map((alert) => <AlertCard key={alert.id} alert={alert} />)
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No hay cierres viales criticos reportados.</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1120',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  sessionCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  driverLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  onlineBadge: {
    backgroundColor: '#05966920',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  onlineText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '700',
  },
  driverName: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  plateInfo: {
    color: '#CBD5E1',
    fontSize: 13,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  metricVal: {
    color: '#F8FAFC',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 2,
  },
  metricLabel: {
    color: '#94A3B8',
    fontSize: 11,
    textAlign: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  actionPrimary: {
    backgroundColor: '#0284C7',
  },
  actionSecondary: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  actionBtnSecondaryText: {
    color: '#38BDF8',
    fontWeight: '700',
    fontSize: 14,
  },
  syncContainer: {
    marginBottom: 20,
  },
  syncBtn: {
    backgroundColor: '#334155',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  syncBtnText: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '600',
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
  },
  sectionSub: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 2,
  },
  emptyCard: {
    backgroundColor: '#1E293B',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 14,
  },
});
