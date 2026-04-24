import { createContext, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAccountState } from '@/lib/accountState';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { selectTour } from './selectTour';
import type { TourId } from './types';
import 'driver.js/dist/driver.css';
import './TourStyles.css';

export type TourContextType = {
  start: () => Promise<void>;
  skip: () => void;
  finish: () => void;
  canReplay: boolean;
  isRunning: boolean;
  currentTourId: TourId | null;
};

export const TourContext = createContext<TourContextType | null>(null);

export const TourProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const account = useAccountState();
  const { profile, loading: profileLoading } = useProfile();
  const location = useLocation();

  const [isRunning, setIsRunning] = useState(false);
  const [currentTourId, setCurrentTourId] = useState<TourId | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const driverRef = useRef<any>(null);
  const didAutoRunRef = useRef(false);
  const stampedRef = useRef(false);

  const tourCompletedAt: string | null = profile?.tour_completed_at ?? null;
  const tourDismissedAt: string | null = profile?.tour_dismissed_at ?? null;
  const canReplay = !!(tourCompletedAt || tourDismissedAt);

  const tourSelection = useMemo(
    () => (account.state ? selectTour(account.state) : null),
    [account.state],
  );

  const markComplete = async () => {
    if (stampedRef.current || !user) return;
    stampedRef.current = true;
    await supabase
      .from('profiles')
      .update({ tour_completed_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .is('tour_completed_at', null);
  };

  const markDismissed = async () => {
    if (stampedRef.current || !user) return;
    stampedRef.current = true;
    await supabase
      .from('profiles')
      .update({ tour_dismissed_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .is('tour_dismissed_at', null);
  };

  const start = async () => {
    if (!tourSelection) return;
    stampedRef.current = false;

    const { driver } = await import('driver.js');

    const steps = tourSelection.steps.map((step) => ({
      element: `[data-tour="${step.selector}"]`,
      popover: {
        title: step.title,
        description: step.body,
        side: step.side ?? 'right',
        align: 'start' as const,
      },
    }));

    const driverObj = driver({
      steps,
      animate: true,
      showProgress: true,
      onDestroyStarted: () => {
        if (driverObj.isLastStep()) {
          void markComplete();
        } else {
          void markDismissed();
        }
        driverObj.destroy();
      },
      onDestroyed: () => {
        setIsRunning(false);
        setCurrentTourId(null);
        driverRef.current = null;
      },
    });

    driverRef.current = driverObj;
    setIsRunning(true);
    setCurrentTourId(tourSelection.tourId);
    driverObj.drive();
  };

  const skip = () => {
    void markDismissed();
    driverRef.current?.destroy();
  };

  const finish = () => {
    void markComplete();
    driverRef.current?.destroy();
  };

  // Auto-run: once per TourProvider mount, 300ms debounce
  useEffect(() => {
    if (didAutoRunRef.current) return;
    if (!user || account.loading || profileLoading) return;
    if (!tourSelection) return;

    const isExactRoute =
      location.pathname === '/dashboard' ||
      location.pathname === '/agent-dashboard';
    if (!isExactRoute) return;

    if (tourCompletedAt || tourDismissedAt) return;

    const firstEl = document.querySelector(
      `[data-tour="${tourSelection.steps[0].selector}"]`,
    );
    if (!firstEl) return;

    didAutoRunRef.current = true;
    const timer = window.setTimeout(() => void start(), 300);
    return () => window.clearTimeout(timer);
  }, [
    user,
    account.loading,
    account.state,
    profileLoading,
    location.pathname,
    tourCompletedAt,
    tourDismissedAt,
    tourSelection,
  ]);

  // Tear down when user signs out
  useEffect(() => {
    if (!user) {
      driverRef.current?.destroy();
      driverRef.current = null;
      didAutoRunRef.current = false;
      stampedRef.current = false;
    }
  }, [user]);

  return (
    <TourContext.Provider value={{ start, skip, finish, canReplay, isRunning, currentTourId }}>
      {children}
    </TourContext.Provider>
  );
};
