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
      className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow bg-card border-border"
      onClick={() => onViewRecord(record)}
    >
      <div className="relative aspect-[4/3] bg-secondary">
        {record.photo_url ? (
          <img
            src={record.photo_url}
            alt={`${record.first_name} ${record.last_name}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#3a4556]">
            <div className="text-center">
              <div className="text-6xl font-bold text-[#5a6578]">
                {record.first_name.charAt(0)}
                {record.last_name.charAt(0)}
              </div>
            </div>
          </div>
        )}
        <Badge
          className={`absolute top-2 right-2 text-white`}
          style={{backgroundColor: record.status === 'active' && !isExpired ? '#22c45d' : '#6b7280'}}
        >
          {isExpired ? 'Inactive' : record.status.charAt(0).toUpperCase() + record.status.slice(1)}
        </Badge>
        {record.is_former_student && (
          <div className="absolute bottom-0 left-0 right-0 bg-[#3B82F6] text-white text-sm font-medium py-2 text-center">
            Former Student
          </div>
        )}
      </div>
      <CardContent className="p-4 space-y-1 bg-[#1e293b]">
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
