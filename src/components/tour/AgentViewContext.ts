import { createContext, useContext } from 'react';
import type { AgentView } from './types';

type AgentViewContextType = {
  activeView: AgentView;
  setActiveView: (view: AgentView) => void;
};

export const AgentViewContext = createContext<AgentViewContextType | null>(null);

export const useAgentView = () => useContext(AgentViewContext);
