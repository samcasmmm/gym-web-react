import React from 'react';

export type CalculatorTab =
  | 'bmi'
  | 'calorie'
  | 'protein'
  | 'fasting'
  | 'carbcycling'
  | 'timeline'
  | 'bodyfat'
  | 'bmr'
  | 'idealweight'
  | 'onerm'
  | 'hydration'
  | 'pace'
  | 'pregnancy'
  | 'conception'
  | 'duedate';

export type UnitSystem = 'metric' | 'imperial';

export interface CategoryGroup {
  name: string;
  tabs: {
    id: CalculatorTab;
    name: string;
    icon: React.ElementType;
    tag: string;
    desc: string;
  }[];
}

export interface BaseCalculatorProps {
  unitSystem: UnitSystem;
  onSaveWeight?: (weightKg: number) => void;
  onNavigateTab?: (tab: CalculatorTab, params?: any) => void;
}
