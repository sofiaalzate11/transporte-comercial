import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteModel } from '../../domain/entities/route.model';

interface Props {
  route: RouteModel;
  onPress: (route: RouteModel) => void;
  isSelected?: boolean;
  onUpdateStatus?: (routeId: string, nuevoEstado: string) => Promise<void>;
  currentUserId?: string;
  userRole?: string;
}

export const RouteCard: React.FC<Props> = ({
  route,
  onPress,
  isSelected,
  onUpdateStatus,
  currentUserId,
  userRole,
}) => {
  const [actualizando, setActualizando] = React.useState(false);

  const handleStatusChange = async (nuevoEstado: string) => {
    if (!onUpdateStatus) return;
    setActualizando(true);
    try {
      await onUpdateStatus(route.id, nuevoEstado);
    } finally {
      setActualizando(false);
    }
  };

  const isAssignedToMe = currentUserId && route.usuarioId === currentUserId;
  const canManageStatus = isAssignedToMe || userRole === 'operador';

  const getStatusConfig = (estado: string) => {
    switch (estado) {
      case 'en_ruta':
        return {
          label: 'EN RUTA',
          bg: '#dbeafe',
          border: '#93c5fd',
          text: '#1d4ed8',
          icon: 'navigate-circle' as const,
        };
      case 'en_suspension':
        return {
          label: 'EN SUSPENSIÓN',
          bg: '#ffedd5',
          border: '#fed7aa',
          text: '#c2410c',
          icon: 'pause-circle' as const,
        };
      case 'completada':
        return {
          label: 'COMPLETADA',
          bg: '#dcfce7',
          border: '#86efac',
          text: '#15803d',
          icon: 'checkmark-circle' as const,
        };
      case 'retrasada':
        return {
          label: 'RETRASADA',
          bg: '#fee2e2',
          border: '#fca5a5',
          text: '#b91c1c',
          icon: 'alert-circle' as const,
        };
      case 'cancelada':
        return {
          label: 'CANCELADA',
          bg: '#f1f5f9',
          border: '#cbd5e1',
          text: '#475569',
          icon: 'close-circle' as const,
        };
      case 'pendiente':
      default:
        return {
          label: 'PENDIENTE',
          bg: '#fef3c7',
          border: '#fde68a',
          text: '#b45309',
          icon: 'time' as const,
        };
    }
  };

  const statusConfig = getStatusConfig(route.estado);
  const driverName = route.usuario?.nombre || 'Conductor por asignar';

  return (
    <TouchableOpacity
      style={[styles.card, isSelected && styles.selectedCard]}
      onPress={() => onPress(route)}
      activeOpacity={0.85}
    >
      {/* Cabecera: Origen -> Destino y Badge de Estado */}
      <View style={styles.header}>
        <View style={{ flex: 1, marginRight: 8 }}>
          {route.codigoManifiesto ? (
            <Text style={styles.manifestText}>{route.codigoManifiesto}</Text>
          ) : null}
          <Text style={styles.title}>
            {route.origenNombre} → {route.destinoNombre}
          </Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusConfig.bg, borderColor: statusConfig.border },
          ]}
        >
          <Ionicons
            name={statusConfig.icon}
            size={13}
            color={statusConfig.text}
            style={{ marginRight: 3 }}
          />
          <Text style={[styles.statusText, { color: statusConfig.text }]}>
            {statusConfig.label}
          </Text>
        </View>
      </View>

      {/* Info Conductor Asignado */}
      <View style={styles.driverRow}>
        <Ionicons name="person-circle-outline" size={16} color="#475569" style={{ marginRight: 4 }} />
        <Text style={styles.driverLabel}>Conductor Asignado: </Text>
        <Text style={styles.driverValue}>{driverName}</Text>
      </View>

      {/* Detalles Métricas */}
      <View style={styles.metricsRow}>
        <View style={styles.metricItem}>
          <Ionicons name="speedometer-outline" size={13} color="#64748b" style={{ marginRight: 3 }} />
          <Text style={styles.metricText}>{route.distanciaTotalKm} km</Text>
        </View>
        <View style={styles.metricItem}>
          <Ionicons name="hourglass-outline" size={13} color="#64748b" style={{ marginRight: 3 }} />
          <Text style={styles.metricText}>{route.tiempoEstimadoBaseMin} min</Text>
        </View>
        <View style={styles.metricItem}>
          <Ionicons name="alarm-outline" size={13} color="#64748b" style={{ marginRight: 3 }} />
          <Text style={styles.metricText}>
            ETA:{' '}
            {new Date(route.etaPactado).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>

      {/* Botones de Acción para el Conductor u Operador */}
      {canManageStatus && (
        <View style={styles.actionContainer}>
          {actualizando ? (
            <ActivityIndicator size="small" color="#1e3a8a" />
          ) : (
            <>
              {route.estado === 'pendiente' && (
                <TouchableOpacity
                  style={[styles.btnAction, styles.btnAccept]}
                  onPress={() => handleStatusChange('en_ruta')}
                >
                  <Ionicons name="paper-plane" size={14} color="#ffffff" style={{ marginRight: 4 }} />
                  <Text style={styles.btnActionText}>Aceptar e Iniciar Viaje</Text>
                </TouchableOpacity>
              )}

              {route.estado === 'en_ruta' && (
                <View style={styles.btnGroup}>
                  <TouchableOpacity
                    style={[styles.btnAction, styles.btnSuspend]}
                    onPress={() => handleStatusChange('en_suspension')}
                  >
                    <Ionicons name="pause" size={14} color="#ffffff" style={{ marginRight: 4 }} />
                    <Text style={styles.btnActionText}>Poner en Suspensión</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.btnAction, styles.btnComplete]}
                    onPress={() => handleStatusChange('completada')}
                  >
                    <Ionicons name="checkmark-done" size={14} color="#ffffff" style={{ marginRight: 4 }} />
                    <Text style={styles.btnActionText}>Finalizar Entrega</Text>
                  </TouchableOpacity>
                </View>
              )}

              {route.estado === 'en_suspension' && (
                <View style={styles.btnGroup}>
                  <TouchableOpacity
                    style={[styles.btnAction, styles.btnResume]}
                    onPress={() => handleStatusChange('en_ruta')}
                  >
                    <Ionicons name="play" size={14} color="#ffffff" style={{ marginRight: 4 }} />
                    <Text style={styles.btnActionText}>Reanudar Viaje</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.btnAction, styles.btnComplete]}
                    onPress={() => handleStatusChange('completada')}
                  >
                    <Ionicons name="checkmark-done" size={14} color="#ffffff" style={{ marginRight: 4 }} />
                    <Text style={styles.btnActionText}>Finalizar Entrega</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 10,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  selectedCard: {
    borderColor: '#3b82f6',
    borderWidth: 2,
    backgroundColor: '#f8fafc',
  },
  manifestText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6366f1',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  driverLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  driverValue: {
    fontSize: 12,
    color: '#0f172a',
    fontWeight: '700',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 16,
    paddingTop: 4,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  actionContainer: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  btnGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  btnAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 6,
    flex: 1,
  },
  btnAccept: {
    backgroundColor: '#16a34a',
  },
  btnSuspend: {
    backgroundColor: '#ea580c',
  },
  btnResume: {
    backgroundColor: '#2563eb',
  },
  btnComplete: {
    backgroundColor: '#059669',
  },
  btnActionText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
});
