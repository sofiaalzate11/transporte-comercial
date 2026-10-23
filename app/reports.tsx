import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { useUserReports } from '../src/presentation/hooks/useUserReports';
import { UserIncidentType } from '../src/domain/models/UserReport';

export default function ReportsScreen() {
  const { reports, createReport, deleteReport } = useUserReports();
  const [roadName, setRoadName] = useState('');
  const [kilometer, setKilometer] = useState('');
  const [description, setDescription] = useState('');
  const [incidentType, setIncidentType] = useState<UserIncidentType>('DERRUMBE');

  const handleAdd = () => {
    if (!roadName.trim() || !description.trim()) {
      Alert.alert('Error', 'Ingrese la vía y la descripción.');
      return;
    }

    createReport({
      id: `rep-${Date.now()}`,
      roadName: roadName.trim(),
      kilometer: Number(kilometer) || 0,
      description: description.trim(),
      incidentType,
      createdAt: new Date().toISOString(),
    });

    setRoadName('');
    setKilometer('');
    setDescription('');
  };

  return (
    <View style={styles.container}>
      {/* Formulario Crear */}
      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Reportar Incidencia Propia</Text>
        <TextInput
          placeholder="Nombre de la Vía (ej. Medellín - Bogotá)"
          placeholderTextColor="#64748B"
          style={styles.input}
          value={roadName}
          onChangeText={setRoadName}
        />
        <TextInput
          placeholder="Kilómetro (ej. 42)"
          placeholderTextColor="#64748B"
          keyboardType="numeric"
          style={styles.input}
          value={kilometer}
          onChangeText={setKilometer}
        />
        <TextInput
          placeholder="Descripción del incidente..."
          placeholderTextColor="#64748B"
          style={[styles.input, { height: 60 }]}
          multiline
          value={description}
          onChangeText={setDescription}
        />
        <TouchableOpacity style={styles.submitBtn} onPress={handleAdd}>
          <Text style={styles.submitText}>Guardar Reporte en SQLite</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de Reportes */}
      <FlatList
        data={reports}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.reportCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardRoad}>{item.roadName} (km {item.kilometer})</Text>
              <Text style={styles.cardType}>{item.incidentType}</Text>
            </View>
            <Text style={styles.cardDesc}>{item.description}</Text>
            <TouchableOpacity
              style={styles.delBtn}
              onPress={() => deleteReport(item.id)}
            >
              <Text style={styles.delText}>Eliminar Reporte</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No has registrado reportes personales aún.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1120', padding: 16 },
  formCard: { backgroundColor: '#1E293B', padding: 16, borderRadius: 12, marginBottom: 16 },
  formTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: '700', marginBottom: 12 },
  input: {
    backgroundColor: '#0F172A',
    color: '#F8FAFC',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  submitBtn: { backgroundColor: '#0284C7', padding: 12, borderRadius: 8, alignItems: 'center' },
  submitText: { color: '#FFFFFF', fontWeight: '700' },
  reportCard: { backgroundColor: '#1E293B', padding: 14, borderRadius: 10, marginBottom: 10 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  cardRoad: { color: '#F8FAFC', fontWeight: '700', fontSize: 14 },
  cardType: { color: '#38BDF8', fontSize: 12, fontWeight: '600' },
  cardDesc: { color: '#94A3B8', fontSize: 13, marginBottom: 8 },
  delBtn: { alignSelf: 'flex-end', padding: 4 },
  delText: { color: '#EF4444', fontSize: 12, fontWeight: '600' },
  empty: { marginTop: 30, alignItems: 'center' },
  emptyText: { color: '#64748B', fontSize: 14 },
});