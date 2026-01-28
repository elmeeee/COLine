import { useQuery } from '@tanstack/react-query'
import { client } from '../../api/client'
import { Map as MapIcon, ExternalLink } from 'lucide-react'

export default function RouteMapView() {
    const { data: routeMaps, isLoading } = useQuery({
        queryKey: ['route-maps'],
        queryFn: () => client.getRouteMap()
    })

    const getAreaName = (area: number) => {
        switch (area) {
            case 0: return 'Jabodetabek'
            case 2: return 'Area 2'
            case 6: return 'Yogyakarta'
            case 8: return 'Area 8'
            default: return `Area ${area}`
        }
    }

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
                    color: '#1A1A1A',
                    marginBottom: '8px'
                }}>
                    Peta Rute
                </h1>
                <p style={{
                    color: '#999',
                    fontSize: '14px',
                    margin: 0
                }}>
                    Peta jaringan KRL Commuter Line
                </p>
            </div>

            {/* Maps Grid */}
            <div style={{ padding: '20px' }}>
                {isLoading && (
                    <div>
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} style={{
                                background: 'white',
                                height: '200px',
                                marginBottom: '16px',
                                borderRadius: '16px',
                                animation: 'pulse 1.5s ease-in-out infinite'
                            }} />
                        ))}
                    </div>
                )}

                {routeMaps && routeMaps.length > 0 && (
                    <div style={{
                        display: 'grid',
                        gap: '16px'
                    }}>
                        {routeMaps.map((map) => (
                            <div
                                key={map.area}
                                style={{
                                    background: 'white',
                                    borderRadius: '16px',
                                    overflow: 'hidden',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                                }}
                            >
                                {/* Header */}
                                <div style={{
                                    padding: '16px 20px',
                                    borderBottom: '1px solid #E0E0E0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px'
                                    }}>
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '10px',
                                            background: '#16812B',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white'
                                        }}>
                                            <MapIcon size={20} />
                                        </div>
                                        <div>
                                            <div style={{
                                                fontSize: '16px',
                                                fontWeight: 700,
                                                color: '#1A1A1A'
                                            }}>
                                                {getAreaName(map.area)}
                                            </div>
                                            <div style={{
                                                fontSize: '13px',
                                                color: '#999'
                                            }}>
                                                Peta Rute KRL
                                            </div>
                                        </div>
                                    </div>
                                    <a
                                        href={map.permalink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            padding: '8px 12px',
                                            background: '#F9F9F9',
                                            borderRadius: '8px',
                                            color: '#16812B',
                                            fontSize: '13px',
                                            fontWeight: 600,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            textDecoration: 'none'
                                        }}
                                    >
                                        Buka
                                        <ExternalLink size={14} />
                                    </a>
                                </div>

                                {/* Map Image */}
                                <div style={{
                                    position: 'relative',
                                    width: '100%',
                                    paddingBottom: '75%', // 4:3 aspect ratio
                                    background: '#F5F5F5'
                                }}>
                                    <img
                                        src={map.permalink}
                                        alt={`Peta ${getAreaName(map.area)}`}
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'contain'
                                        }}
                                        loading="lazy"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!isLoading && (!routeMaps || routeMaps.length === 0) && (
                    <div style={{
                        background: 'white',
                        padding: '60px 20px',
                        textAlign: 'center',
                        borderRadius: '16px'
                    }}>
                        <MapIcon size={48} style={{ color: '#CCC', margin: '0 auto 16px' }} />
                        <div style={{
                            fontSize: '18px',
                            fontWeight: 700,
                            color: '#1A1A1A',
                            marginBottom: '8px'
                        }}>
                            Peta tidak tersedia
                        </div>
                        <div style={{
                            color: '#999',
                            fontSize: '14px'
                        }}>
                            Data peta rute tidak ditemukan.
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
