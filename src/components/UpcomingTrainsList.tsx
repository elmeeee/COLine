import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { client } from '../api/client'
import type { Schedule, Station } from '../api/types'

interface UpcomingTrainsListProps {
    schedules: Schedule[]
    fromStation?: Station
}

export default function UpcomingTrainsList({ schedules }: UpcomingTrainsListProps) {
    const [expandedId, setExpandedId] = useState<string | null>(null)

    if (!schedules || schedules.length === 0) {
        return null
    }

    return (
        <div style={{
            padding: '16px 0'
        }}>
            {/* Section Header */}
            <div style={{
                padding: '0 20px 12px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#666',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
            }}>
                Upcoming Trains
            </div>

            {/* Train List */}
            <div>
                {schedules.map((schedule) => (
                    <TrainRow
                        key={`${schedule.trainId}-${schedule.time}`}
                        schedule={schedule}
                        isExpanded={expandedId === schedule.trainId}
                        onToggle={() => setExpandedId(expandedId === schedule.trainId ? null : schedule.trainId)}
                    />
                ))}
            </div>
        </div>
    )
}

interface TrainRowProps {
    schedule: Schedule
    isExpanded: boolean
    onToggle: () => void
}

function TrainRow({ schedule, isExpanded, onToggle }: TrainRowProps) {
    const { data: route } = useQuery({
        queryKey: ['train-route', schedule.trainId],
        queryFn: () => client.getTrainRoute(schedule.trainId),
        enabled: isExpanded
    })

    // Calculate relative time
    const getRelativeTime = (time: string) => {
        const now = new Date()
        const [hours, minutes] = time.split(':').map(Number)
        const scheduleTime = new Date()
        scheduleTime.setHours(hours, minutes, 0, 0)

        const diffMs = scheduleTime.getTime() - now.getTime()
        const diffMins = Math.floor(diffMs / (1000 * 60))

        if (diffMins < 0) return 'Departed'
        if (diffMins === 0) return 'Now'
        if (diffMins === 1) return '1 min'
        if (diffMins < 60) return `${diffMins} min`
        const hoursPart = Math.floor(diffMins / 60)
        return `${hoursPart}h ${diffMins % 60}m`
    }

    return (
        <div>
            {/* Collapsed Row */}
            <button
                onClick={onToggle}
                style={{
                    width: '100%',
                    padding: '16px 20px',
                    background: 'white',
                    borderBottom: '1px solid #E5E5E5',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'background 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#F9F9F9'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
            >
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    {/* Left: Time & Destination */}
                    <div style={{ flex: 1 }}>
                        <div style={{
                            fontSize: '20px',
                            fontWeight: 700,
                            color: '#1A1A1A',
                            marginBottom: '4px',
                            fontFamily: 'monospace'
                        }}>
                            {schedule.time}
                        </div>
                        <div style={{
                            fontSize: '14px',
                            color: '#666',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}>
                            <span>→</span>
                            <span>{schedule.destination}</span>
                        </div>
                    </div>

                    {/* Right: Status & Expand */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{
                                fontSize: '13px',
                                fontWeight: 600,
                                color: '#16812B',
                                marginBottom: '2px'
                            }}>
                                {getRelativeTime(schedule.time)}
                            </div>
                            <div style={{
                                fontSize: '12px',
                                color: '#999'
                            }}>
                                {schedule.trainId}
                            </div>
                        </div>
                        {isExpanded ? <ChevronUp size={20} color="#999" /> : <ChevronDown size={20} color="#999" />}
                    </div>
                </div>
            </button>

            {/* Expanded Content */}
            {isExpanded && (
                <div style={{
                    background: '#F9F9F9',
                    borderBottom: '1px solid #E5E5E5',
                    padding: '16px 20px'
                }}>
                    {/* Train Details */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '16px',
                        marginBottom: '16px'
                    }}>
                        <div>
                            <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Route</div>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A1A' }}>
                                {schedule.route}
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Arrives at</div>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A1A' }}>
                                {schedule.destTime}
                            </div>
                        </div>
                    </div>

                    {/* Stops Preview */}
                    {route && route.length > 0 && (
                        <div>
                            <div style={{
                                fontSize: '12px',
                                color: '#999',
                                marginBottom: '8px',
                                fontWeight: 600
                            }}>
                                Stops ({route.length})
                            </div>
                            <div style={{
                                display: 'flex',
                                gap: '8px',
                                overflowX: 'auto',
                                paddingBottom: '8px'
                            }}>
                                {route.slice(0, 8).map((stop, idx) => (
                                    <div
                                        key={`${stop.stationId}-${idx}`}
                                        style={{
                                            padding: '6px 10px',
                                            background: 'white',
                                            borderRadius: '6px',
                                            fontSize: '12px',
                                            fontWeight: 500,
                                            color: '#1A1A1A',
                                            whiteSpace: 'nowrap',
                                            border: stop.transitStation ? `2px solid ${schedule.color || '#16812B'}` : '1px solid #E5E5E5'
                                        }}
                                    >
                                        {stop.stationName}
                                    </div>
                                ))}
                                {route.length > 8 && (
                                    <div style={{
                                        padding: '6px 10px',
                                        fontSize: '12px',
                                        color: '#999'
                                    }}>
                                        +{route.length - 8} more
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
