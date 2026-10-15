import { create } from 'zustand';
import { AlertSeverity } from '../../domain/models/RoadAlert';

interface AlertsState {
  selectedDepartment: string | null;
  selectedSeverity: AlertSeverity | 'TODAS';
  searchQuery: string;
  setSelectedDepartment: (dept: string | null) => void;
  setSelectedSeverity: (severity: AlertSeverity | 'TODAS') => void;
  setSearchQuery: (query: string) => void;
}

export const useAlertsStore = create<AlertsState>((set) => ({
  selectedDepartment: null,
  selectedSeverity: 'TODAS',
  searchQuery: '',
  setSelectedDepartment: (selectedDepartment) => set({ selectedDepartment }),
  setSelectedSeverity: (selectedSeverity) => set({ selectedSeverity }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
}));
