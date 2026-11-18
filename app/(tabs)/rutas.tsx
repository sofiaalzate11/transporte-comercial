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
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/presentation/context/AuthContext';
import { useRoutesStore } from '../../src/presentation/stores/routes.store';
import { RouteCard } from '../../src/presentation/components/RouteCard';
import { RouteModel } from '../../src/domain/entities/route.model';
import { useRouter } from 'expo-router';

const LOGISTIC_NODES: Record<string, { lat: number; lon: number }> = {
  bogota: { lat: 4.711, lon: -74.0721 },
  medellin: { lat: 6.2442, lon: -75.5812 },
  cali: { lat: 3.4516, lon: -76.532 },
  barranquilla: { lat: 10.9685, lon: -74.7813 },
  cartagena: { lat: 10.391, lon: -75.4794 },
  bucaramanga: { lat: 7.1254, lon: -73.1198 },
  pereira: { lat: 4.8133, lon: -75.6961 },
  manizales: { lat: 5.0689, lon: -75.5174 },
  ibague: { lat: 4.4389, lon: -75.2322 },
  cucuta: { lat: 7.8939, lon: -72.5078 },
  'santa marta': { lat: 11.2408, lon: -74.199 },
  buenaventura: { lat: 3.8801, lon: -77.0312 },
  pasto: { lat: 1.2136, lon: -77.2811 },
  villavicencio: { lat: 4.142, lon: -73.6266 },
  neiva: { lat: 2.9273, lon: -75.2819 },
  armenia: { lat: 4.5339, lon: -75.6811 },
  girardot: { lat: 4.3014, lon: -74.8061 },
  tunja: { lat: 5.5353, lon: -73.3678 },
};

async function geocodeLocation(query: string): Promise<{ lat: number; lon: number; nombre: string }> {
  const clean = query.trim();
  const normalized = clean.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  for (const [key, coords] of Object.entries(LOGISTIC_NODES)) {
    if (normalized.includes(key)) {
      return { lat: coords.lat, lon: coords.lon, nombre: clean };
    }
  }

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&countrycodes=co&limit=1&q=${encodeURIComponent(
        clean,
      )}`,
    );
    const data = await res.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
        nombre: clean,
      };
    }
  } catch (e) {
    console.warn('Error en geocodificación:', e);
  }

  return { lat: 4.711, lon: -74.0721, nombre: clean };
}

async function calculateRoadMetrics(
  origenLat: number,
  origenLon: number,
  destinoLat: number,
  destinoLon: number,
): Promise<{ distanciaKm: number; tiempoBaseMin: number }> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${origenLon},${origenLat};${destinoLon},${destinoLat}?overview=false`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.routes && data.routes.length > 0) {
      const distanceMeters = data.routes[0].distance;
      const durationSeconds = data.routes[0].duration;
      return {
        distanciaKm: Math.round((distanceMeters / 1000) * 10) / 10,
        tiempoBaseMin: Math.round(durationSeconds / 60),
      };
    }
  } catch (e) {
    console.warn('Error en cálculo OSRM:', e);
  }

  const dLat = (destinoLat - origenLat) * (Math.PI / 180);
  const dLon = (destinoLon - origenLon) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(origenLat * (Math.PI / 180)) *
      Math.cos(destinoLat * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const kmDirecto = 6371 * c;
  const kmCarretera = Math.round(kmDirecto * 1.35 * 10) / 10;
  const minEstimados = Math.round((kmCarretera / 45) * 60);
  return { distanciaKm: kmCarretera, tiempoBaseMin: minEstimados };
}

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

  // Pestaña del modal: 'preset' o 'personalizado'
  const [tipoDespacho, setTipoDespacho] = useState<'preset' | 'personalizado'>('preset');
  const [origenInput, setOrigenInput] = useState('');
  const [destinoInput, setDestinoInput] = useState('');
  const [manifiestoInput, setManifiestoInput] = useState('');
  const [errorDespacho, setErrorDespacho] = useState<string | null>(null);

  useEffect(() => {
    cargarDatos();
    cargarConductores();
  }, []);

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

  // Viaje en curso activo del conductor
  const viajeActivoConductor = useMemo(() => {
    if (!esConductor) return null;
    return (
      rutas.find(
        (r) =>
          (r.estado === 'en_ruta' || r.estado === 'en_suspension') &&
          (!usuario?.id || r.usuarioId === usuario.id),
      ) || null
    );
  }, [rutas, esConductor, usuario]);

  const tieneViajeActivo = Boolean(viajeActivoConductor);

  // Alerta para conductor: órdenes pendientes por aceptar
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

  // Despacho de Preset Fijo
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

  // Despacho de Ruta Personalizada con Cálculo Automático OSRM
  const handleCustomDispatch = async () => {
    if (!origenInput.trim() || !destinoInput.trim()) {
      setErrorDespacho('Ingrese la dirección o ciudad de salida y de entrada.');
      return;
    }
    setErrorDespacho(null);
    setCreando(true);
    try {
      const origenCoords = await geocodeLocation(origenInput);
      const destinoCoords = await geocodeLocation(destinoInput);
      const metrics = await calculateRoadMetrics(
        origenCoords.lat,
        origenCoords.lon,
        destinoCoords.lat,
        destinoCoords.lon,
      );

      const etaPactado = new Date(Date.now() + metrics.tiempoBaseMin * 60000).toISOString();
      const codigo = manifiestoInput.trim() || `MAN-${Date.now().toString().slice(-6)}`;

      await crearRuta({
        codigoManifiesto: codigo,
        origenNombre: origenCoords.nombre,
        origenLat: origenCoords.lat,
        origenLon: origenCoords.lon,
        destinoNombre: destinoCoords.nombre,
        destinoLat: destinoCoords.lat,
        destinoLon: destinoCoords.lon,
        distanciaTotalKm: metrics.distanciaKm,
        tiempoEstimadoBaseMin: metrics.tiempoBaseMin,
        conductorId: conductorSeleccionadoId || undefined,
        etaPactado,
        estado: 'pendiente',
      });

      setOrigenInput('');
      setDestinoInput('');
      setManifiestoInput('');
      setModalVisible(false);
    } catch (e: any) {
      setErrorDespacho(e?.message || 'Error al calcular y despachar la ruta.');
    } finally {
      setCreando(false);
    }
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

      {/* Banner de Viaje Activo en Curso para el Conductor */}
      {esConductor && viajeActivoConductor && (
        <View style={styles.activeTripBanner}>
          <View style={styles.activeTripHeader}>
            <Ionicons name="navigate-circle" size={18} color="#1d4ed8" style={{ marginRight: 6 }} />
            <Text style={styles.activeTripTitle}>VIAJE EN CURSO ACTIVO</Text>
            <View
              style={[
                styles.activeTripBadge,
                viajeActivoConductor.estado === 'en_suspension'
                  ? styles.badgeSuspended
                  : styles.badgeEnRuta,
              ]}
            >
              <Text style={styles.activeTripBadgeText}>
                {viajeActivoConductor.estado === 'en_suspension' ? 'EN SUSPENSIÓN' : 'EN RUTA'}
              </Text>
            </View>
          </View>
          <Text style={styles.activeTripRoute}>
            Salida: {viajeActivoConductor.origenNombre} → Entrada: {viajeActivoConductor.destinoNombre}
          </Text>
          <Text style={styles.activeTripNote}>
            Debe finalizar la entrega de este viaje antes de aceptar o iniciar una nueva orden.
          </Text>
        </View>
      )}

      {/* Alerta de Órdenes Pendientes para el Conductor */}
      {esConductor && rutasPendientesConductor.length > 0 && (
        <View style={styles.conductorAlertCard}>
          <Ionicons name="notifications-circle" size={24} color="#b45309" style={{ marginRight: 8 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.conductorAlertTitle}>
              Tiene {rutasPendientesConductor.length} orden(es) pendiente(s) por tomar
            </Text>
            <Text style={styles.conductorAlertSub}>
              {tieneViajeActivo
                ? 'Finalice su viaje activo para habilitar el inicio de la siguiente ruta.'
                : 'Pulse "Aceptar e Iniciar Viaje" en la tarjeta para comenzar el recorrido.'}
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
              Cree rutas por dirección o catálogo y asígnelas al conductor
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

      {/* Alerta de Retraso por Incidentes Viales */}
      {evaluacionRetraso && (
        <View
          style={[
            styles.alertBox,
            evaluacionRetraso.isDelayed ? styles.alertDelayed : styles.alertOk,
          ]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Ionicons
              name={evaluacionRetraso.isDelayed ? 'warning' : 'checkmark-circle'}
              size={18}
              color={evaluacionRetraso.isDelayed ? '#dc2626' : '#15803d'}
              style={{ marginRight: 6 }}
            />
            <Text style={styles.alertTitle}>
              {evaluacionRetraso.isDelayed
                ? `INCIDENTES VIALES: +${evaluacionRetraso.deltaMinutes} min DE RETRASO`
                : 'TIEMPO ESTIMADO EN CRONOGRAMA'}
            </Text>
          </View>
          <Text style={styles.alertSub}>
            Afectaciones activas en ruta: {evaluacionRetraso.affectingIncidentsCount} | ETA:{' '}
            {new Date(evaluacionRetraso.recalculatedEta).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
          <TouchableOpacity style={styles.mapButton} onPress={handleOpenMap}>
            <Ionicons name="map-outline" size={14} color="#ffffff" style={{ marginRight: 4 }} />
            <Text style={styles.mapButtonText}>Ver Mapa Vial</Text>
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
            tieneViajeActivo={tieneViajeActivo}
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

      {/* Modal para Crear y Despachar Rutas (Solo Operador) */}
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
                <Text style={styles.modalTitle}>Despacho de Ruta de Carga</Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 460 }}>
              {/* Sección 1: Selector de Conductor */}
              <Text style={styles.modalSectionLabel}>1. Seleccionar Conductor Asignado:</Text>
              {conductores.length === 0 ? (
                <Text style={styles.noDriversText}>Cargando conductores disponibles...</Text>
              ) : (
                <View style={styles.driverListContainer}>
                  {conductores.map((c: any) => {
                    const isSelected = conductorSeleccionadoId === c.id;
                    const tieneActivo = Boolean(c.viajeActivo);
                    return (
                      <TouchableOpacity
                        key={c.id}
                        style={[
                          styles.driverOptionChip,
                          isSelected && styles.driverOptionChipSelected,
                          tieneActivo && styles.driverOptionChipBusy,
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
                          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text
                              style={[
                                styles.driverOptionName,
                                isSelected && styles.driverOptionNameSelected,
                              ]}
                            >
                              {c.nombre}
                            </Text>
                            {tieneActivo ? (
                              <View style={styles.driverBusyBadge}>
                                <Text style={styles.driverBusyBadgeText}>En Viaje Activo</Text>
                              </View>
                            ) : (
                              <View style={styles.driverFreeBadge}>
                                <Text style={styles.driverFreeBadgeText}>Disponible</Text>
                              </View>
                            )}
                          </View>
                          <Text style={styles.driverOptionDoc}>
                            {c.documento}
                            {tieneActivo
                              ? ` · (${c.viajeActivo.origen} → ${c.viajeActivo.destino})`
                              : ''}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {/* Selector de Modo de Despacho */}
              <Text style={styles.modalSectionLabel}>2. Definición del Recorrido:</Text>
              <View style={styles.modeTabs}>
                <TouchableOpacity
                  style={[styles.modeTab, tipoDespacho === 'preset' && styles.modeTabActive]}
                  onPress={() => setTipoDespacho('preset')}
                >
                  <Ionicons
                    name="list-outline"
                    size={14}
                    color={tipoDespacho === 'preset' ? '#1e3a8a' : '#64748b'}
                    style={{ marginRight: 4 }}
                  />
                  <Text style={[styles.modeTabText, tipoDespacho === 'preset' && styles.modeTabTextActive]}>
                    Corredores Fijos
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modeTab, tipoDespacho === 'personalizado' && styles.modeTabActive]}
                  onPress={() => setTipoDespacho('personalizado')}
                >
                  <Ionicons
                    name="location-outline"
                    size={14}
                    color={tipoDespacho === 'personalizado' ? '#1e3a8a' : '#64748b'}
                    style={{ marginRight: 4 }}
                  />
                  <Text style={[styles.modeTabText, tipoDespacho === 'personalizado' && styles.modeTabTextActive]}>
                    Dirección / Ciudad Libre
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Modo 1: Corredores Frecuentes */}
              {tipoDespacho === 'preset' ? (
                PRESET_FIXED_ROUTES.map((preset, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.presetItem}
                    onPress={() => handleDispatchPreset(preset)}
                    disabled={creando}
                    activeOpacity={0.7}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.presetManifiesto}>{preset.codigoManifiesto}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                        <Text style={styles.presetPointSalida}>Salida: {preset.origenNombre}</Text>
                        <Text style={{ marginHorizontal: 4, color: '#94a3b8' }}>→</Text>
                        <Text style={styles.presetPointEntrada}>Entrada: {preset.destinoNombre}</Text>
                      </View>
                      <Text style={styles.presetInfo}>
                        {preset.distanciaTotalKm} km · {preset.tiempoEstimadoBaseMin / 60} horas estimadas
                      </Text>
                    </View>
                    <Ionicons name="arrow-forward-circle" size={24} color="#1e3a8a" />
                  </TouchableOpacity>
                ))
              ) : (
                /* Modo 2: Formulario de Dirección / Ciudad Libre con Trazado OSRM */
                <View style={styles.customFormBox}>
                  <Text style={styles.inputLabel}>Punto de Salida (Dirección o Ciudad Origen):</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Ej: Bogotá (Zona Franca Fontibón) o Tunja"
                    placeholderTextColor="#94a3b8"
                    value={origenInput}
                    onChangeText={setOrigenInput}
                  />

                  <Text style={styles.inputLabel}>Punto de Entrada (Dirección o Ciudad Destino):</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Ej: Cartagena (Sociedad Portuaria) o Neiva"
                    placeholderTextColor="#94a3b8"
                    value={destinoInput}
                    onChangeText={setDestinoInput}
                  />

                  <Text style={styles.inputLabel}>Código de Manifiesto / Remesa (Opcional):</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Ej: MAN-2026-BOG-CTG"
                    placeholderTextColor="#94a3b8"
                    value={manifiestoInput}
                    onChangeText={setManifiestoInput}
                  />

                  {errorDespacho && (
                    <View style={styles.errorBox}>
                      <Ionicons name="alert-circle" size={14} color="#b91c1c" style={{ marginRight: 4 }} />
                      <Text style={styles.errorTextModal}>{errorDespacho}</Text>
                    </View>
                  )}

                  <TouchableOpacity
                    style={styles.btnCalculateAndDispatch}
                    onPress={handleCustomDispatch}
                    disabled={creando}
                  >
                    {creando ? (
                      <ActivityIndicator size="small" color="#ffffff" style={{ marginRight: 6 }} />
                    ) : (
                      <Ionicons name="calculator-outline" size={16} color="#ffffff" style={{ marginRight: 6 }} />
                    )}
                    <Text style={styles.btnCalculateText}>
                      {creando ? 'Calculando y Despachando...' : 'Calcular Ruta y Despachar'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {creando && tipoDespacho === 'preset' && (
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
  activeTripBanner: {
    backgroundColor: '#eff6ff',
    borderWidth: 1.5,
    borderColor: '#93c5fd',
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 10,
    padding: 12,
  },
  activeTripHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  activeTripTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1d4ed8',
    letterSpacing: 0.5,
    flex: 1,
  },
  activeTripBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  badgeEnRuta: {
    backgroundColor: '#dbeafe',
  },
  badgeSuspended: {
    backgroundColor: '#ffedd5',
  },
  activeTripBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#1e3a8a',
  },
  activeTripRoute: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 2,
  },
  activeTripNote: {
    fontSize: 11,
    color: '#475569',
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
    fontSize: 12,
    fontWeight: '800',
    color: '#1f2937',
    letterSpacing: 0.3,
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
    maxWidth: 540,
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
  driverOptionChipBusy: {
    borderColor: '#fed7aa',
    backgroundColor: '#fffbeb',
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
    marginTop: 2,
  },
  driverBusyBadge: {
    backgroundColor: '#ffedd5',
    paddingVertical: 1,
    paddingHorizontal: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#fdba74',
  },
  driverBusyBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#c2410c',
  },
  driverFreeBadge: {
    backgroundColor: '#dcfce7',
    paddingVertical: 1,
    paddingHorizontal: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#86efac',
  },
  driverFreeBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#15803d',
  },
  modeTabs: {
    flexDirection: 'row',
    marginBottom: 10,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 3,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 6,
  },
  modeTabActive: {
    backgroundColor: '#ffffff',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  modeTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  modeTabTextActive: {
    color: '#1e3a8a',
    fontWeight: '700',
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
  presetPointSalida: {
    fontSize: 12,
    fontWeight: '600',
    color: '#15803d',
  },
  presetPointEntrada: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1d4ed8',
  },
  presetInfo: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  customFormBox: {
    padding: 6,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 4,
    marginTop: 6,
  },
  textInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0f172a',
  },
  btnCalculateAndDispatch: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e3a8a',
    paddingVertical: 10,
    borderRadius: 6,
    marginTop: 14,
  },
  btnCalculateText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fca5a5',
    padding: 6,
    borderRadius: 6,
    marginTop: 8,
  },
  errorTextModal: {
    fontSize: 11,
    color: '#b91c1c',
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
});
