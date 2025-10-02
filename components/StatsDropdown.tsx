'use client';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown, TriangleAlert as AlertTriangle, Clock, FileText } from 'lucide-react';

interface StatsDropdownProps {
  stats: {
    total: number;
    active: number;
    inactive: number;
  };
}

export function StatsDropdown({ stats }: StatsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileText className="w-4 h-4" />
          Stats
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuLabel>Record Statistics</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <div className="flex justify-between items-center w-full">
            <span className="text-slate-600">Total Records</span>
            <span className="font-semibold">{stats.total}</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-1" style={{color: '#22c45d'}}>
              <AlertTriangle className="w-3 h-3" />
              <span>Active</span>
            </div>
            <span className="font-semibold" style={{color: '#22c45d'}}>{stats.active}</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-1 text-yellow-600">
              <Clock className="w-3 h-3" />
              <span>Inactive</span>
            </div>
            <span className="font-semibold text-yellow-600">{stats.inactive}</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
