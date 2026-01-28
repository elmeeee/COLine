export interface Station {
    id: string
    name: string
    lat: number
    lon: number
    groupWil?: number
    fgEnable?: number
}

export interface Schedule {
    trainId: string
    trainName: string
    destination: string
    time: string
    status: string
    platform: string
    color: string
    route: string
    destTime: string
}

export interface StationSchedule {
    stationId: string
    timestamp: string
    schedules: Schedule[]
}

export interface FareDetail {
    staCodeFrom: string
    staNameFrom: string
    staCodeTo: string
    staNameTo: string
    fare: number
    distance: string
}

export interface TrainRoute {
    trainId: string
    kaName: string
    stationId: string
    stationName: string
    timeEst: string
    transitStation: boolean
    color: string
    transit: string[] | string
}
