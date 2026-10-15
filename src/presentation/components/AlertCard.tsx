import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RoadAlert } from '../../domain/models/RoadAlert';

interface AlertCardProps {
  alert: RoadAlert;
}

export const AlertCard: React.FC<AlertCardProps> = ({ alert }) => {
  const getSeverityColor = (sev: RoadAlert['severity']) => {
    switch (sev) {
      case 'ALTA':
        return '#EF4444';
      case 'MEDIA':
        return '#F59E0B';
      default:
        return '#10B981';
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View
          style={[
            styles.badge,
            { backgroundColor: getSeverityColor(alert.severity) },
          ]}
        >
          <Text style={styles.badgeText}>{alert.alertType.replace(/_/g, ' ')}</Text>
        </View>
        <Text style={styles.departmentText}>{alert.department}</Text>
      </View>

      <Text style={styles.roadTitle}>{alert.roadName}</Text>
      <Text style={styles.sectorText}>Tramo: {alert.sector}</Text>
      <Text style={styles.descText}>{alert.description}</Text>

      <View style={styles.footer}>
        <Text style={styles.timeText}>
          Reporte: {new Date(alert.reportedAt).toLocaleTimeString('es-CO')}
        </Text>
        <Text
          style={[
            styles.statusText,
            { color: alert.isResolved ? '#10B981' : '#EF4444' },
          ]}
        >
          {alert.isResolved ? 'Normalizado' : 'Activo'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  departmentText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  roadTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  sectorText: {
    color: '#CBD5E1',
    fontSize: 13,
    marginBottom: 8,
  },
  descText: {
    color: '#E2E8F0',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 8,
  },
  timeText: {
    color: '#64748B',
    fontSize: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
