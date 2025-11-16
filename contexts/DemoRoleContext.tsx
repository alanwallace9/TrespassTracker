'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';

type DemoRole = 'viewer' | 'campus_admin' | 'district_admin';

type DemoRoleContextType = {
  isDemoMode: boolean;
  demoRole: DemoRole;
  setDemoRole: (role: DemoRole) => void;
  availableRoles: { value: DemoRole; label: string; description: string }[];
};

const DemoRoleContext = createContext<DemoRoleContextType | undefined>(undefined);

const DEMO_ROLES = [
  {
    value: 'viewer' as DemoRole,
    label: 'Viewer',
    description: 'Can view records but cannot edit',
  },
  {
    value: 'campus_admin' as DemoRole,
    label: 'Campus Admin',
    description: 'Can create, edit, and manage records for their campus',
  },
  {
    value: 'district_admin' as DemoRole,
    label: 'District Admin',
    description: 'Full access to all records and campuses in the district',
  },
];

export function DemoRoleProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [demoRole, setDemoRoleState] = useState<DemoRole>('viewer');
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    // Check if we're on the demo subdomain
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const isDemo = hostname.includes('demo.') || hostname === 'demo.districttracker.com';
      setIsDemoMode(isDemo);

      // Load saved demo role from sessionStorage (only persists for session)
      if (isDemo) {
        const savedRole = sessionStorage.getItem('demo_role') as DemoRole;
        if (savedRole && DEMO_ROLES.some(r => r.value === savedRole)) {
          setDemoRoleState(savedRole);
        }
      }
    }
  }, []);

  const setDemoRole = (role: DemoRole) => {
    setDemoRoleState(role);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('demo_role', role);
    }
  };

  return (
    <DemoRoleContext.Provider
      value={{
        isDemoMode,
        demoRole,
        setDemoRole,
        availableRoles: DEMO_ROLES,
      }}
    >
      {children}
    </DemoRoleContext.Provider>
  );
}

export function useDemoRole() {
  const context = useContext(DemoRoleContext);
  if (context === undefined) {
    throw new Error('useDemoRole must be used within DemoRoleProvider');
  }
  return context;
}

// Optional version that returns null instead of throwing
export function useDemoRoleOptional() {
  const context = useContext(DemoRoleContext);
  return context || null;
}
