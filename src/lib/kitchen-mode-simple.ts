'use client';

import { announce } from './focus-management';
import { useState, useEffect } from 'react';

// Simple kitchen mode manager
export class SimpleKitchenMode {
  private isEnabled = false;
  private listeners: Set<() => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadState();
    }
  }

  private loadState() {
    const saved = localStorage.getItem('kitchen-mode');
    this.isEnabled = saved === 'true';
    if (this.isEnabled) {
      this.applyKitchenMode();
    }
  }

  private saveState() {
    localStorage.setItem('kitchen-mode', String(this.isEnabled));
  }

  private applyKitchenMode() {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.add('kitchen-mode');
    }
  }

  private removeKitchenMode() {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('kitchen-mode');
    }
  }

  public enable() {
    this.isEnabled = true;
    this.saveState();
    this.applyKitchenMode();
    this.notifyListeners();
    announce('Kitchen mode enabled - larger buttons and text');
  }

  public disable() {
    this.isEnabled = false;
    this.saveState();
    this.removeKitchenMode();
    this.notifyListeners();
    announce('Kitchen mode disabled');
  }

  public toggle() {
    if (this.isEnabled) {
      this.disable();
    } else {
      this.enable();
    }
  }

  public getState() {
    return this.isEnabled;
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener());
  }
}

export const kitchenMode = new SimpleKitchenMode();

// React hook
export function useKitchenMode() {
  const [isEnabled, setIsEnabled] = useState(kitchenMode.getState());

  useEffect(() => {
    const unsubscribe = kitchenMode.subscribe(() => {
      setIsEnabled(kitchenMode.getState());
    });
    return unsubscribe;
  }, []);

  return {
    isEnabled,
    enable: () => kitchenMode.enable(),
    disable: () => kitchenMode.disable(),
    toggle: () => kitchenMode.toggle(),
  };
}

// Print optimization
export function printRecipe() {
  if (typeof window !== 'undefined') {
    window.print();
    announce('Recipe sent to printer');
  }
}
