import { create } from 'zustand';

interface SessionState {
  driverName: string;
  vehiclePlate: string;
  vehicleCategory: string; // 'I', 'II', 'III', 'IV', 'V'
  isTrackingActive: boolean;
  setDriverInfo: (name: string, plate: string, category: string) => void;
  setTrackingActive: (active: boolean) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  driverName: 'Conductor Registrado',
  vehiclePlate: 'COL-767',
  vehicleCategory: 'I',
  isTrackingActive: false,
  setDriverInfo: (driverName, vehiclePlate, vehicleCategory) =>
    set({ driverName, vehiclePlate, vehicleCategory }),
  setTrackingActive: (isTrackingActive) => set({ isTrackingActive }),
}));
