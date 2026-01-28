import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useStations } from '../../hooks/useData'

export default function CommuterMap() {
    const mapContainer = useRef<HTMLDivElement>(null)
    const map = useRef<maplibregl.Map | null>(null)
    const [loaded, setLoaded] = useState(false)
    const { data: stations } = useStations()

    // Update map source when stations load
    useEffect(() => {
        if (!map.current || !loaded || !stations) return

        const source = map.current.getSource('stations') as maplibregl.GeoJSONSource
        if (source) {
            source.setData({
                type: 'FeatureCollection',
                features: stations.map(s => ({
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [s.lon, s.lat]
                    },
                    properties: {
                        name: s.name,
                        id: s.id
                    }
                }))
            })
        }

        // Connect stations to form a "Railway Line"
        // In a real app, this would be a high-res LineString from API/GeoJSON
        if (stations.length > 1) {
            const lineSource = map.current.getSource('railways') as maplibregl.GeoJSONSource
            if (lineSource) {
                lineSource.setData({
                    type: 'FeatureCollection',
                    features: [{
                        type: 'Feature',
                        properties: {},
                        geometry: {
                            type: 'LineString',
                            coordinates: stations.map(s => [s.lon, s.lat])
                        }
                    }]
                })
            }
        }
    }, [stations, loaded])

    // Mock Train Animation
    useEffect(() => {
        if (!map.current || !loaded || !stations || stations.length < 2) return

        let animationFrameId: number
        let progress = 0
        const speed = 0.005 // Speed factor
        let direction = 1

        // Simple interpolation between first and last station for demo
        // Real app would project onto the LineString path
        const animate = () => {
            progress += speed * direction
            if (progress >= stations.length - 1 || progress <= 0) {
                direction *= -1
            }

            // Find current segment
            const segmentIndex = Math.floor(progress)
            const segmentProgress = progress - segmentIndex

            const start = stations[segmentIndex]
            const end = stations[segmentIndex + 1]

            if (start && end) {
                const lng = start.lon + (end.lon - start.lon) * segmentProgress
                const lat = start.lat + (end.lat - start.lat) * segmentProgress

                const trainSource = map.current?.getSource('trains') as maplibregl.GeoJSONSource
                if (trainSource) {
                    trainSource.setData({
                        type: 'FeatureCollection',
                        features: [{
                            type: 'Feature',
                            properties: {},
                            geometry: {
                                type: 'Point',
                                coordinates: [lng, lat]
                            }
                        }]
                    })
                }
            }

            animationFrameId = requestAnimationFrame(animate)
        }

        animate()

        return () => cancelAnimationFrame(animationFrameId)
    }, [stations, loaded])

    useEffect(() => {
        if (map.current || !mapContainer.current) return

        // Jakarta Coordinates
        const JAKARTA = [106.8456, -6.2088] as [number, number]

        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: 'https://demotiles.maplibre.org/style.json',
            center: JAKARTA,
            zoom: 11,
            pitch: 45,
            bearing: 0,
        })

        map.current.addControl(new maplibregl.AttributionControl({ compact: true }), 'top-right')
        map.current.addControl(new maplibregl.NavigationControl(), 'top-right')

        map.current.on('load', () => {
            setLoaded(true)
            if (!map.current) return;

            // Add Source for Stations
            map.current.addSource('stations', {
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: []
                }
            })

            // Add Circle Layer for Stations
            map.current.addLayer({
                id: 'stations-circle',
                type: 'circle',
                source: 'stations',
                paint: {
                    'circle-radius': 6,
                    'circle-color': '#007AFF',
                    'circle-stroke-width': 2,
                    'circle-stroke-color': '#FFFFFF'
                }
            })

            // Add Source for Mock Train
            map.current.addSource('trains', {
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: []
                }
            })

            // Add Train Layer
            map.current.addLayer({
                id: 'trains-circle',
                type: 'circle',
                source: 'trains',
                paint: {
                    'circle-radius': 8,
                    'circle-color': '#FF3B30', // Red for trains
                    'circle-stroke-width': 2,
                    'circle-stroke-color': '#FFFFFF'
                }
            })

            // Add Text Layer for Station Names
            map.current.addLayer({
                id: 'stations-label',
                type: 'symbol',
                source: 'stations',
                layout: {
                    'text-field': ['get', 'name'],
                    'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
                    'text-offset': [0, 1.25],
                    'text-anchor': 'top',
                    'text-size': 12
                },
                paint: {
                    'text-color': '#333333',
                    'text-halo-color': '#ffffff',
                    'text-halo-width': 2
                }
            })
        })

        return () => {
            map.current?.remove()
            map.current = null
        }
    }, [])

    return (
        <div className="map-container" style={{ width: '100%', height: '100%', position: 'relative' }}>
            <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />

            {!loaded && (
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, width: '100%', height: '100%',
                    background: 'var(--bg-body)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 10
                }}>
                    <span className="text-secondary font-bold">Initializing Map Engine...</span>
                </div>
            )}
        </div>
    )
}
