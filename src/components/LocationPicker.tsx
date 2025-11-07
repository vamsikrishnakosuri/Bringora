import { useState, useCallback, useRef, useEffect } from 'react'
import Map, { Marker, MapRef } from 'react-map-gl'
import { MAPBOX_TOKEN } from '@/lib/constants'
import { MapPin, Search, Navigation } from 'lucide-react'
import Input from './ui/Input'
import Button from './ui/Button'

interface LocationPickerProps {
  onLocationSelect: (location: {
    address: string
    latitude: number
    longitude: number
  }) => void
  initialLocation?: {
    address: string
    latitude: number
    longitude: number
  }
}

export default function LocationPicker({ onLocationSelect, initialLocation }: LocationPickerProps) {
  const [viewState, setViewState] = useState({
    longitude: initialLocation?.longitude || -122.4,
    latitude: initialLocation?.latitude || 37.8,
    zoom: 12,
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLocation, setSelectedLocation] = useState<{
    address: string
    latitude: number
    longitude: number
  } | null>(initialLocation || null)
  const mapRef = useRef<MapRef>(null)

  const handleMapClick = useCallback(async (event: any) => {
    const { lng, lat } = event.lngLat
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}`
      )
      const data = await response.json()
      const address = data.features[0]?.place_name || `${lat}, ${lng}`
      
      const location = { address, latitude: lat, longitude: lng }
      setSelectedLocation(location)
      onLocationSelect(location)
    } catch (error) {
      console.error('Error geocoding location:', error)
    }
  }, [onLocationSelect])

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return
    
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?access_token=${MAPBOX_TOKEN}&limit=1`
      )
      const data = await response.json()
      
      if (data.features && data.features.length > 0) {
        const feature = data.features[0]
        const [lng, lat] = feature.center
        const address = feature.place_name
        
        const location = { address, latitude: lat, longitude: lng }
        setSelectedLocation(location)
        onLocationSelect(location)
        
        setViewState({
          longitude: lng,
          latitude: lat,
          zoom: 14,
        })
      }
    } catch (error) {
      console.error('Error searching location:', error)
    }
  }, [searchQuery, onLocationSelect])

  const handleUseCurrentLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          try {
            const response = await fetch(
              `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_TOKEN}`
            )
            const data = await response.json()
            const address = data.features[0]?.place_name || `${latitude}, ${longitude}`
            
            const location = { address, latitude, longitude }
            setSelectedLocation(location)
            onLocationSelect(location)
            
            setViewState({
              longitude,
              latitude,
              zoom: 14,
            })
          } catch (error) {
            console.error('Error geocoding current location:', error)
          }
        },
        (error) => {
          console.error('Error getting current location:', error)
        }
      )
    }
  }, [onLocationSelect])

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted dark:text-gray-400" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search for location..."
            className="pl-10"
          />
        </div>
        <Button type="button" onClick={handleSearch} variant="outline">
          Search
        </Button>
        <Button type="button" onClick={handleUseCurrentLocation} variant="outline">
          <Navigation className="w-4 h-4" />
        </Button>
      </div>

      <div className="relative h-64 rounded-lg overflow-hidden border border-white/20 dark:border-white/10">
        <Map
          {...viewState}
          ref={mapRef}
          onMove={(evt) => setViewState(evt.viewState)}
          onClick={handleMapClick}
          mapboxAccessToken={MAPBOX_TOKEN}
          style={{ width: '100%', height: '100%' }}
          mapStyle="mapbox://styles/mapbox/streets-v12"
        >
          {selectedLocation && (
            <Marker
              longitude={selectedLocation.longitude}
              latitude={selectedLocation.latitude}
              anchor="bottom"
            >
              <MapPin className="w-8 h-8 text-red-500" />
            </Marker>
          )}
        </Map>
      </div>

      {selectedLocation && (
        <div className="p-3 rounded-lg bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10">
          <p className="text-sm text-foreground dark:text-white">
            <MapPin className="w-4 h-4 inline mr-2" />
            {selectedLocation.address}
          </p>
        </div>
      )}
    </div>
  )
}

