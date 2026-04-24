export type AgentView =
  | 'executive' | 'clients' | 'pipeline' | 'calendar'
  | 'compare' | 'templates' | 'agency' | 'share';

export type TourId = 'athleteClient' | 'artistClient' | 'agentOwner' | 'staff';

export type Step = {
  id: string;
  selector: string;
  title: string;
  body: string;
  side?: 'left' | 'right' | 'top' | 'bottom';
  view?: AgentView;
  beforeStep?: () => void | Promise<void>;
  waitForElement?: boolean;
  skipIfMissing?: boolean;
  navigateTo?: string;
};
