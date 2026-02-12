import React, { createContext, useContext, ReactNode } from 'react';
import { useFlags } from '@/hooks/useFlags';
import { useUserSettings } from '@/hooks/useUserSettings';

type FlagContextType = ReturnType<typeof useFlags> & {
  userSettings: ReturnType<typeof useUserSettings>['settings'];
  userSettingsLoaded: boolean;
  updateUserSetting: ReturnType<typeof useUserSettings>['updateSetting'];
};

const FlagContext = createContext<FlagContextType | null>(null);

export function FlagProvider({ children }: { children: ReactNode }) {
  const flagStore = useFlags();
  const { settings: userSettings, loaded: userSettingsLoaded, updateSetting } = useUserSettings();

  return (
    <FlagContext.Provider value={{
      ...flagStore,
      userSettings,
      userSettingsLoaded,
      updateUserSetting: updateSetting,
    }}>
      {children}
    </FlagContext.Provider>
  );
}

export function useFlagContext() {
  const ctx = useContext(FlagContext);
  if (!ctx) throw new Error('useFlagContext must be used within FlagProvider');
  return ctx;
}
