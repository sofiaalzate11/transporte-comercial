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
  tieneViajeActivo?: boolean;
}

export const RouteCard: React.FC<Props> = ({
  route,
  onPress,
  isSelected,
  onUpdateStatus,
  currentUserId,
  userRole,
  tieneViajeActivo,
}) => {
  const [actualizando, setActualizando] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const handleStatusChange = async (nuevoEstado: string) => {
    if (!onUpdateStatus) return;
    setErrorMsg(null);
    setActualizando(true);
    try {
      await onUpdateStatus(route.id, nuevoEstado);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error al actualizar estado');
    } finally {
      setActualizando(false);
    }
  };

  const isAssignedToMe = currentUserId && route.usuarioId === currentUserId;
  const canManageStatus = isAssignedToMe || userRole === 'operador';
  const isTripInProgress = route.estado === 'en_ruta' || route.estado === 'en_suspension';

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
      style={[
        styles.card,
        isSelected && styles.selectedCard,
        isTripInProgress && styles.cardActiveTrip,
      ]}
      onPress={() => onPress(route)}
      activeOpacity={0.85}
    >
      {/* Cabecera: Manifiesto y Badge de Estado */}
      <View style={styles.header}>
        <View style={{ flex: 1, marginRight: 8 }}>
          {route.codigoManifiesto ? (
            <Text style={styles.manifestText}>{route.codigoManifiesto}</Text>
          ) : null}
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

      {/* Diferenciación visual clara de Salida (Origen) vs Entrada (Destino) */}
      <View style={styles.routePointsBox}>
        <View style={styles.pointRow}>
          <View style={[styles.pointBadge, styles.badgeSalida]}>
            <Ionicons name="log-out-outline" size={13} color="#15803d" style={{ marginRight: 4 }} />
            <Text style={styles.pointBadgeTextSalida}>SALIDA</Text>
          </View>
          <Text style={styles.pointName} numberOfLines={1}>
            {route.origenNombre}
          </Text>
        </View>

        <View style={styles.pointDivider}>
          <Ionicons name="arrow-down" size={12} color="#94a3b8" />
        </View>

        <View style={styles.pointRow}>
          <View style={[styles.pointBadge, styles.badgeEntrada]}>
            <Ionicons name="log-in-outline" size={13} color="#1d4ed8" style={{ marginRight: 4 }} />
            <Text style={styles.pointBadgeTextEntrada}>ENTRADA</Text>
          </View>
          <Text style={styles.pointName} numberOfLines={1}>
            {route.destinoNombre}
          </Text>
        </View>
      </View>

      {/* Info Conductor Asignado */}
      <View style={styles.driverRow}>
        <Ionicons name="person-circle-outline" size={16} color="#475569" style={{ marginRight: 4 }} />
        <Text style={styles.driverLabel}>Conductor Asignado: </Text>
        <Text style={styles.driverValue}>{driverName}</Text>
      </View>

      {/* Métricas de Distancia, Tiempo y ETA */}
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

      {/* Mensaje de error si falla la acción */}
      {errorMsg ? (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={14} color="#dc2626" style={{ marginRight: 4 }} />
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      ) : null}

      {/* Botones de Acción para el Conductor u Operador */}
      {canManageStatus && (
        <View style={styles.actionContainer}>
          {actualizando ? (
            <ActivityIndicator size="small" color="#1e3a8a" />
          ) : (
            <>
              {route.estado === 'pendiente' && (
                tieneViajeActivo && !isTripInProgress ? (
                  <View style={styles.blockedBox}>
                    <Ionicons name="lock-closed" size={13} color="#92400e" style={{ marginRight: 4 }} />
                    <Text style={styles.blockedText}>
                      Viaje en curso activo. Debe finalizar su entrega actual antes de tomar esta ruta.
                    </Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.btnAction, styles.btnAccept]}
                    onPress={() => handleStatusChange('en_ruta')}
                  >
                    <Ionicons name="paper-plane" size={14} color="#ffffff" style={{ marginRight: 4 }} />
                    <Text style={styles.btnActionText}>Aceptar e Iniciar Viaje</Text>
                  </TouchableOpacity>
                )
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
  cardActiveTrip: {
    borderColor: '#3b82f6',
    borderWidth: 1.5,
    backgroundColor: '#f8fafc',
  },
  selectedCard: {
    borderColor: '#1e3a8a',
    borderWidth: 2,
    backgroundColor: '#f1f5f9',
  },
  manifestText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6366f1',
    letterSpacing: 0.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
  routePointsBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#edf2f7',
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
    marginRight: 8,
  },
  badgeSalida: {
    backgroundColor: '#dcfce7',
    borderWidth: 1,
    borderColor: '#86efac',
  },
  badgeEntrada: {
    backgroundColor: '#dbeafe',
    borderWidth: 1,
    borderColor: '#93c5fd',
  },
  pointBadgeTextSalida: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803d',
  },
  pointBadgeTextEntrada: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1d4ed8',
  },
  pointName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
    flex: 1,
  },
  pointDivider: {
    paddingLeft: 24,
    paddingVertical: 1,
  },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
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
    paddingTop: 2,
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
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fca5a5',
    padding: 6,
    borderRadius: 6,
    marginTop: 8,
  },
  errorText: {
    fontSize: 11,
    color: '#b91c1c',
    flex: 1,
  },
  actionContainer: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  blockedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
    borderWidth: 1,
    padding: 8,
    borderRadius: 6,
  },
  blockedText: {
    fontSize: 11,
    color: '#92400e',
    fontWeight: '600',
    flex: 1,
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
