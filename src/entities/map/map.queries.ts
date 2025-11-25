import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { mapApi } from './map.api'

export const mapKeys = {
  all: ['maps'] as const,
  lists: () => [...mapKeys.all, 'list'] as const,
  list: (filters: string) => [...mapKeys.lists(), { filters }] as const,
  details: () => [...mapKeys.all, 'detail'] as const,
  detail: (id: string) => [...mapKeys.details(), id] as const
}

export const useMaps = () => {
  return useQuery({
    queryKey: mapKeys.lists(),
    queryFn: mapApi.getMaps
  })
}

export const useMap = (id: string) => {
  return useQuery({
    queryKey: mapKeys.detail(id),
    queryFn: () => mapApi.getMapById(id),
    enabled: !!id
  })
}

export const useCreateMap = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: mapApi.createMap,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mapKeys.lists() })
    }
  })
}
