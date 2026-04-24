import { useContext } from 'react';
import { TourContext } from './TourProvider';
import type { TourContextType } from './TourProvider';

export function useGuidedTour(): TourContextType {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error('useGuidedTour must be used within TourProvider');
  return ctx;
}
