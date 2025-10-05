'use client';

import { TrespassRecord } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface RecordCardProps {
  record: TrespassRecord;
  onViewRecord: (record: TrespassRecord) => void;
}

export function RecordCard({ record, onViewRecord }: RecordCardProps) {
  const age = record.date_of_birth
    ? Math.floor((new Date().getTime() - new Date(record.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null;

  const isExpired = record.expiration_date && new Date(record.expiration_date) < new Date();

  return (
    <Card
      className="overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl bg-card border-border"
      style={{
        boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.19), 0px 12px 12px rgba(0, 0, 0, 0.08)'
      }}
      onClick={() => onViewRecord(record)}
    >
      <div className="relative aspect-[4/3] bg-secondary border-b-2 border-border-muted">
        {record.photo_url ? (
          <img
            src={record.photo_url}
            alt={`${record.first_name} ${record.last_name}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-card">
            <div className="text-center">
              <div className="text-6xl font-bold text-muted-foreground">
                {record.first_name.charAt(0)}
                {record.last_name.charAt(0)}
              </div>
            </div>
          </div>
        )}
        <Badge
          className={`absolute top-2 right-2 text-white ${
            record.status === 'active' && !isExpired ? 'bg-status-active' : 'bg-status-inactive'
          }`}
        >
          {isExpired ? 'Inactive' : record.status.charAt(0).toUpperCase() + record.status.slice(1)}
        </Badge>
        {record.is_former_student && (
          <div className="absolute bottom-0 left-0 right-0 bg-primary text-white text-sm font-medium py-2 text-center">
            Former Student
          </div>
        )}
      </div>
      <CardContent className="p-4 space-y-1 bg-card">
        <h3 className="font-semibold text-base text-foreground">
          {record.first_name.charAt(0).toUpperCase() + record.first_name.slice(1).toLowerCase()} {record.last_name.charAt(0).toUpperCase() + record.last_name.slice(1).toLowerCase()}
        </h3>
        <div className="text-sm text-muted-foreground">
          {age && <span>{age} years old</span>}
        </div>
      </CardContent>
    </Card>
  );
}
