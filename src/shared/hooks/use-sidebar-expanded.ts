import { useDashboardSidebarStore } from '@/shared/store'

export const useSidebarExpanded = () => useDashboardSidebarStore(state => state.isExpanded)
