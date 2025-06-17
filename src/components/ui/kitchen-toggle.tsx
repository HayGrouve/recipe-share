'use client';

import React from 'react';
import { Button } from './button';
import { ChefHat, Printer } from 'lucide-react';
import { useKitchenMode, printRecipe } from '@/lib/kitchen-mode-simple';

interface KitchenToggleProps {
  className?: string;
  size?: 'sm' | 'lg';
  showPrint?: boolean;
}

export function KitchenToggle({
  className = '',
  size = 'sm',
  showPrint = false,
}: KitchenToggleProps) {
  const { isEnabled, toggle } = useKitchenMode();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        onClick={toggle}
        variant={isEnabled ? 'default' : 'outline'}
        size={size}
        aria-label={isEnabled ? 'Disable kitchen mode' : 'Enable kitchen mode'}
        aria-pressed={isEnabled}
        className="min-h-10 min-w-10"
      >
        <ChefHat className="mr-2 h-4 w-4" />
        Kitchen Mode
      </Button>

      {showPrint && (
        <Button
          onClick={printRecipe}
          variant="outline"
          size={size}
          aria-label="Print recipe"
          className="min-h-10 min-w-10"
        >
          <Printer className="mr-2 h-4 w-4" />
          Print
        </Button>
      )}
    </div>
  );
}

export default KitchenToggle;
