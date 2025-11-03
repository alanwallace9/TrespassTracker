'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getTenants, type Tenant } from '@/app/actions/admin/tenants';

type AdminTenantContextType = {
  selectedTenantId: string | null;
  setSelectedTenantId: (tenantId: string) => void;
  tenants: Tenant[];
  tenantsLoading: boolean;
};

const AdminTenantContext = createContext<AdminTenantContextType | undefined>(undefined);

export function AdminTenantProvider({ children }: { children: ReactNode }) {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenantId, setSelectedTenantIdState] = useState<string | null>(null);
  const [tenantsLoading, setTenantsLoading] = useState(true);

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    try {
      setTenantsLoading(true);
      const data = await getTenants();
      setTenants(data);

      // Load selected tenant from localStorage or use first tenant
      const savedTenantId = localStorage.getItem('selectedTenantId');
      if (savedTenantId && data.some(t => t.id === savedTenantId)) {
        setSelectedTenantIdState(savedTenantId);
      } else if (data.length > 0) {
        setSelectedTenantIdState(data[0].id);
        localStorage.setItem('selectedTenantId', data[0].id);
      }
    } catch (error) {
      console.error('[AdminTenantContext] Error loading tenants:', error);
    } finally {
      setTenantsLoading(false);
    }
  };

  const setSelectedTenantId = (tenantId: string) => {
    setSelectedTenantIdState(tenantId);
    localStorage.setItem('selectedTenantId', tenantId);
  };

  return (
    <AdminTenantContext.Provider
      value={{
        selectedTenantId,
        setSelectedTenantId,
        tenants,
        tenantsLoading,
      }}
    >
      {children}
    </AdminTenantContext.Provider>
  );
}

export function useAdminTenant() {
  const context = useContext(AdminTenantContext);
  if (context === undefined) {
    throw new Error('useAdminTenant must be used within AdminTenantProvider');
  }
  return context;
}

// Optional version that returns null instead of throwing
export function useAdminTenantOptional() {
  const context = useContext(AdminTenantContext);
  return context || null;
}
