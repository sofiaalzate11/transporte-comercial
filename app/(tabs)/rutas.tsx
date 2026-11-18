import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/presentation/context/AuthContext';
import { useRoutesStore } from '../../src/presentation/stores/routes.store';
import { RouteCard } from '../../src/presentation/components/RouteCard';
import { RouteModel } from '../../src/domain/entities/route.model';
import { useRouter } from 'expo-router';

const PRESET_FIXED_ROUTES = [
  {
    codigoManifiesto: 'MAN-40-BOG-GIR',
    origenNombre: 'Bogotá (Terminal Carga)',
    origenLat: 4.711,
    origenLon: -74.0721,
    destinoNombre: 'Girardot (Centro Logístico)',
    destinoLat: 4.3014,
    destinoLon: -74.8061,
    distanciaTotalKm: 135.5,
    tiempoEstimadoBaseMin: 180,
  },
  {
    codigoManifiesto: 'MAN-25-BOG-MED',
    origenNombre: 'Bogotá (Terminal Salitre)',
    origenLat: 4.6533,
    origenLon: -74.1089,
    destinoNombre: 'Medellín (Parque Industrial)',
    destinoLat: 6.2442,
    destinoLon: -75.5812,
    distanciaTotalKm: 420.0,
    tiempoEstimadoBaseMin: 480,
  },
  {
    codigoManifiesto: 'MAN-40-CAL-BUE',
    origenNombre: 'Cali (Zona Franca)',
    origenLat: 3.4516,
    origenLon: -76.532,
    destinoNombre: 'Buenaventura (Puerto Marítimo)',
    destinoLat: 3.8801,
    destinoLon: -77.0312,
    distanciaTotalKm: 125.0,
    tiempoEstimadoBaseMin: 150,
  },
  {
    codigoManifiesto: 'MAN-29-MED-MAN',
    origenNombre: 'Medellín (Centro Logístico)',
    origenLat: 6.2442,
    origenLon: -75.5812,
    destinoNombre: 'Manizales (Terminal)',
    destinoLat: 5.0689,
    destinoLon: -75.5174,
    distanciaTotalKm: 215.0,
    tiempoEstimadoBaseMin: 280,
  },
];

export default function RutasScreen() {
  const { usuario } = useAuth();
  const {
    rutas,
    conductores,
    cargando,
    cargarDatos,
    cargarConductores,
    seleccionarRuta,
    rutaSeleccionada,
    evaluacionRetraso,
    crearRuta,
    actualizarEstadoRuta,
  } = useRoutesStore();
  const router = useRouter();

  const [actualizando, setActualizando] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [creando, setCreando] = useState(false);
  const [conductorSeleccionadoId, setConductorSeleccionadoId] = useState<string>('');

  useEffect(() => {
    cargarDatos();
    cargarConductores();
  }, []);

  // Seleccionar por defecto el primer conductor cuando la lista esté lista
  useEffect(() => {
    if (conductores.length > 0 && !conductorSeleccionadoId) {
      setConductorSeleccionadoId(conductores[0].id);
    }
  }, [conductores, conductorSeleccionadoId]);

  const rolActual = useMemo(() => {
    if (usuario?.rol) return usuario.rol;
    if (usuario?.correo?.includes('operador')) return 'operador';
    if (usuario?.correo?.includes('cliente')) return 'consulta';
    return 'conductor';
  }, [usuario]);

  const esOperador = rolActual === 'operador';
  const esConductor = rolActual === 'conductor';

  // Alerta para conductor: cuántas rutas pendientes tiene
  const rutasPendientesConductor = useMemo(() => {
    if (!esConductor) return [];
    return rutas.filter(
      (r) => r.estado === 'pendiente' && (!usuario?.id || r.usuarioId === usuario.id),
    );
  }, [rutas, esConductor, usuario]);

  const handleSelectRoute = (ruta: RouteModel) => {
    seleccionarRuta(ruta);
  };

  const handleOpenMap = () => {
    router.push('/(tabs)/mapa');
  };

  const handleRefresh = async () => {
    setActualizando(true);
    await Promise.all([cargarDatos(), cargarConductores()]);
    setActualizando(false);
  };

  const handleDispatchPreset = async (preset: typeof PRESET_FIXED_ROUTES[0]) => {
    setCreando(true);
    const etaPactado = new Date(Date.now() + preset.tiempoEstimadoBaseMin * 60000).toISOString();
    await crearRuta({
      ...preset,
      conductorId: conductorSeleccionadoId || undefined,
      etaPactado,
      estado: 'pendiente',
    });
    setCreando(false);
    setModalVisible(false);
  };

  const handleUpdateStatus = async (routeId: string, nuevoEstado: string) => {
    await actualizarEstadoRuta(routeId, nuevoEstado);
  };

  return (
    <View style={styles.container}>
      {/* Tarjeta de Perfil, Rol y Estado del Usuario */}
      <View style={styles.userBar}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{usuario?.nombre || 'Usuario Conectado'}</Text>
          <Text style={styles.userEmail}>{usuario?.correo || 'Sin correo'}</Text>
        </View>

        <View style={styles.userStatusCol}>
          <View
            style={[
              styles.roleBadge,
              esOperador
                ? styles.roleBadgeOperador
                : rolActual === 'consulta'
                ? styles.roleBadgeCliente
                : styles.roleBadgeConductor,
            ]}
          >
            <Ionicons
              name={
                esOperador
                  ? 'shield-checkmark'
                  : rolActual === 'consulta'
                  ? 'eye-outline'
                  : 'car-sport-outline'
              }
              size={12}
              color={
                esOperador
                  ? '#4338ca'
                  : rolActual === 'consulta'
                  ? '#b45309'
                  : '#15803d'
              }
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                styles.roleText,
                esOperador
                  ? styles.roleTextOperador
                  : rolActual === 'consulta'
                  ? styles.roleTextCliente
                  : styles.roleTextConductor,
              ]}
            >
              {rolActual.toUpperCase()}
            </Text>
          </View>
          <View style={styles.statusRow}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>En línea · Activo</Text>
          </View>
        </View>
      </View>

      {/* Alerta Destacada para el Conductor si tiene rutas pendientes de aceptar */}
      {esConductor && rutasPendientesConductor.length > 0 && (
        <View style={styles.conductorAlertCard}>
          <Ionicons name="notifications-circle" size={24} color="#b45309" style={{ marginRight: 8 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.conductorAlertTitle}>
              Tiene {rutasPendientesConductor.length} orden(es) pendiente(s) de confirmación
            </Text>
            <Text style={styles.conductorAlertSub}>
              Revise los detalles y pulse &quot;Aceptar e Iniciar Viaje&quot; para iniciar el recorrido.
            </Text>
          </View>
        </View>
      )}

      {/* Panel Exclusivo para el Rol Operador */}
      {esOperador && (
        <View style={styles.operatorCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.operatorTitle}>Panel de Despacho (Operador)</Text>
            <Text style={styles.operatorSubtitle}>
              Cree rutas fijas y asígnelas al conductor seleccionado
            </Text>
          </View>
          <TouchableOpacity
            style={styles.dispatchButton}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="add-circle" size={16} color="#ffffff" style={{ marginRight: 4 }} />
            <Text style={styles.dispatchButtonText}>Despachar Ruta</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Barra de Acciones y Conteo */}
      <View style={styles.topActions}>
        <Text style={styles.headerTitle}>
          {esOperador ? 'Todas las Rutas Despachadas' : 'Mis Rutas Asignadas'} ({rutas.length})
        </Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleRefresh}
          disabled={actualizando || cargando}
          activeOpacity={0.7}
        >
          {actualizando || cargando ? (
            <ActivityIndicator size="small" color="#1e3a8a" style={{ marginRight: 4 }} />
          ) : (
            <Ionicons name="sync-outline" size={16} color="#1e3a8a" style={{ marginRight: 4 }} />
          )}
          <Text style={styles.refreshButtonText}>
            {actualizando || cargando ? 'Actualizando...' : 'Actualizar'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Alerta de Retraso de la Ruta Seleccionada */}
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

      {/* Listado de Rutas */}
      <FlatList
        data={rutas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RouteCard
            route={item}
            isSelected={rutaSeleccionada?.id === item.id}
            onPress={handleSelectRoute}
            onUpdateStatus={handleUpdateStatus}
            currentUserId={usuario?.id}
            userRole={rolActual}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={cargando} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          !cargando ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="trail-sign-outline" size={48} color="#94a3b8" />
              <Text style={styles.emptyTitle}>Sin rutas activas</Text>
              <Text style={styles.emptyText}>
                {esOperador
                  ? 'Utilice el botón "Despachar Ruta" para crear una nueva asignación de carga.'
                  : 'Las órdenes de despacho de carga son creadas y asignadas por la central de operaciones.'}
              </Text>
              <TouchableOpacity style={styles.emptyButton} onPress={handleRefresh}>
                <Ionicons name="sync-outline" size={16} color="#ffffff" style={{ marginRight: 6 }} />
                <Text style={styles.emptyButtonText}>Verificar Nuevos Despachos</Text>
              </TouchableOpacity>
            </View>
          ) : undefined
        }
        contentContainerStyle={styles.listContent}
      />

      {/* Modal para Crear y Despachar Rutas Fijas (Solo Operador) */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="shield-checkmark" size={20} color="#1e3a8a" style={{ marginRight: 6 }} />
                <Text style={styles.modalTitle}>Despacho de Ruta Fija</Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 420 }}>
              {/* Sección 1: Selector de Conductor */}
              <Text style={styles.modalSectionLabel}>1. Asignar al Conductor:</Text>
              {conductores.length === 0 ? (
                <Text style={styles.noDriversText}>Cargando conductores disponibles...</Text>
              ) : (
                <View style={styles.driverListContainer}>
                  {conductores.map((c) => {
                    const isSelected = conductorSeleccionadoId === c.id;
                    return (
                      <TouchableOpacity
                        key={c.id}
                        style={[
                          styles.driverOptionChip,
                          isSelected && styles.driverOptionChipSelected,
                        ]}
                        onPress={() => setConductorSeleccionadoId(c.id)}
                      >
                        <Ionicons
                          name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                          size={16}
                          color={isSelected ? '#1e3a8a' : '#94a3b8'}
                          style={{ marginRight: 6 }}
                        />
                        <View style={{ flex: 1 }}>
                          <Text
                            style={[
                              styles.driverOptionName,
                              isSelected && styles.driverOptionNameSelected,
                            ]}
                          >
                            {c.nombre}
                          </Text>
                          <Text style={styles.driverOptionDoc}>{c.documento}</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {/* Sección 2: Seleccionar Corredor Troncal */}
              <Text style={styles.modalSectionLabel}>2. Seleccione el Corredor Troncal:</Text>
              {PRESET_FIXED_ROUTES.map((preset, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.presetItem}
                  onPress={() => handleDispatchPreset(preset)}
                  disabled={creando}
                  activeOpacity={0.7}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.presetManifiesto}>{preset.codigoManifiesto}</Text>
                    <Text style={styles.presetRoute}>
                      {preset.origenNombre} → {preset.destinoNombre}
                    </Text>
                    <Text style={styles.presetInfo}>
                      {preset.distanciaTotalKm} km · {preset.tiempoEstimadoBaseMin / 60} horas estimadas
                    </Text>
                  </View>
                  <Ionicons name="arrow-forward-circle" size={24} color="#1e3a8a" />
                </TouchableOpacity>
              ))}

              {creando && (
                <View style={styles.loadingBox}>
                  <ActivityIndicator color="#1e3a8a" />
                  <Text style={{ marginLeft: 8, color: '#1e3a8a', fontWeight: '500' }}>
                    Despachando orden al conductor...
                  </Text>
                </View>
              )}
            </ScrollView>
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
  userBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  userEmail: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  userStatusCol: {
    alignItems: 'flex-end',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  roleBadgeConductor: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  roleBadgeOperador: {
    backgroundColor: '#eef2ff',
    borderColor: '#c7d2fe',
  },
  roleBadgeCliente: {
    backgroundColor: '#fefce8',
    borderColor: '#fef08a',
  },
  roleText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  roleTextConductor: {
    color: '#15803d',
  },
  roleTextOperador: {
    color: '#4338ca',
  },
  roleTextCliente: {
    color: '#b45309',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22c55e',
    marginRight: 4,
  },
  statusText: {
    fontSize: 10,
    color: '#16a34a',
    fontWeight: '600',
  },
  conductorAlertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fde68a',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 8,
  },
  conductorAlertTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400e',
  },
  conductorAlertSub: {
    fontSize: 11,
    color: '#b45309',
    marginTop: 2,
  },
  operatorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e7ff',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#c7d2fe',
  },
  operatorTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e1b4b',
  },
  operatorSubtitle: {
    fontSize: 11,
    color: '#4338ca',
    marginTop: 2,
  },
  dispatchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3730a3',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginLeft: 8,
  },
  dispatchButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  topActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#e2e8f0',
    borderRadius: 6,
  },
  refreshButtonText: {
    fontSize: 12,
    color: '#1e3a8a',
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  alertBox: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  alertDelayed: {
    backgroundColor: '#fee2e2',
    borderColor: '#ef4444',
  },
  alertOk: {
    backgroundColor: '#ecfdf5',
    borderColor: '#10b981',
  },
  alertTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  alertSub: {
    fontSize: 11,
    color: '#4b5563',
    marginVertical: 4,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#1e3a8a',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 4,
    marginTop: 4,
  },
  mapButtonText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#64748b',
    marginTop: 12,
  },
  emptyText: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e3a8a',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginTop: 16,
  },
  emptyButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 18,
    width: '100%',
    maxWidth: 520,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e3a8a',
  },
  modalSectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginTop: 10,
    marginBottom: 6,
  },
  noDriversText: {
    fontSize: 12,
    color: '#94a3b8',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  driverListContainer: {
    flexDirection: 'column',
    gap: 6,
    marginBottom: 8,
  },
  driverOptionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  driverOptionChipSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  driverOptionName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  driverOptionNameSelected: {
    color: '#1e3a8a',
    fontWeight: '700',
  },
  driverOptionDoc: {
    fontSize: 11,
    color: '#64748b',
  },
  presetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginVertical: 4,
    backgroundColor: '#ffffff',
  },
  presetManifiesto: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563eb',
  },
  presetRoute: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 2,
  },
  presetInfo: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
});
