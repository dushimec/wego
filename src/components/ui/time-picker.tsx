'use client';

import * as React from 'react';
import { Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface TimePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const TimePicker = React.forwardRef<HTMLInputElement, TimePickerProps>(
  ({ className, ...props }, ref) => {
    return (
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Clock className="h-4 w-4 text-muted-foreground" />
        </div>
        <Input
          type="time"
          className={cn("pl-10", className)}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);

TimePicker.displayName = 'TimePicker';

export { TimePicker };
