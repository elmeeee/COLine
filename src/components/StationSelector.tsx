import { useState, useRef, useEffect } from 'react'
import { ArrowLeftRight, Search, MapPin, X } from 'lucide-react'
import type { Station } from '../api/types'

interface StationSelectorProps {
    stations: Station[]
    fromStation: string
    toStation: string
    onFromChange: (id: string) => void
    onToChange: (id: string) => void
    onSwap: () => void
}

type SearchMode = 'from' | 'to' | null

export default function StationSelector({
    stations,
    fromStation,
    toStation,
    onFromChange,
    onToChange,
    onSwap
}: StationSelectorProps) {
    const [searchMode, setSearchMode] = useState<SearchMode>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const searchInputRef = useRef<HTMLInputElement>(null)

    const fromStationData = stations.find(s => s.id === fromStation)
    const toStationData = stations.find(s => s.id === toStation)

    // Filter stations based on search query
    const filteredStations = stations.filter(station =>
        station.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Focus search input when search mode opens
    useEffect(() => {
        if (searchMode && searchInputRef.current) {
            searchInputRef.current.focus()
        }
    }, [searchMode])

    const handleStationSelect = (stationId: string) => {
        if (searchMode === 'from') {
            onFromChange(stationId)
        } else if (searchMode === 'to') {
            onToChange(stationId)
        }
        setSearchMode(null)
        setSearchQuery('')
    }

    const handleClose = () => {
        setSearchMode(null)
        setSearchQuery('')
    }

    return (
        <>
            {/* Station Selector Bar */}
            <div style={{
                padding: '16px 16px 12px',
                display: 'grid',
                gridTemplateColumns: '1fr auto 1fr',
                gap: '8px',
                alignItems: 'center'
            }}>
                {/* From Station Button */}
                <button
                    onClick={() => setSearchMode('from')}
                    style={{
                        padding: '12px',
                        background: '#F5F5F5',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: fromStation ? '#1A1A1A' : '#999',
                        cursor: 'pointer',
                        width: '100%',
                        textAlign: 'left',
                        transition: 'all 0.2s ease'
                    }}
                >
                    {fromStationData?.name || 'From'}
                </button>

                {/* Swap Button */}
                <button
                    onClick={onSwap}
                    disabled={!fromStation || !toStation}
                    style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: fromStation && toStation ? '#16812B' : '#E5E5E5',
                        color: fromStation && toStation ? 'white' : '#999',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: fromStation && toStation ? 'pointer' : 'not-allowed',
                        transition: 'all 0.2s ease',
                        border: 'none'
                    }}
                >
                    <ArrowLeftRight size={16} />
                </button>

                {/* To Station Button */}
                <button
                    onClick={() => setSearchMode('to')}
                    style={{
                        padding: '12px',
                        background: '#F5F5F5',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: toStation ? '#1A1A1A' : '#999',
                        cursor: 'pointer',
                        width: '100%',
                        textAlign: 'left',
                        transition: 'all 0.2s ease'
                    }}
                >
                    {toStationData?.name || 'To'}
                </button>
            </div>

            {/* Search Modal Overlay */}
            {searchMode && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.4)',
                        zIndex: 100,
                        animation: 'fadeIn 0.2s ease'
                    }}
                    onClick={handleClose}
                >
                    <style>{`
                        @keyframes fadeIn {
                            from { opacity: 0; }
                            to { opacity: 1; }
                        }
                        @keyframes slideUp {
                            from { transform: translateY(100%); }
                            to { transform: translateY(0); }
                        }
                    `}</style>

                    {/* Search Panel */}
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '100%',
                            maxWidth: '420px',
                            maxHeight: '80vh',
                            background: 'white',
                            borderRadius: '20px 20px 0 0',
                            display: 'flex',
                            flexDirection: 'column',
                            animation: 'slideUp 0.3s ease'
                        }}
                    >
                        {/* Search Header */}
                        <div style={{
                            padding: '20px',
                            borderBottom: '1px solid #E5E5E5',
                            flexShrink: 0
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: '16px'
                            }}>
                                <h3 style={{
                                    margin: 0,
                                    fontSize: '18px',
                                    fontWeight: 700,
                                    color: '#1A1A1A'
                                }}>
                                    {searchMode === 'from' ? 'Select departure station' : 'Select destination'}
                                </h3>
                                <button
                                    onClick={handleClose}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '4px',
                                        color: '#666',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Search Input */}
                            <div style={{
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                <Search
                                    size={20}
                                    style={{
                                        position: 'absolute',
                                        left: '12px',
                                        color: '#999'
                                    }}
                                />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="Search station..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '12px 12px 12px 40px',
                                        background: '#F5F5F5',
                                        border: 'none',
                                        borderRadius: '12px',
                                        fontSize: '15px',
                                        outline: 'none',
                                        transition: 'all 0.2s ease'
                                    }}
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        style={{
                                            position: 'absolute',
                                            right: '8px',
                                            background: '#999',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: '20px',
                                            height: '20px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            color: 'white'
                                        }}
                                    >
                                        <X size={12} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Station List */}
                        <div style={{
                            flex: 1,
                            overflowY: 'auto',
                            padding: '8px 0'
                        }}>
                            {filteredStations.length > 0 ? (
                                filteredStations.map((station, index) => (
                                    <button
                                        key={station.id}
                                        onClick={() => handleStationSelect(station.id)}
                                        style={{
                                            width: '100%',
                                            padding: '16px 20px',
                                            background: 'none',
                                            border: 'none',
                                            borderBottom: index < filteredStations.length - 1 ? '1px solid #F5F5F5' : 'none',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            transition: 'background 0.15s ease',
                                            textAlign: 'left'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = '#F9F9F9'
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'none'
                                        }}
                                    >
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            background: '#16812B15',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0
                                        }}>
                                            <MapPin size={20} color="#16812B" />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{
                                                fontSize: '15px',
                                                fontWeight: 600,
                                                color: '#1A1A1A',
                                                marginBottom: '2px'
                                            }}>
                                                {station.name}
                                            </div>
                                            <div style={{
                                                fontSize: '13px',
                                                color: '#999'
                                            }}>
                                                {station.id}
                                            </div>
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <div style={{
                                    padding: '40px 20px',
                                    textAlign: 'center',
                                    color: '#999'
                                }}>
                                    <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
                                    <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>
                                        No stations found
                                    </div>
                                    <div style={{ fontSize: '13px' }}>
                                        Try a different search term
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
