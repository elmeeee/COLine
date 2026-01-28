import { useQuery } from '@tanstack/react-query'
import { client } from '../api/client'

export function useStations() {
    return useQuery({
        queryKey: ['stations'],
        queryFn: client.getStations,
        staleTime: Infinity, // Stations rarely change
    })
}

export function useSchedule(stationId: string | null) {
    return useQuery({
        queryKey: ['schedule', stationId],
        queryFn: () => client.getSchedule(stationId!),
        enabled: !!stationId,
        refetchInterval: 60000, // Reduced to 60s to prevent too many requests
        refetchOnWindowFocus: false, // Don't refetch when window regains focus
        retry: 2, // Reduced to 2 retries
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        staleTime: 30000, // Consider data fresh for 30s
    })
}
