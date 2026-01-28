import { useQuery } from '@tanstack/react-query'
import { client } from '../api/client'

interface FarePreviewProps {
    fromStation: string
    toStation: string
}

export default function FarePreview({ fromStation, toStation }: FarePreviewProps) {
    const { data: fareDetail } = useQuery({
        queryKey: ['fare', fromStation, toStation],
        queryFn: () => client.getFare(fromStation, toStation),
        enabled: !!fromStation && !!toStation && fromStation !== toStation
    })

    if (!fareDetail) return null

    return (
        <div style={{
            padding: '8px 16px 12px',
            fontSize: '13px',
            color: '#666',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        }}>
            <span>{fareDetail.distance} km</span>
            <span style={{
                fontWeight: 700,
                color: '#16812B',
                fontSize: '14px'
            }}>
                Rp {fareDetail.fare.toLocaleString('id-ID')}
            </span>
        </div>
    )
}
