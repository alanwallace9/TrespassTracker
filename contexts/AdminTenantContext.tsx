'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useTransition } from 'react';
import { getTenants, type Tenant } from '@/app/actions/admin/tenants';
import { switchActiveTenant, getActiveTenant } from '@/app/actions/admin/switch-tenant';
import { useRouter } from 'next/navigation';

type AdminTenantContextType = {
  selectedTenantId: string | null;
  setSelectedTenantId: (tenantId: string) => Promise<void>;
  tenants: Tenant[];
  tenantsLoading: boolean;
  switching: boolean;
};

const AdminTenantContext = createContext<AdminTenantContextType | undefined>(undefined);

export function AdminTenantProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenantId, setSelectedTenantIdState] = useState<string | null>(null);
  const [tenantsLoading, setTenantsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    try {
      setTenantsLoading(true);

      // Load all tenants
      const data = await getTenants();
      setTenants(data);

      // Get active tenant from database (source of truth)
      const { tenantId } = await getActiveTenant();

      if (tenantId) {
        setSelectedTenantIdState(tenantId);
      } else if (data.length > 0) {
        // Fallback to first tenant if no active tenant set
        setSelectedTenantIdState(data[0].id);
      }
    } catch (error) {
      console.error('[AdminTenantContext] Error loading tenants:', error);
    } finally {
      setTenantsLoading(false);
    }
  };

  const setSelectedTenantId = async (tenantId: string) => {
    // Optimistically update UI
    setSelectedTenantIdState(tenantId);

    // Call server action to update database
    startTransition(async () => {
      const result = await switchActiveTenant(tenantId);

      if (result.success) {
        // Refresh the page to reload data with new tenant
        router.refresh();
      } else {
        // Revert on error
        console.error('[AdminTenantContext] Failed to switch tenant:', result.error);
        // Reload to get correct state from database
        await loadTenants();
      }
    });
  };

  return (
    <AdminTenantContext.Provider
      value={{
        selectedTenantId,
        setSelectedTenantId,
        tenants,
        tenantsLoading,
        switching: isPending,
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
