import axios from 'axios'
import { Station, Schedule, StationSchedule, FareDetail, TrainRoute } from './types'

// Use local proxy in development, direct API in production
const KRL_API_BASE_URL = import.meta.env.DEV ? '/api/krl-webs/v1' : 'https://api-partner.krl.co.id/krl-webs/v1'

const api = axios.create({
    baseURL: KRL_API_BASE_URL,
    timeout: 30000, // Increased to 30 seconds for slow API responses
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
})

// API Response Types for Official KRL API
interface APIResponse<T> {
    status: number
    message?: string
    data: T
}

interface KRLStation {
    sta_id: string
    sta_name: string
    group_wil: number
    fg_enable: number
}

interface KRLSchedule {
    train_id: string
    ka_name: string
    route_name: string
    dest: string
    time_est: string
    color: string
    dest_time: string
}

interface KRLTrainRouteItem {
    train_id: string
    ka_name: string
    station_id: string
    station_name: string
    time_est: string
    transit_station: boolean
    color: string
    transit: string[] | string
}

interface KRLFareItem {
    sta_code_from: string
    sta_name_from: string
    sta_code_to: string
    sta_name_to: string
    fare: number
    distance: string
}

interface KRLRouteMap {
    area: number
    permalink: string
}

// Station coordinates mapping (approximate)
const stationCoordinates: Record<string, { lat: number, lon: number }> = {
    'JAK': { lat: -6.1376, lon: 106.8146 },
    'JAKK': { lat: -6.1376, lon: 106.8146 },
    'MRI': { lat: -6.2099, lon: 106.8503 },
    'AC': { lat: -6.1250, lon: 106.8400 },
    'TPK': { lat: -6.1050, lon: 106.8800 },
    'CKI': { lat: -6.1983, lon: 106.8407 },
    'GDD': { lat: -6.1862, lon: 106.8329 },
    'JUA': { lat: -6.1666, lon: 106.8306 },
    'SW': { lat: -6.1557, lon: 106.8277 },
    'MGB': { lat: -6.1491, lon: 106.8247 },
    'JAY': { lat: -6.1413, lon: 106.8200 },
    'CSK': { lat: -6.3369, lon: 106.5497 },
    'RK': { lat: -6.5558, lon: 106.2489 },
    'THB': { lat: -6.1862, lon: 106.8140 },
    'PRP': { lat: -6.3369, lon: 106.6333 },
    'TGS': { lat: -6.2833, lon: 106.6167 },
    'SRP': { lat: -6.2833, lon: 106.6667 },
    'BKS': { lat: -6.2383, lon: 106.9756 },
    'BUA': { lat: -6.1950, lon: 106.8950 },
    'DPK': { lat: -6.4025, lon: 106.8192 },
    'PLM': { lat: -6.2074, lon: 106.8456 },
    'SDM': { lat: -6.1950, lon: 106.9100 }
}

// Helper to format time
function formatTime(timeString: string): string {
    try {
        // Time format from API: "HH:MM:SS" or "HH:MM"
        const parts = timeString.split(':')
        if (parts.length >= 2) {
            return `${parts[0]}:${parts[1]}`
        }
        return timeString
    } catch (error) {
        return timeString
    }
}

// Helper to get status based on time
function getStatus(timeEst: string): string {
    try {
        const now = new Date()
        const [hours, minutes] = timeEst.split(':').map(Number)
        const estTime = new Date()
        estTime.setHours(hours, minutes, 0, 0)

        const diffMinutes = Math.floor((estTime.getTime() - now.getTime()) / (1000 * 60))

        if (diffMinutes < -10) return 'Departed'
        if (diffMinutes < 0) return 'Departing'
        if (diffMinutes < 5) return 'Boarding'
        if (diffMinutes < 15) return 'Arriving Soon'
        return 'On Time'
    } catch (error) {
        return 'Scheduled'
    }
}

// Helper to get current time range (now to +3 hours)
function getTimeRange(): { from: string, to: string } {
    const now = new Date()
    const from = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

    const later = new Date(now.getTime() + 3 * 60 * 60 * 1000) // +3 hours
    const to = `${later.getHours().toString().padStart(2, '0')}:${later.getMinutes().toString().padStart(2, '0')}`

    return { from, to }
}

// API CLIENT
export const client = {
    getStations: async (): Promise<Station[]> => {
        try {
            const response = await api.get<APIResponse<KRLStation[]>>('/krl-station')

            // Filter only enabled stations (fg_enable = 1) and exclude area markers
            const enabledStations = response.data.data.filter(station =>
                station.fg_enable === 1 && station.group_wil === 0
            )

            return enabledStations.map(station => ({
                id: station.sta_id,
                name: station.sta_name,
                lat: stationCoordinates[station.sta_id]?.lat || -6.2088,
                lon: stationCoordinates[station.sta_id]?.lon || 106.8456,
                groupWil: station.group_wil,
                fgEnable: station.fg_enable
            }))
        } catch (error) {
            console.error('Error fetching stations:', error)
            // Return fallback stations
            return [
                { id: 'JAKK', name: 'Jakarta Kota', lat: -6.1376, lon: 106.8146, groupWil: 0, fgEnable: 1 },
                { id: 'MRI', name: 'Manggarai', lat: -6.2099, lon: 106.8503, groupWil: 0, fgEnable: 1 },
                { id: 'BKS', name: 'Bekasi', lat: -6.2383, lon: 106.9756, groupWil: 0, fgEnable: 1 }
            ]
        }
    },

    getSchedule: async (stationId: string): Promise<StationSchedule> => {
        try {
            // Get current time range
            const { from, to } = getTimeRange()

            // Use the correct endpoint with query parameters
            const response = await api.get<APIResponse<KRLSchedule[]>>('/schedules', {
                params: {
                    stationid: stationId,
                    timefrom: from,
                    timeto: to
                }
            })

            const scheduleData = response.data.data

            // Map and sort schedules
            const schedules: Schedule[] = scheduleData
                .map(item => {
                    const timeString = formatTime(item.time_est)
                    const [hours, minutes] = timeString.split(':').map(Number)
                    const timeInMinutes = hours * 60 + minutes

                    return {
                        trainId: item.train_id,
                        trainName: item.ka_name,
                        destination: item.dest,
                        time: timeString,
                        status: getStatus(item.time_est),
                        platform: '1', // API doesn't provide platform
                        color: item.color,
                        route: item.route_name,
                        destTime: formatTime(item.dest_time),
                        timeInMinutes: timeInMinutes
                    }
                })
                // Sort by time
                .sort((a: any, b: any) => a.timeInMinutes - b.timeInMinutes)
                // Remove duplicates
                .filter((schedule, index, self) =>
                    index === self.findIndex(s =>
                        s.trainId === schedule.trainId && s.time === schedule.time
                    )
                )
                // Remove helper property
                .map(({ trainId, trainName, destination, time, status, platform, color, route, destTime }) => ({
                    trainId,
                    trainName,
                    destination,
                    time,
                    status,
                    platform,
                    color,
                    route,
                    destTime
                }))

            return {
                stationId,
                timestamp: new Date().toISOString(),
                schedules
            }
        } catch (error) {
            console.error('Error fetching schedule:', error)
            return {
                stationId,
                timestamp: new Date().toISOString(),
                schedules: []
            }
        }
    },

    // Get train route details
    getTrainRoute: async (trainId: string): Promise<TrainRoute[]> => {
        try {
            const response = await api.get<APIResponse<KRLTrainRouteItem[]>>('/schedules-train', {
                params: {
                    trainid: trainId
                }
            })

            return response.data.data.map(item => ({
                trainId: item.train_id,
                kaName: item.ka_name,
                stationId: item.station_id,
                stationName: item.station_name,
                timeEst: formatTime(item.time_est),
                transitStation: item.transit_station,
                color: item.color,
                transit: item.transit
            }))
        } catch (error) {
            console.error('Error fetching train route:', error)
            return []
        }
    },

    // Get fare between stations
    getFare: async (stationFrom: string, stationTo: string): Promise<FareDetail | null> => {
        try {
            const response = await api.get<APIResponse<KRLFareItem[]>>('/fare', {
                params: {
                    stationfrom: stationFrom,
                    stationto: stationTo
                }
            })

            const fareData = response.data.data[0]
            if (!fareData) return null

            return {
                staCodeFrom: fareData.sta_code_from,
                staNameFrom: fareData.sta_name_from,
                staCodeTo: fareData.sta_code_to,
                staNameTo: fareData.sta_name_to,
                fare: fareData.fare,
                distance: fareData.distance
            }
        } catch (error) {
            console.error('Error fetching fare:', error)
            return null
        }
    },

    // Get route map with all lines and stations
    getRouteMap: async (): Promise<KRLRouteMap[]> => {
        try {
            const response = await api.get<APIResponse<KRLRouteMap[]>>('/routemap')
            return response.data.data
        } catch (error) {
            console.error('Error fetching route map:', error)
            return []
        }
    }
}
