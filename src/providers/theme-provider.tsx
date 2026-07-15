'use client';

import * as React from 'react';
import { useThemeStore, applyTheme } from '@/stores/theme-store';

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { theme } = useThemeStore();

  // Sync theme on mount and whenever it changes
  React.useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return <>{children}</>;
};
