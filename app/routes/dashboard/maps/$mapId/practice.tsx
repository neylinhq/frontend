import { Navigate, useParams } from 'react-router'

/**
 * Practice route is deprecated — practice mode now lives in the map sidebar.
 * Redirect to the map view where practice mode can be activated via the FAB button.
 */
export default function PracticeRoute() {
  const { mapId } = useParams()
  return <Navigate to={`/dashboard/maps/${mapId}/view`} replace />
}
