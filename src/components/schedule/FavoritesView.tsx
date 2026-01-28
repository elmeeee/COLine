import { useState, useEffect } from 'react'
import { useStations } from '../../hooks/useData'
import { Trash2, MapPin, Star } from 'lucide-react'

export default function FavoritesView() {
    const { data: stations } = useStations()
    const [favorites, setFavorites] = useState<string[]>([])

    // Load favorites from local storage
    useEffect(() => {
        const stored = localStorage.getItem('coline_favorites')
        if (stored) {
            setFavorites(JSON.parse(stored))
        }
    }, [])

    const toggleFavorite = (id: string) => {
        const newFavs = favorites.filter(fav => fav !== id)
        setFavorites(newFavs)
        localStorage.setItem('coline_favorites', JSON.stringify(newFavs))
    }

    const favStations = stations?.filter(s => favorites.includes(s.id)) || []

    return (
        <div className="p-4 pb-24" style={{ background: 'var(--bg-body)', minHeight: '100%' }}>
            <div style={{ marginBottom: '24px' }}>
                <h1 className="gradient-text" style={{ fontSize: '36px', fontWeight: 800, marginBottom: '8px', margin: 0 }}>
                    Favorites
                </h1>
                <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '15px' }}>
                    Quick access to your favorite stations
                </p>
            </div>

            {favorites.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        margin: '0 auto 20px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Star size={40} color="white" />
                    </div>
                    <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
                        No favorites yet
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
                        Add stations from the Schedule tab to see them here
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {favStations.map((s, idx) => (
                        <div
                            key={s.id}
                            className="card"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                animationDelay: `${idx * 0.1}s`,
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            {/* Gradient accent */}
                            <div style={{
                                position: 'absolute',
                                left: 0,
                                top: 0,
                                bottom: 0,
                                width: '4px',
                                background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)'
                            }} />

                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingLeft: '12px' }}>
                                <div style={{
                                    width: '56px',
                                    height: '56px',
                                    borderRadius: '16px',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontSize: '24px',
                                    fontWeight: 700,
                                    flexShrink: 0,
                                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
                                }}>
                                    {s.name.charAt(0)}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '18px', marginBottom: '4px', color: 'var(--text-primary)' }}>
                                        {s.name}
                                    </div>
                                    <div style={{
                                        fontSize: '13px',
                                        color: 'var(--text-secondary)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        fontWeight: 500
                                    }}>
                                        <MapPin size={12} />
                                        <span>ID: {s.id}</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => toggleFavorite(s.id)}
                                style={{
                                    padding: '12px',
                                    borderRadius: '12px',
                                    background: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)',
                                    color: '#991B1B',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'scale(1.1)'
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)'
                                }}
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
