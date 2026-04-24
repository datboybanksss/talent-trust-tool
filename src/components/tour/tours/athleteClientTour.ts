import { TOUR_TARGETS } from '../tourTargets';
import type { Step } from '../types';

export const athleteClientTour: Step[] = [
  {
    id: 'dashboard',
    selector: TOUR_TARGETS.CLIENT_NAV_DASHBOARD,
    title: 'Welcome to your dashboard',
    body: 'This is your home base. Everything you need to manage your career and finances is accessible from here.',
    side: 'right',
  },
  {
    id: 'life-file',
    selector: TOUR_TARGETS.CLIENT_NAV_LIFE_FILE,
    title: 'Your Life File',
    body: 'Store and organise your most important personal documents here — ID, medical records, and anything else your advisors might need.',
    side: 'right',
  },
  {
    id: 'contracts',
    selector: TOUR_TARGETS.CLIENT_NAV_CONTRACTS,
    title: 'Contract Manager',
    body: "When your agent adds playing contracts or sponsorship agreements, they'll appear here. You'll always know exactly what you've signed and when.",
    side: 'right',
  },
  {
    id: 'endorsements',
    selector: TOUR_TARGETS.CLIENT_NAV_ENDORSEMENTS,
    title: 'Endorsement Tracker',
    body: "Track your brand deals and sponsorships in one place. See what you're owed, what's active, and what's coming up for renewal.",
    side: 'right',
  },
  {
    id: 'advisors',
    selector: TOUR_TARGETS.CLIENT_NAV_ADVISORS,
    title: 'My Advisors',
    body: 'This is where your agent, manager, lawyer, and other advisors connect to your profile. You control exactly what each person can see.',
    side: 'right',
  },
  {
    id: 'compliance',
    selector: TOUR_TARGETS.CLIENT_NAV_COMPLIANCE,
    title: 'Compliance Reminders',
    body: 'Stay on top of tax deadlines, registration renewals, and other compliance obligations. Nothing slips through the cracks.',
    side: 'right',
  },
  {
    id: 'sharing',
    selector: TOUR_TARGETS.CLIENT_NAV_SHARING,
    title: 'Sharing',
    body: "Grant or revoke access to your profile from here. You're always in control of who sees your financial information.",
    side: 'right',
  },
];
