'use client';

import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CronTriggerConfigProps {
  initialConfig?: Record<string, unknown>;
  onConfigChange: (config: Record<string, unknown>) => void;
}

export function CronTriggerConfig({ initialConfig, onConfigChange }: CronTriggerConfigProps) {
  const [schedule, setSchedule] = useState(
    (initialConfig?.schedule as string) || '0 0 * * *'
  );
  const [preset, setPreset] = useState('custom');

  const cronPresets = [
    { value: 'custom', label: 'Custom', cron: '' },
    { value: 'every-minute', label: 'Every minute', cron: '* * * * *' },
    { value: 'every-5-minutes', label: 'Every 5 minutes', cron: '*/5 * * * *' },
    { value: 'every-15-minutes', label: 'Every 15 minutes', cron: '*/15 * * * *' },
    { value: 'every-30-minutes', label: 'Every 30 minutes', cron: '*/30 * * * *' },
    { value: 'hourly', label: 'Every hour', cron: '0 * * * *' },
    { value: 'daily', label: 'Daily at midnight', cron: '0 0 * * *' },
    { value: 'daily-9am', label: 'Daily at 9 AM', cron: '0 9 * * *' },
    { value: 'weekly', label: 'Weekly (Monday 9 AM)', cron: '0 9 * * 1' },
    { value: 'monthly', label: 'Monthly (1st at midnight)', cron: '0 0 1 * *' },
  ];

  useEffect(() => {
    onConfigChange({ schedule });
  }, [schedule, onConfigChange]);

  const handlePresetChange = (value: string) => {
    setPreset(value);
    const selectedPreset = cronPresets.find((p) => p.value === value);
    if (selectedPreset && selectedPreset.cron) {
      setSchedule(selectedPreset.cron);
    }
  };

  const handleScheduleChange = (value: string) => {
    setSchedule(value);
    setPreset('custom');
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="cron-preset" className="text-sm">Schedule Preset</Label>
        <Select value={preset} onValueChange={handlePresetChange}>
          <SelectTrigger id="cron-preset" className="text-sm">
            <SelectValue placeholder="Select preset" />
          </SelectTrigger>
          <SelectContent>
            {cronPresets.map((p) => (
              <SelectItem key={p.value} value={p.value} className="text-sm">
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cron-schedule" className="text-sm">Cron Expression</Label>
        <Input
          id="cron-schedule"
          value={schedule}
          onChange={(e) => handleScheduleChange(e.target.value)}
          placeholder="0 0 * * *"
          className="font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">
          <code className="bg-muted px-1 rounded text-xs">minute hour day month weekday</code>
        </p>
      </div>

      <div className="rounded-md border border-border/50 bg-muted/30 px-3 py-2">
        <p className="text-xs font-medium text-muted-foreground mb-1">Current: <code className="bg-muted px-1 rounded">{schedule}</code></p>
        <div className="text-[10px] text-muted-foreground space-y-0.5">
          <div>• <code className="bg-muted px-1 rounded">*</code> any • <code className="bg-muted px-1 rounded">*/5</code> every 5 • <code className="bg-muted px-1 rounded">0-5</code> range • <code className="bg-muted px-1 rounded">1,3,5</code> specific</div>
        </div>
      </div>
    </div>
  );
}
