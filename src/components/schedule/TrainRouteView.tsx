import { useQuery } from '@tanstack/react-query'
import { client } from '../../api/client'
import { X, Clock } from 'lucide-react'

interface TrainRouteViewProps {
    trainId: string
    trainName?: string
    color?: string
    onClose: () => void
}

export default function TrainRouteView({ trainId, trainName, color = '#16812B', onClose }: TrainRouteViewProps) {
    const { data: route, isLoading } = useQuery({
        queryKey: ['train-route', trainId],
        queryFn: () => client.getTrainRoute(trainId)
    })

    // Get route summary
    const firstStation = route?.[0]
    const lastStation = route?.[route.length - 1]

    // Get fare information
    const { data: fareData } = useQuery({
        queryKey: ['fare', firstStation?.stationId, lastStation?.stationId],
        queryFn: () => firstStation && lastStation
            ? client.getFare(firstStation.stationId, lastStation.stationId)
            : null,
        enabled: !!firstStation && !!lastStation
    })

    const routeName = firstStation && lastStation
        ? `${firstStation.stationName} - ${lastStation.stationName}${trainName ? ` VIA ${trainName}` : ''}`
        : trainName || trainId

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                zIndex: 100,
                display: 'flex',
                alignItems: 'flex-end'
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: 'white',
                    width: '100%',
                    maxHeight: '90vh',
                    borderRadius: '20px 20px 0 0',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    animation: 'slideUp 0.3s ease-out'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{
                    padding: '24px 20px',
                    borderBottom: '1px solid #E5E5E5',
                    background: '#FAFAFA'
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '16px'
                    }}>
                        <div style={{ flex: 1, paddingRight: '12px' }}>
                            <div style={{
                                fontSize: '13px',
                                color: '#999',
                                marginBottom: '6px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                fontWeight: 600
                            }}>
                                Route
                            </div>
                            <div style={{
                                fontSize: '20px',
                                fontWeight: 700,
                                color: '#1A1A1A',
                                lineHeight: '1.3'
                            }}>
                                {routeName}
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                background: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#666',
                                cursor: 'pointer',
                                border: '1px solid #E5E5E5',
                                flexShrink: 0
                            }}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {lastStation && (
                        <div>
                            <div style={{
                                display: 'flex',
                                gap: '24px',
                                alignItems: 'center',
                                marginBottom: '16px'
                            }}>
                                <div>
                                    <div style={{
                                        fontSize: '13px',
                                        color: '#999',
                                        marginBottom: '4px'
                                    }}>
                                        Arrives at
                                    </div>
                                    <div style={{
                                        fontSize: '28px',
                                        fontWeight: 700,
                                        color: '#1A1A1A',
                                        fontFamily: 'monospace'
                                    }}>
                                        {lastStation.timeEst}
                                    </div>
                                </div>
                            </div>

                            {/* Distance and Fare */}
                            {fareData && (
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '12px 16px',
                                    background: 'white',
                                    borderRadius: '12px',
                                    border: '1px solid #E5E5E5'
                                }}>
                                    <div style={{
                                        fontSize: '15px',
                                        color: '#666',
                                        fontWeight: 500
                                    }}>
                                        {fareData.distance}
                                    </div>
                                    <div style={{
                                        fontSize: '20px',
                                        fontWeight: 700,
                                        color: '#16A34A'
                                    }}>
                                        Rp {fareData.fare.toLocaleString('id-ID')}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Stops Section */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    background: 'white'
                }}>
                    {isLoading && (
                        <div style={{
                            textAlign: 'center',
                            padding: '40px 20px',
                            color: '#666'
                        }}>
                            Memuat rute...
                        </div>
                    )}

                    {route && route.length > 0 && (
                        <>
                            {/* Stops Header */}
                            <div style={{
                                padding: '20px 20px 16px',
                                borderBottom: '1px solid #F0F0F0'
                            }}>
                                <div style={{
                                    fontSize: '15px',
                                    color: '#999',
                                    fontWeight: 600
                                }}>
                                    Stops ({route.length})
                                </div>
                            </div>

                            {/* Horizontal Scrollable Stops */}
                            <div style={{
                                padding: '20px',
                                overflowX: 'auto',
                                display: 'flex',
                                gap: '12px',
                                scrollbarWidth: 'none',
                                msOverflowStyle: 'none'
                            }}>
                                <style>{`
                                    @keyframes trainBounce {
                                        0%, 100% { transform: translateY(0px); }
                                        50% { transform: translateY(-3px); }
                                    }
                                `}</style>

                                {route.slice(0, 3).map((stop, index) => {
                                    const isFirst = index === 0
                                    const isLast = index === route.length - 1
                                    const hasTransit = Array.isArray(stop.transit) && stop.transit.length > 0
                                    const stationColor = stop.color || color

                                    return (
                                        <div
                                            key={`${stop.stationId}-${index}`}
                                            style={{
                                                minWidth: '200px',
                                                background: isFirst || isLast ? stationColor : 'white',
                                                border: `2px solid ${stationColor}`,
                                                borderRadius: '16px',
                                                padding: '16px',
                                                position: 'relative',
                                                flexShrink: 0
                                            }}
                                        >
                                            {/* Animated Train Icon */}
                                            <div style={{
                                                position: 'absolute',
                                                top: '12px',
                                                right: '12px',
                                                fontSize: '20px',
                                                animation: 'trainBounce 2s ease-in-out infinite',
                                                opacity: 0.6
                                            }}>
                                                🚆
                                            </div>

                                            {/* Station Name */}
                                            <div style={{
                                                fontSize: '16px',
                                                fontWeight: 700,
                                                color: isFirst || isLast ? 'white' : '#1A1A1A',
                                                marginBottom: '8px',
                                                lineHeight: '1.3',
                                                paddingRight: '30px'
                                            }}>
                                                {stop.stationName}
                                            </div>

                                            {/* Time */}
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                marginBottom: hasTransit ? '12px' : '0'
                                            }}>
                                                <Clock size={14} style={{
                                                    color: isFirst || isLast ? 'rgba(255,255,255,0.8)' : '#999'
                                                }} />
                                                <div style={{
                                                    fontSize: '14px',
                                                    fontWeight: 600,
                                                    color: isFirst || isLast ? 'rgba(255,255,255,0.9)' : '#666',
                                                    fontFamily: 'monospace'
                                                }}>
                                                    {stop.timeEst}
                                                </div>
                                            </div>

                                            {/* Transit Indicator */}
                                            {hasTransit && (
                                                <div style={{
                                                    marginTop: '12px',
                                                    paddingTop: '12px',
                                                    borderTop: `1px solid ${isFirst || isLast ? 'rgba(255,255,255,0.2)' : '#F0F0F0'}`
                                                }}>
                                                    <div style={{
                                                        fontSize: '11px',
                                                        color: isFirst || isLast ? 'rgba(255,255,255,0.7)' : '#999',
                                                        marginBottom: '8px',
                                                        fontWeight: 600,
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.5px'
                                                    }}>
                                                        Available Lines
                                                    </div>
                                                    <div style={{
                                                        display: 'flex',
                                                        gap: '6px',
                                                        flexWrap: 'wrap'
                                                    }}>
                                                        {(stop.transit as string[]).map((transitColor, idx) => (
                                                            <div
                                                                key={idx}
                                                                style={{
                                                                    width: '24px',
                                                                    height: '24px',
                                                                    borderRadius: '6px',
                                                                    background: transitColor,
                                                                    border: '2px solid white',
                                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
                                                                }}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Position Badge */}
                                            {(isFirst || isLast) && (
                                                <div style={{
                                                    position: 'absolute',
                                                    bottom: '12px',
                                                    left: '12px',
                                                    background: 'rgba(255,255,255,0.2)',
                                                    color: 'white',
                                                    fontSize: '10px',
                                                    fontWeight: 700,
                                                    padding: '4px 8px',
                                                    borderRadius: '6px',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px'
                                                }}>
                                                    {isFirst ? 'Start' : 'End'}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}

                                {/* "+X more" Card */}
                                {route.length > 3 && (
                                    <div style={{
                                        minWidth: '140px',
                                        background: '#F9F9F9',
                                        border: '2px dashed #E5E5E5',
                                        borderRadius: '16px',
                                        padding: '16px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                        textAlign: 'center'
                                    }}>
                                        <div style={{
                                            fontSize: '32px',
                                            fontWeight: 700,
                                            color: '#666',
                                            marginBottom: '8px'
                                        }}>
                                            +{route.length - 3}
                                        </div>
                                        <div style={{
                                            fontSize: '13px',
                                            color: '#999',
                                            fontWeight: 600
                                        }}>
                                            more stops
                                        </div>
                                        <div style={{
                                            fontSize: '11px',
                                            color: '#CCC',
                                            marginTop: '8px'
                                        }}>
                                            Scroll down to see all
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Vertical Timeline View */}
                            <div style={{
                                padding: '20px',
                                borderTop: '8px solid #F5F5F5'
                            }}>
                                <div style={{
                                    fontSize: '15px',
                                    color: '#999',
                                    fontWeight: 600,
                                    marginBottom: '20px'
                                }}>
                                    Full Route Timeline
                                </div>
                                <div style={{ position: 'relative' }}>
                                    {route.map((stop, index) => {
                                        const isFirst = index === 0
                                        const isLast = index === route.length - 1
                                        const nextStop = route[index + 1]

                                        // Determine segment color (color changes at transit stations)
                                        const segmentColor = stop.color || color
                                        const nextSegmentColor = nextStop?.color || segmentColor

                                        return (
                                            <div key={`timeline-segment-${index}`}>
                                                <div
                                                    style={{
                                                        position: 'relative',
                                                        paddingLeft: '36px',
                                                        paddingBottom: isLast ? '0' : '16px'
                                                    }}
                                                >
                                                    {/* Station Dot */}
                                                    <div style={{
                                                        position: 'absolute',
                                                        left: '0',
                                                        top: '0',
                                                        width: '18px',
                                                        height: '18px',
                                                        borderRadius: '50%',
                                                        background: isFirst || isLast ? segmentColor : 'white',
                                                        border: `3px solid ${segmentColor}`,
                                                        zIndex: 1
                                                    }} />

                                                    {/* Connecting Line to Next Station */}
                                                    {!isLast && (
                                                        <div style={{
                                                            position: 'absolute',
                                                            left: '7px',
                                                            top: '18px',
                                                            width: '3px',
                                                            height: '100%',
                                                            background: segmentColor !== nextSegmentColor
                                                                ? `linear-gradient(to bottom, ${segmentColor}, ${nextSegmentColor})`
                                                                : segmentColor,
                                                            borderRadius: '2px'
                                                        }} />
                                                    )}

                                                    {/* Station Info */}
                                                    <div style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        padding: '2px 0'
                                                    }}>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{
                                                                fontSize: '14px',
                                                                fontWeight: isFirst || isLast ? 700 : 500,
                                                                color: '#1A1A1A'
                                                            }}>
                                                                {stop.stationName}
                                                            </div>
                                                            {/* Transit Lines Indicator */}
                                                            {stop.transitStation && Array.isArray(stop.transit) && stop.transit.length > 0 && (
                                                                <div style={{
                                                                    display: 'flex',
                                                                    gap: '4px',
                                                                    marginTop: '4px',
                                                                    flexWrap: 'wrap'
                                                                }}>
                                                                    {stop.transit.map((transitColor, idx) => (
                                                                        <div
                                                                            key={idx}
                                                                            style={{
                                                                                width: '16px',
                                                                                height: '16px',
                                                                                borderRadius: '3px',
                                                                                background: transitColor,
                                                                                border: '1.5px solid white',
                                                                                boxShadow: '0 1px 3px rgba(0,0,0,0.15)'
                                                                            }}
                                                                        />
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div style={{
                                                            fontSize: '13px',
                                                            fontWeight: 600,
                                                            color: '#666',
                                                            fontFamily: 'monospace'
                                                        }}>
                                                            {stop.timeEst}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </>
                    )}

                    {!isLoading && (!route || route.length === 0) && (
                        <div style={{
                            textAlign: 'center',
                            padding: '40px 20px',
                            color: '#999'
                        }}>
                            Data rute tidak tersedia
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes slideUp {
                    from {
                        transform: translateY(100%);
                    }
                    to {
                        transform: translateY(0);
                    }
                }
                
                /* Hide scrollbar for horizontal scroll */
                div::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    )
}
