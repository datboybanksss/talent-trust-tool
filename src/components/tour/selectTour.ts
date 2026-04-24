import type { TourId, Step } from './types';
import { athleteClientTour } from './tours/athleteClientTour';
import { artistClientTour } from './tours/artistClientTour';

export function selectTour(
  state: string,
  _sections?: string[],
): { tourId: TourId; steps: Step[] } | null {
  switch (state) {
    case 'athlete':
      return { tourId: 'athleteClient', steps: athleteClientTour };
    case 'artist':
      return { tourId: 'artistClient', steps: artistClientTour };
    default:
      return null;
  }
}
