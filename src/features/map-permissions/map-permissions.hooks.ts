import { useMemo } from 'react'

import { useLoaderUser } from '@/entities/user'

interface MapPermissionsInput {
  authorId?: string
  isPublic?: boolean
}

export const useMapPermissions = (map: MapPermissionsInput) => {
  const user = useLoaderUser()

  return useMemo(() => {
    const isOwner = !!user?.id && user.id === map.authorId
    return {
      isOwner,
      canEdit: isOwner,
      canDelete: isOwner,
      canCopy: !isOwner && !!map.isPublic,
      isReadOnly: !isOwner
    }
  }, [user?.id, map.authorId, map.isPublic])
}
