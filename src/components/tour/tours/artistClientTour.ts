import { TOUR_TARGETS } from '../tourTargets';
import type { Step } from '../types';

export const artistClientTour: Step[] = [
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
    id: 'royalties',
    selector: TOUR_TARGETS.CLIENT_NAV_ROYALTIES,
    title: 'Royalty Tracker',
    body: "Track streaming income, publishing royalties, and sync licensing payments. Know exactly what you're earning from your music.",
    side: 'right',
  },
  {
    id: 'creative',
    selector: TOUR_TARGETS.CLIENT_NAV_CREATIVE,
    title: 'Creative Portfolio',
    body: 'Showcase your work and manage your creative catalogue. Your discography, projects, and media in one place.',
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
