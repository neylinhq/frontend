import { useCallback, useState } from 'react'

export type DrawerTab = 'properties' | 'connections' | 'overview' | 'view'

export const useDrawerTabs = (defaultTab: DrawerTab = 'properties') => {
  const [activeTab, setActiveTab] = useState<DrawerTab>(defaultTab)

  const switchTab = useCallback((tab: DrawerTab) => {
    setActiveTab(tab)
  }, [])

  return {
    activeTab,
    switchTab
  }
}
