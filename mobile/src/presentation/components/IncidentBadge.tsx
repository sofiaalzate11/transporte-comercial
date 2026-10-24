import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { IncidentSeverity } from '../../shared/types';

interface Props {
  gravedad: IncidentSeverity;
  tipo: string;
}

export const IncidentBadge: React.FC<Props> = ({ gravedad, tipo }) => {
  const getBackgroundColor = () => {
    switch (gravedad) {
      case IncidentSeverity.CRITICAL:
        return '#dc2626';
      case IncidentSeverity.HIGH:
        return '#ea580c';
      case IncidentSeverity.MEDIUM:
        return '#d97706';
      case IncidentSeverity.LOW:
      default:
        return '#0284c7';
    }
  };

  return (
    <View style={[styles.badge, { backgroundColor: getBackgroundColor() }]}>
      <Text style={styles.text}>{tipo.toUpperCase()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  text: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
