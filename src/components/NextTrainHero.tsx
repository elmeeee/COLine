import { Clock, TrendingUp } from 'lucide-react'
import type { Schedule, Station } from '../api/types'

interface NextTrainHeroProps {
    schedule?: Schedule
    fromStation?: Station
    toStation?: Station
    userLocation?: { lat: number; lon: number } | null
}

export default function NextTrainHero({ schedule, fromStation, toStation }: NextTrainHeroProps) {
    if (!schedule) {
        return (
            <div style={{
                padding: '40px 20px',
                textAlign: 'center',
                background: '#F9F9F9',
                margin: '16px',
                borderRadius: '12px'
            }}>
                <div style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: '#1A1A1A',
                    marginBottom: '8px'
                }}>
                    No upcoming trains
                </div>
                <div style={{
                    fontSize: '14px',
                    color: '#666'
                }}>
                    Check back later for schedule updates
                </div>
            </div>
        )
    }

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

    const relativeTime = getRelativeTime(schedule.time)
    const isUrgent = relativeTime.includes('min') && parseInt(relativeTime) <= 5

    return (
        <div style={{
            padding: '24px 20px',
            background: isUrgent ? '#FFF9E6' : 'white',
            borderBottom: '1px solid #E5E5E5'
        }}>
            {/* Label */}
            <div style={{
                fontSize: '13px',
                fontWeight: 600,
                color: '#666',
                marginBottom: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
            }}>
                Next Train
            </div>

            {/* Time - XL */}
            <div style={{
                fontSize: '56px',
                fontWeight: 700,
                color: '#1A1A1A',
                lineHeight: 1,
                marginBottom: '8px',
                fontFamily: 'monospace',
                letterSpacing: '-2px'
            }}>
                {schedule.time}
            </div>

            {/* Destination - L */}
            <div style={{
                fontSize: '24px',
                fontWeight: 600,
                color: '#1A1A1A',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
            }}>
                <span>→</span>
                <span>{toStation?.name || schedule.destination}</span>
            </div>

            {/* Status Row */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                flexWrap: 'wrap'
            }}>
                {/* Relative Time */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    background: isUrgent ? '#FF9500' : '#16812B',
                    color: 'white',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: 600
                }}>
                    <Clock size={14} />
                    {relativeTime === 'Now' ? 'Departing now' : `Arriving in ${relativeTime}`}
                </div>

                {/* Status */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '14px',
                    color: '#16812B',
                    fontWeight: 500
                }}>
                    <TrendingUp size={14} />
                    {schedule.status}
                </div>
            </div>

            {/* Train Info - Metadata */}
            <div style={{
                marginTop: '16px',
                paddingTop: '16px',
                borderTop: '1px solid #E5E5E5',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '13px',
                color: '#666'
            }}>
                <div>
                    <div style={{ marginBottom: '4px', color: '#999' }}>Train</div>
                    <div style={{ fontWeight: 600, color: '#1A1A1A' }}>{schedule.trainId}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ marginBottom: '4px', color: '#999' }}>Line</div>
                    <div style={{
                        fontWeight: 600,
                        color: schedule.color || '#16812B',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        justifyContent: 'flex-end'
                    }}>
                        <div style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '3px',
                            background: schedule.color || '#16812B'
                        }} />
                        {schedule.trainName}
                    </div>
                </div>
            </div>
        </div>
    )
}
