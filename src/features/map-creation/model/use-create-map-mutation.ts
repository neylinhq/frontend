import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mapApi, mapKeys } from '@/entities/map'

interface CreateMapInput {
  title: string
  description?: string
}

export const useCreateMapMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ title, description }: CreateMapInput) => {
      return mapApi.createMap({ title, description })
    },

    onSuccess: () => {
      // Invalidate maps list to refetch
      queryClient.invalidateQueries({
        queryKey: mapKeys.all
      })
    }
  })
}
