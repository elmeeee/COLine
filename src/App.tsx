import { useState, useEffect } from 'react'
import { useStations, useSchedule } from './hooks/useData'
import StationSelector from './components/StationSelector.tsx'
import NextTrainHero from './components/NextTrainHero.tsx'
import UpcomingTrainsList from './components/UpcomingTrainsList.tsx'
import FarePreview from './components/FarePreview.tsx'
import { getCurrentLocation, calculateDistance } from './lib/geo'

export default function App() {
    const { data: stations } = useStations()
    const [fromStation, setFromStation] = useState<string>('')
    const [toStation, setToStation] = useState<string>('')
    const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null)

    const { data: scheduleData } = useSchedule(fromStation)

    // Get user location and auto-select nearest station
    useEffect(() => {
        getCurrentLocation().then(location => {
            if (location && stations) {
                setUserLocation(location)

                // Find nearest station
                const stationsWithDistance = stations.map(station => ({
                    ...station,
                    distance: calculateDistance(
                        location.lat,
                        location.lon,
                        station.lat,
                        station.lon
                    )
                })).sort((a, b) => a.distance - b.distance)

                // Auto-select if within 2km
                if (stationsWithDistance[0] && stationsWithDistance[0].distance < 2 && !fromStation) {
                    setFromStation(stationsWithDistance[0].id)
                }
            }
        })
    }, [stations, fromStation])

    const swapStations = () => {
        const temp = fromStation
        setFromStation(toStation)
        setToStation(temp)
    }

    const currentFromStation = stations?.find(s => s.id === fromStation)
    const currentToStation = stations?.find(s => s.id === toStation)

    return (
        <div style={{
            minHeight: '100vh',
            background: '#FAFAFA',
            display: 'flex',
            justifyContent: 'center'
        }}>
            {/* Max width container - mobile first */}
            <div style={{
                width: '100%',
                maxWidth: '420px',
                background: 'white',
                minHeight: '100vh',
                position: 'relative'
            }}>
                {/* Sticky Header */}
                <div style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 50,
                    background: 'white',
                    borderBottom: '1px solid #E5E5E5',
                    paddingTop: 'var(--safe-top)'
                }}>
                    <StationSelector
                        stations={stations || []}
                        fromStation={fromStation}
                        toStation={toStation}
                        onFromChange={setFromStation}
                        onToChange={setToStation}
                        onSwap={swapStations}
                    />

                    {fromStation && toStation && fromStation !== toStation && (
                        <FarePreview
                            fromStation={fromStation}
                            toStation={toStation}
                        />
                    )}
                </div>

                {/* Main Content */}
                <div style={{ paddingBottom: '40px' }}>
                    {fromStation ? (
                        <>
                            {/* Hero Section - Next Train */}
                            <NextTrainHero
                                schedule={scheduleData?.schedules[0]}
                                fromStation={currentFromStation}
                                toStation={currentToStation}
                                userLocation={userLocation}
                            />

                            {/* Upcoming Trains List */}
                            <UpcomingTrainsList
                                schedules={scheduleData?.schedules.slice(1, 6) || []}
                                fromStation={currentFromStation}
                            />
                        </>
                    ) : (
                        // Empty State
                        <div style={{
                            padding: '60px 20px',
                            textAlign: 'center'
                        }}>
                            <div style={{
                                fontSize: '48px',
                                marginBottom: '16px'
                            }}>🚆</div>
                            <div style={{
                                fontSize: '18px',
                                fontWeight: 600,
                                color: '#1A1A1A',
                                marginBottom: '8px'
                            }}>
                                Select your station
                            </div>
                            <div style={{
                                fontSize: '14px',
                                color: '#666'
                            }}>
                                Choose a departure station to see upcoming trains
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
