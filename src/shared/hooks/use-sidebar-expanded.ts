import { useDashboardSidebarStore } from '@/shared/store/dashboard-sidebar'

export const useSidebarExpanded = () => useDashboardSidebarStore(state => state.isExpanded)
