import { useState, useEffect } from 'react'
import { useStations, useSchedule } from '../../hooks/useData'
import { useQuery } from '@tanstack/react-query'
import { client } from '../../api/client'
import { ChevronDown, ChevronUp, Navigation, Train } from 'lucide-react'
import { getCurrentLocation, calculateDistance } from '../../lib/geo'
import type { Station, Schedule } from '../../api/types'
import TrainRouteView from './TrainRouteView'

// Component to show transit stations for a train
function TransitStationsBadge({ trainId }: { trainId: string }) {
    const { data: route } = useQuery({
        queryKey: ['train-route-transit', trainId],
        queryFn: () => client.getTrainRoute(trainId),
        staleTime: 300000, // Cache for 5 minutes
    })

    const transitStations = route?.filter(stop =>
        stop.transitStation && Array.isArray(stop.transit) && stop.transit.length > 0
    ) || []

    if (transitStations.length === 0) return null

    return (
        <div style={{
            marginTop: '8px',
            padding: '8px 12px',
            background: '#F9F9F9',
            borderRadius: '8px',
            border: '1px solid #E5E5E5'
        }}>
            <div style={{
                fontSize: '11px',
                color: '#666',
                marginBottom: '6px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
            }}>
                Transit Stations ({transitStations.length})
            </div>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
            }}>
                {transitStations.map((station, idx) => (
                    <div key={idx} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <div style={{
                            fontSize: '12px',
                            color: '#1A1A1A',
                            fontWeight: 500,
                            flex: 1
                        }}>
                            {station.stationName}
                        </div>
                        <div style={{
                            display: 'flex',
                            gap: '3px'
                        }}>
                            {(station.transit as string[]).map((color, colorIdx) => (
                                <div
                                    key={colorIdx}
                                    style={{
                                        width: '18px',
                                        height: '18px',
                                        borderRadius: '4px',
                                        background: color,
                                        border: '1.5px solid white',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.15)'
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// Component to show all lines a train passes through
function TrainLinesBadge({ trainId, primaryColor, trainName }: { trainId: string, primaryColor: string, trainName: string }) {
    const { data: route } = useQuery({
        queryKey: ['train-route-lines', trainId],
        queryFn: () => client.getTrainRoute(trainId),
        staleTime: 300000, // Cache for 5 minutes
    })

    // Get all unique colors from the route
    const uniqueColors = route
        ? Array.from(new Set(route.map(stop => stop.color).filter(Boolean)))
        : [primaryColor]

    // If only one color, show simple badge
    if (uniqueColors.length <= 1) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '12px'
            }}>
                <div style={{
                    width: '6px',
                    height: '32px',
                    borderRadius: '3px',
                    background: primaryColor
                }} />
                <div>
                    <div style={{
                        color: primaryColor,
                        fontSize: '11px',
                        fontWeight: 600,
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase',
                        marginBottom: '2px'
                    }}>
                        {trainName}
                    </div>
                </div>
            </div>
        )
    }

    // Multiple lines - show all colors
    return (
        <div style={{
            marginBottom: '12px'
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px'
            }}>
                <div style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#666',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                }}>
                    {trainName}
                </div>
            </div>
            <div style={{
                display: 'flex',
                gap: '6px',
                alignItems: 'center'
            }}>
                <div style={{
                    fontSize: '11px',
                    color: '#999',
                    fontWeight: 600,
                    marginRight: '4px'
                }}>
                    Lines:
                </div>
                {uniqueColors.map((color, idx) => (
                    <div
                        key={idx}
                        style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '6px',
                            background: color,
                            border: '2px solid white',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
                        }}
                    />
                ))}
            </div>
        </div>
    )
}

export default function ScheduleView() {
    const { data: stations, isLoading: stationsLoading } = useStations()
    const [selectedStation, setSelectedStation] = useState<string | null>(null)
    const [expandedTrain, setExpandedTrain] = useState<string | null>(null)
    const [nearbyStations, setNearbyStations] = useState<(Station & { distance: number })[]>([])
    const [selectedTrainRoute, setSelectedTrainRoute] = useState<Schedule | null>(null)

    const { data: scheduleData, isLoading: scheduleLoading, error: scheduleError, refetch: refetchSchedule } = useSchedule(selectedStation)

    // Get user location on mount and find nearby stations
    useEffect(() => {
        getCurrentLocation().then(location => {
            if (location) {

                // Calculate distances and sort by nearest
                if (stations) {
                    const stationsWithDistance = stations.map(station => ({
                        ...station,
                        distance: calculateDistance(
                            location.lat,
                            location.lon,
                            station.lat,
                            station.lon
                        )
                    })).sort((a, b) => a.distance - b.distance)

                    setNearbyStations(stationsWithDistance)

                    // Auto-select nearest station if none selected
                    if (!selectedStation && stationsWithDistance.length > 0) {
                        setSelectedStation(stationsWithDistance[0].id)
                    }
                }
            }
        })
    }, [stations, selectedStation])


    // Calculate relative time
    const getRelativeTime = (time: string) => {
        const now = new Date()
        const [hours, minutes] = time.split(':').map(Number)
        const scheduleTime = new Date()
        scheduleTime.setHours(hours, minutes, 0, 0)

        const diffMs = scheduleTime.getTime() - now.getTime()
        const diffMins = Math.floor(diffMs / (1000 * 60))
        const diffHours = Math.floor(diffMins / 60)

        if (diffMins < 0) return 'Departed'
        if (diffMins < 60) return `${diffMins} minutes`
        return `about ${diffHours} hours`
    }

    if (selectedStation) {
        const currentStation = stations?.find(s => s.id === selectedStation)

        return (
            <div style={{
                background: '#FAFAFA',
                minHeight: '100vh',
                paddingBottom: '80px'
            }}>
                {/* Simple Header */}
                <div style={{
                    background: 'white',
                    borderBottom: '1px solid #E0E0E0',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10
                }}>
                    <div style={{
                        padding: '16px 20px',
                        paddingTop: 'calc(16px + var(--safe-top))'
                    }}>
                        <button
                            onClick={() => setSelectedStation(null)}
                            style={{
                                color: '#666',
                                fontSize: '14px',
                                marginBottom: '8px',
                                fontWeight: 500
                            }}
                        >
                            ← Back
                        </button>
                        <h2 style={{
                            fontSize: '24px',
                            fontWeight: 700,
                            margin: 0,
                            color: '#1A1A1A'
                        }}>
                            {currentStation?.name}
                        </h2>
                    </div>
                </div>

                {/* Schedule List */}
                <div style={{ padding: '0' }}>
                    {scheduleLoading && (
                        <div style={{
                            padding: '60px 20px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'white'
                        }}>
                            <style>{`
                                @keyframes trainMove {
                                    0% { transform: translateX(-100px); }
                                    100% { transform: translateX(100px); }
                                }
                                @keyframes trackScroll {
                                    0% { background-position: 0 0; }
                                    100% { background-position: 20px 0; }
                                }
                            `}</style>

                            {/* Train Track */}
                            <div style={{
                                width: '200px',
                                height: '4px',
                                background: 'repeating-linear-gradient(90deg, #E5E5E5 0px, #E5E5E5 10px, transparent 10px, transparent 20px)',
                                borderRadius: '2px',
                                marginBottom: '20px',
                                animation: 'trackScroll 0.5s linear infinite',
                                position: 'relative'
                            }}>
                                {/* Moving Train Icon */}
                                <div style={{
                                    position: 'absolute',
                                    top: '-18px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    animation: 'trainMove 2s ease-in-out infinite alternate',
                                    fontSize: '32px'
                                }}>
                                    🚆
                                </div>
                            </div>

                            <div style={{
                                fontSize: '16px',
                                fontWeight: 600,
                                color: '#1A1A1A',
                                marginTop: '20px',
                                marginBottom: '8px'
                            }}>
                                Loading schedules...
                            </div>
                            <div style={{
                                fontSize: '14px',
                                color: '#999'
                            }}>
                                Please wait a moment
                            </div>
                        </div>
                    )}

                    {/* Error State */}
                    {scheduleError && !scheduleLoading && (
                        <div style={{
                            background: 'white',
                            padding: '60px 20px',
                            textAlign: 'center'
                        }}>
                            <div style={{
                                fontSize: '48px',
                                marginBottom: '16px'
                            }}>
                                ⚠️
                            </div>
                            <div style={{
                                fontSize: '18px',
                                fontWeight: 700,
                                color: '#1A1A1A',
                                marginBottom: '8px'
                            }}>
                                Gagal memuat jadwal
                            </div>
                            <div style={{
                                color: '#999',
                                fontSize: '14px',
                                marginBottom: '20px'
                            }}>
                                API KRL sedang lambat atau timeout. Silakan coba lagi.
                            </div>
                            <button
                                onClick={() => refetchSchedule()}
                                style={{
                                    padding: '12px 24px',
                                    background: '#16812B',
                                    color: 'white',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                            >
                                Coba Lagi
                            </button>
                        </div>
                    )}

                    {scheduleData?.schedules.map((schedule) => {
                        const isExpanded = expandedTrain === schedule.trainId
                        const relativeTime = getRelativeTime(schedule.time)

                        return (
                            <div key={`${schedule.trainId}-${schedule.time}`}>
                                {/* Main Card */}
                                <div
                                    onClick={() => setExpandedTrain(isExpanded ? null : schedule.trainId)}
                                    style={{
                                        background: 'white',
                                        borderBottom: '1px solid #E0E0E0',
                                        padding: '20px',
                                        cursor: 'pointer',
                                        borderLeft: `4px solid ${schedule.color || '#16812B'}`,
                                        transition: 'background 0.2s',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#F5F5F5'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                                >
                                    {/* Train Line Badge - Shows all lines */}
                                    <TrainLinesBadge
                                        trainId={schedule.trainId}
                                        primaryColor={schedule.color || '#16812B'}
                                        trainName={schedule.trainName || schedule.route}
                                    />

                                    {/* Route Name */}
                                    <div style={{
                                        color: '#999',
                                        fontSize: '12px',
                                        fontWeight: 500,
                                        marginBottom: '12px'
                                    }}>
                                        {schedule.route}
                                    </div>

                                    {/* Main Info Row */}
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{
                                                color: '#999',
                                                fontSize: '13px',
                                                marginBottom: '4px'
                                            }}>
                                                Arah menuju
                                            </div>
                                            <div style={{
                                                fontSize: '20px',
                                                fontWeight: 700,
                                                color: '#1A1A1A',
                                                marginBottom: '4px'
                                            }}>
                                                {schedule.destination}
                                            </div>
                                            <div style={{
                                                color: '#999',
                                                fontSize: '13px'
                                            }}>
                                                {schedule.trainId}
                                            </div>
                                        </div>

                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{
                                                color: '#999',
                                                fontSize: '13px',
                                                marginBottom: '4px'
                                            }}>
                                                Berangkat pukul
                                            </div>
                                            <div style={{
                                                fontSize: '28px',
                                                fontWeight: 700,
                                                color: '#1A1A1A',
                                                fontFamily: 'monospace'
                                            }}>
                                                {schedule.time}
                                            </div>
                                            <div style={{
                                                color: '#999',
                                                fontSize: '13px'
                                            }}>
                                                {relativeTime}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{
                                        marginTop: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        gap: '12px'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            color: '#999',
                                            fontSize: '13px'
                                        }}>
                                            {schedule.destTime && (
                                                <>
                                                    <span>Detail rute</span>
                                                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                </>
                                            )}
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setSelectedTrainRoute(schedule)
                                            }}
                                            style={{
                                                padding: '6px 12px',
                                                background: schedule.color || '#16812B',
                                                color: 'white',
                                                borderRadius: '6px',
                                                fontSize: '12px',
                                                fontWeight: 600,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px'
                                            }}
                                        >
                                            <Train size={14} />
                                            Lihat Rute
                                        </button>
                                    </div>

                                    {/* Transit Stations Badge */}
                                    <TransitStationsBadge trainId={schedule.trainId} />
                                </div>

                                {/* Expanded Info */}
                                {isExpanded && schedule.destTime && (
                                    <div style={{
                                        background: '#F9F9F9',
                                        borderBottom: '1px solid #E0E0E0',
                                        borderLeft: `4px solid ${schedule.color || '#16812B'}`,
                                        padding: '16px 20px'
                                    }}>
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: '1fr 1fr',
                                            gap: '16px'
                                        }}>
                                            <div>
                                                <div style={{
                                                    color: '#666',
                                                    fontSize: '12px',
                                                    marginBottom: '4px'
                                                }}>
                                                    Tiba di tujuan
                                                </div>
                                                <div style={{
                                                    fontSize: '20px',
                                                    fontWeight: 700,
                                                    color: '#1A1A1A',
                                                    fontFamily: 'monospace'
                                                }}>
                                                    {schedule.destTime}
                                                </div>
                                            </div>
                                            <div>
                                                <div style={{
                                                    color: '#666',
                                                    fontSize: '12px',
                                                    marginBottom: '4px'
                                                }}>
                                                    Rute
                                                </div>
                                                <div style={{
                                                    fontSize: '14px',
                                                    fontWeight: 600,
                                                    color: '#1A1A1A'
                                                }}>
                                                    {schedule.route}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}

                    {!scheduleLoading && scheduleData?.schedules.length === 0 && (
                        <div style={{
                            background: 'white',
                            padding: '60px 20px',
                            textAlign: 'center'
                        }}>
                            <div style={{
                                fontSize: '18px',
                                fontWeight: 700,
                                color: '#1A1A1A',
                                marginBottom: '8px'
                            }}>
                                No upcoming trains
                            </div>
                            <div style={{
                                color: '#999',
                                fontSize: '14px'
                            }}>
                                There are no scheduled trains for this station at the moment.
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    // Station List View
    return (
        <div style={{
            background: '#FAFAFA',
            minHeight: '100vh',
            paddingBottom: '80px'
        }}>
            {/* Header */}
            <div style={{
                background: 'white',
                padding: '24px 20px',
                paddingTop: 'calc(24px + var(--safe-top))',
                borderBottom: '1px solid #E0E0E0'
            }}>
                <h1 style={{
                    fontSize: '28px',
                    fontWeight: 700,
                    margin: 0,
                    color: '#1A1A1A'
                }}>
                    Stasiun
                </h1>
            </div>

            {/* Station List */}
            <div>
                {stationsLoading && (
                    <div style={{
                        padding: '80px 20px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'white',
                        minHeight: '60vh'
                    }}>
                        <style>{`
                            @keyframes trainMove {
                                0% { transform: translateX(-100px); }
                                100% { transform: translateX(100px); }
                            }
                            @keyframes trackScroll {
                                0% { background-position: 0 0; }
                                100% { background-position: 20px 0; }
                            }
                        `}</style>

                        {/* Train Track */}
                        <div style={{
                            width: '200px',
                            height: '4px',
                            background: 'repeating-linear-gradient(90deg, #E5E5E5 0px, #E5E5E5 10px, transparent 10px, transparent 20px)',
                            borderRadius: '2px',
                            marginBottom: '20px',
                            animation: 'trackScroll 0.5s linear infinite',
                            position: 'relative'
                        }}>
                            {/* Moving Train Icon */}
                            <div style={{
                                position: 'absolute',
                                top: '-18px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                animation: 'trainMove 2s ease-in-out infinite alternate',
                                fontSize: '32px'
                            }}>
                                🚆
                            </div>
                        </div>

                        <div style={{
                            fontSize: '16px',
                            fontWeight: 600,
                            color: '#1A1A1A',
                            marginTop: '20px',
                            marginBottom: '8px'
                        }}>
                            Loading stations...
                        </div>
                        <div style={{
                            fontSize: '14px',
                            color: '#999'
                        }}>
                            Please wait a moment
                        </div>
                    </div>
                )}

                {(nearbyStations.length > 0 ? nearbyStations : stations)?.map((station: Station & { distance?: number }) => (
                    <button
                        key={station.id}
                        onClick={() => setSelectedStation(station.id)}
                        style={{
                            width: '100%',
                            background: 'white',
                            borderBottom: '1px solid #E0E0E0',
                            padding: '20px',
                            textAlign: 'left',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#F5F5F5'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                    >
                        <div style={{ flex: 1 }}>
                            <div style={{
                                color: '#999',
                                fontSize: '13px',
                                marginBottom: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}>
                                Stasiun
                                {station.distance !== undefined && (
                                    <span style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        color: '#16812B',
                                        fontWeight: 600
                                    }}>
                                        <Navigation size={12} />
                                        {station.distance < 1
                                            ? `${Math.round(station.distance * 1000)}m`
                                            : `${station.distance.toFixed(1)}km`
                                        }
                                    </span>
                                )}
                            </div>
                            <div style={{
                                fontSize: '20px',
                                fontWeight: 700,
                                color: '#1A1A1A'
                            }}>
                                {station.name}
                            </div>
                        </div>
                        <ChevronDown
                            size={20}
                            style={{
                                color: '#CCC',
                                transform: 'rotate(-90deg)'
                            }}
                        />
                    </button>
                ))}
            </div>

            {/* Train Route Modal */}
            {selectedTrainRoute && (
                <TrainRouteView
                    trainId={selectedTrainRoute.trainId}
                    trainName={selectedTrainRoute.trainName}
                    color={selectedTrainRoute.color}
                    onClose={() => setSelectedTrainRoute(null)}
                />
            )}
        </div>
    )
}
