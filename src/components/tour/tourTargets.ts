export const TOUR_TARGETS = {
  // Client sidebar
  CLIENT_BRAND: 'client-brand',
  CLIENT_NAV_DASHBOARD: 'client-nav-dashboard',
  CLIENT_NAV_LIFE_FILE: 'client-nav-life-file',
  CLIENT_NAV_CONTRACTS: 'client-nav-contracts',
  CLIENT_NAV_ENDORSEMENTS: 'client-nav-endorsements',
  CLIENT_NAV_ROYALTIES: 'client-nav-royalties',
  CLIENT_NAV_CREATIVE: 'client-nav-creative-portfolio',
  CLIENT_NAV_ADVISORS: 'client-nav-advisors',
  CLIENT_NAV_COMPLIANCE: 'client-nav-compliance',
  CLIENT_NAV_SHARING: 'client-nav-sharing',
  CLIENT_DASHBOARD_OVERVIEW: 'client-dashboard-overview',
  CLIENT_NAV_SIGNOUT: 'client-nav-signout',
  CLIENT_TOUR_REPLAY: 'client-tour-replay',

  // Agent sidebar (PR 2)
  AGENT_BRAND: 'agent-brand',
  AGENT_NAV_EXECUTIVE: 'agent-nav-executive',
  AGENT_NAV_CLIENTS: 'agent-nav-clients',
  AGENT_NAV_PIPELINE: 'agent-nav-pipeline',
  AGENT_NAV_CALENDAR: 'agent-nav-calendar',
  AGENT_NAV_COMPARE: 'agent-nav-compare',
  AGENT_NAV_TEMPLATES: 'agent-nav-templates',
  AGENT_NAV_AGENCY: 'agent-nav-agency',
  AGENT_NAV_SHARE: 'agent-nav-share',
  AGENT_NAV_MYAGENCY: 'agent-nav-myagency',
  AGENT_QUICK_ACTIONS: 'agent-quick-actions',
  AGENT_NAV_SIGNOUT: 'agent-nav-signout',
  AGENT_TOUR_REPLAY: 'agent-tour-replay',

  // Agent content wrappers (PR 2)
  AGENT_EXECUTIVE_WRAPPER: 'agent-executive-wrapper',
  AGENT_CLIENTS_WRAPPER: 'agent-clients-wrapper',
  AGENT_PIPELINE_WRAPPER: 'agent-pipeline-wrapper',
  AGENT_CALENDAR_WRAPPER: 'agent-calendar-wrapper',
} as const;

export type TourTarget = typeof TOUR_TARGETS[keyof typeof TOUR_TARGETS];
