import { createContext, useContext } from 'react';

const ProjectDashboardContext = createContext(null);

export function ProjectDashboardProvider({ children, value }) {
  return (
    <ProjectDashboardContext.Provider value={value}>
      {children}
    </ProjectDashboardContext.Provider>
  );
}

export function useProjectDashboard() {
  const ctx = useContext(ProjectDashboardContext);
  if (!ctx) {
    throw new Error('useProjectDashboard must be used within ProjectDashboardProvider');
  }
  return ctx;
}

export default ProjectDashboardContext;
