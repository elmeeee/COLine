import { useState } from 'react'
import { useStations } from '../../hooks/useData'
import { useQuery } from '@tanstack/react-query'
import { client } from '../../api/client'
import { ArrowRight, Wallet, MapPin } from 'lucide-react'

export default function FareCalculator() {
    const { data: stations } = useStations()
    const [fromStation, setFromStation] = useState<string>('')
    const [toStation, setToStation] = useState<string>('')

    const { data: fareDetail, isLoading } = useQuery({
        queryKey: ['fare', fromStation, toStation],
        queryFn: () => client.getFare(fromStation, toStation),
        enabled: !!fromStation && !!toStation && fromStation !== toStation
    })

    return (
        <div style={{
            background: '#F5F5F5',
            minHeight: '100vh',
            paddingBottom: '80px'
        }}>
            {/* Header */}
            <div style={{
                background: 'white',
                padding: '24px 20px',
                paddingTop: 'calc(24px + var(--safe-top))',
                borderBottom: '1px solid #E5E5E5'
            }}>
                <h1 style={{
                    fontSize: '28px',
                    fontWeight: 700,
                    margin: 0,
                    color: '#1A1A1A',
                    marginBottom: '8px'
                }}>
                    Hitung Tarif
                </h1>
                <p style={{
                    color: '#666',
                    fontSize: '14px',
                    margin: 0
                }}>
                    Cek tarif perjalanan KRL Anda
                </p>
            </div>

            {/* Form */}
            <div style={{ padding: '20px' }}>
                {/* From Station */}
                <div style={{ marginBottom: '16px' }}>
                    <label style={{
                        display: 'block',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#666',
                        marginBottom: '8px'
                    }}>
                        Stasiun Asal
                    </label>
                    <select
                        value={fromStation}
                        onChange={(e) => setFromStation(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '16px',
                            background: 'white',
                            border: '1px solid #E5E5E5',
                            borderRadius: '12px',
                            fontSize: '16px',
                            fontWeight: 500,
                            color: '#1A1A1A',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <option value="">Pilih stasiun asal</option>
                        {stations?.map(station => (
                            <option key={station.id} value={station.id}>
                                {station.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Arrow */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    margin: '16px 0'
                }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: '#16812B',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                    }}>
                        <ArrowRight size={20} />
                    </div>
                </div>

                {/* To Station */}
                <div style={{ marginBottom: '24px' }}>
                    <label style={{
                        display: 'block',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#666',
                        marginBottom: '8px'
                    }}>
                        Stasiun Tujuan
                    </label>
                    <select
                        value={toStation}
                        onChange={(e) => setToStation(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '16px',
                            background: 'white',
                            border: '1px solid #E5E5E5',
                            borderRadius: '12px',
                            fontSize: '16px',
                            fontWeight: 500,
                            color: '#1A1A1A',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <option value="">Pilih stasiun tujuan</option>
                        {stations?.map(station => (
                            <option key={station.id} value={station.id}>
                                {station.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Result */}
                {fromStation && toStation && fromStation !== toStation && (
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '24px',
                        border: '1px solid #E5E5E5'
                    }}>
                        {isLoading ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '20px',
                                color: '#666'
                            }}>
                                Memuat...
                            </div>
                        ) : fareDetail ? (
                            <>
                                {/* Fare Amount */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    marginBottom: '20px',
                                    paddingBottom: '20px',
                                    borderBottom: '1px solid #F5F5F5'
                                }}>
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '12px',
                                        background: '#16812B',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white'
                                    }}>
                                        <Wallet size={24} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{
                                            fontSize: '13px',
                                            color: '#666',
                                            marginBottom: '4px'
                                        }}>
                                            Total Tarif
                                        </div>
                                        <div style={{
                                            fontSize: '32px',
                                            fontWeight: 700,
                                            color: '#16812B'
                                        }}>
                                            Rp {fareDetail.fare.toLocaleString('id-ID')}
                                        </div>
                                    </div>
                                </div>

                                {/* Route Info */}
                                <div style={{
                                    background: '#F9F9F9',
                                    borderRadius: '12px',
                                    padding: '16px',
                                    marginBottom: '16px'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px'
                                    }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{
                                                fontSize: '12px',
                                                color: '#999',
                                                marginBottom: '4px'
                                            }}>
                                                Dari
                                            </div>
                                            <div style={{
                                                fontSize: '14px',
                                                fontWeight: 600,
                                                color: '#1A1A1A'
                                            }}>
                                                {fareDetail.staNameFrom}
                                            </div>
                                            <div style={{
                                                fontSize: '12px',
                                                color: '#999',
                                                marginTop: '2px'
                                            }}>
                                                {fareDetail.staCodeFrom}
                                            </div>
                                        </div>
                                        <ArrowRight size={20} style={{ color: '#999' }} />
                                        <div style={{ flex: 1, textAlign: 'right' }}>
                                            <div style={{
                                                fontSize: '12px',
                                                color: '#999',
                                                marginBottom: '4px'
                                            }}>
                                                Ke
                                            </div>
                                            <div style={{
                                                fontSize: '14px',
                                                fontWeight: 600,
                                                color: '#1A1A1A'
                                            }}>
                                                {fareDetail.staNameTo}
                                            </div>
                                            <div style={{
                                                fontSize: '12px',
                                                color: '#999',
                                                marginTop: '2px'
                                            }}>
                                                {fareDetail.staCodeTo}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Distance Info */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '12px 16px',
                                    background: '#F9F9F9',
                                    borderRadius: '12px'
                                }}>
                                    <MapPin size={16} style={{ color: '#666' }} />
                                    <div style={{
                                        fontSize: '14px',
                                        color: '#666'
                                    }}>
                                        Jarak: <strong style={{ color: '#1A1A1A' }}>{fareDetail.distance} km</strong>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div style={{
                                textAlign: 'center',
                                padding: '20px',
                                color: '#999'
                            }}>
                                Data tarif tidak tersedia
                            </div>
                        )}
                    </div>
                )}

                {/* Info */}
                {(!fromStation || !toStation) && (
                    <div style={{
                        background: 'white',
                        borderRadius: '12px',
                        padding: '24px',
                        textAlign: 'center',
                        border: '1px solid #E5E5E5'
                    }}>
                        <div style={{
                            fontSize: '16px',
                            fontWeight: 600,
                            color: '#1A1A1A',
                            marginBottom: '8px'
                        }}>
                            Pilih stasiun
                        </div>
                        <div style={{
                            fontSize: '14px',
                            color: '#666'
                        }}>
                            Pilih stasiun asal dan tujuan untuk melihat tarif
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
