import { useCallback, useState } from 'react'

export type DrawerTab = 'overview' | 'connections' | 'view'

export const useDrawerTabs = (defaultTab: DrawerTab = 'overview') => {
  const [activeTab, setActiveTab] = useState<DrawerTab>(defaultTab)

  const switchTab = useCallback((tab: DrawerTab) => {
    setActiveTab(tab)
  }, [])

  return {
    activeTab,
    switchTab
  }
}
