import { useState, useCallback, useRef, useEffect } from 'react'
import Map, { Marker, MapRef } from 'react-map-gl'
import { MAPBOX_TOKEN } from '@/lib/constants'
import { MapPin, Search, Navigation, AlertCircle } from 'lucide-react'
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
  // Default to India (Hyderabad coordinates)
  const [viewState, setViewState] = useState({
    longitude: initialLocation?.longitude || 78.4867, // Hyderabad, India
    latitude: initialLocation?.latitude || 17.3850, // Hyderabad, India
    zoom: initialLocation ? 14 : 10,
  })
  const [searchQuery, setSearchQuery] = useState(initialLocation?.address || '')
  const [selectedLocation, setSelectedLocation] = useState<{
    address: string
    latitude: number
    longitude: number
  } | null>(initialLocation || null)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const mapRef = useRef<MapRef>(null)
  const searchTimeoutRef = useRef<number | null>(null)

  // Update when initialLocation changes
  useEffect(() => {
    if (initialLocation) {
      setSelectedLocation(initialLocation)
      setSearchQuery(initialLocation.address)
      setViewState({
        longitude: initialLocation.longitude,
        latitude: initialLocation.latitude,
        zoom: 14,
      })
      // Call onLocationSelect to notify parent
      onLocationSelect(initialLocation)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLocation?.latitude, initialLocation?.longitude])

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

  // Debounced search for autocomplete suggestions
  const handleSearchInput = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([])
      setShowSuggestions(false)
      return
    }

    setIsSearching(true)
    try {
      // Focus on India by adding proximity and country filter
      // Limit to 3 results to keep dropdown small
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&limit=3&proximity=78.4867,17.3850&country=IN`
      )
      const data = await response.json()
      
      if (data.features && data.features.length > 0) {
        setSearchResults(data.features)
        setShowSuggestions(true)
      } else {
        setSearchResults([])
        setShowSuggestions(false)
      }
    } catch (error) {
      console.error('Error searching location:', error)
      setSearchResults([])
      setShowSuggestions(false)
    } finally {
      setIsSearching(false)
    }
  }, [])

  // Handle input change with debouncing
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (searchQuery.length >= 2) {
      searchTimeoutRef.current = window.setTimeout(() => {
        handleSearchInput(searchQuery)
      }, 300) // 300ms debounce
    } else {
      setSearchResults([])
      setShowSuggestions(false)
    }

    return () => {
      if (searchTimeoutRef.current) {
        window.clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery, handleSearchInput])

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return
    
    try {
      // Focus on India
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?access_token=${MAPBOX_TOKEN}&limit=1&proximity=78.4867,17.3850&country=IN`
      )
      const data = await response.json()
      
      if (data.features && data.features.length > 0) {
        const feature = data.features[0]
        const [lng, lat] = feature.center
        const address = feature.place_name
        
        const location = { address, latitude: lat, longitude: lng }
        setSelectedLocation(location)
        onLocationSelect(location)
        setSearchQuery(address)
        setShowSuggestions(false)
        
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

  const handleSelectSuggestion = useCallback((feature: any) => {
    const [lng, lat] = feature.center
    const address = feature.place_name
    
    const location = { address, latitude: lat, longitude: lng }
    setSelectedLocation(location)
    onLocationSelect(location)
    setSearchQuery(address)
    setShowSuggestions(false) // Hide suggestions immediately
    
    // Update map view immediately
    setViewState({
      longitude: lng,
      latitude: lat,
      zoom: 14,
    })
  }, [onLocationSelect])

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
    <div className="space-y-3 sm:space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted dark:text-gray-400 z-10" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch()
                setShowSuggestions(false)
              }
            }}
            onFocus={() => {
              if (searchQuery.length >= 2 && searchResults.length > 0) {
                setShowSuggestions(true)
              }
            }}
            onBlur={() => {
              // Delay to allow clicking on suggestions
              setTimeout(() => setShowSuggestions(false), 200)
            }}
            placeholder="Search for location (e.g., Visakhapatnam, Mumbai, Delhi)..."
            className="pl-10"
          />
          
          {/* Autocomplete Suggestions Dropdown - Compact and positioned above input */}
          {showSuggestions && searchResults.length > 0 && (
            <div className="absolute z-50 w-full bottom-full mb-1 bg-white dark:bg-[#1A1A1A] border border-gray-300 dark:border-white/10 rounded-lg shadow-xl max-h-48 overflow-y-auto">
              {searchResults.map((feature, index) => (
                <button
                  key={feature.id || index}
                  type="button"
                  onClick={() => handleSelectSuggestion(feature)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors border-b border-gray-100 dark:border-white/5 last:border-b-0"
                >
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-muted dark:text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground dark:text-white truncate">
                        {feature.text}
                      </p>
                      <p className="text-xs text-muted dark:text-gray-400 truncate">
                        {feature.place_name}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
          
          {isSearching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-muted dark:border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
        <Button type="button" onClick={handleSearch} variant="outline" className="min-h-[44px] sm:min-h-[40px]">
          <span className="hidden sm:inline">Search</span>
          <span className="sm:hidden">🔍</span>
        </Button>
        <Button type="button" onClick={handleUseCurrentLocation} variant="outline" aria-label="Use current location" className="min-h-[44px] sm:min-h-[40px] min-w-[44px] sm:min-w-[40px]">
          <Navigation className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>
      </div>

      <div className="space-y-2">
        <p className="text-xs text-muted dark:text-gray-400 flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          Click on the map to pin your location, or use search above
        </p>
      </div>
      <div 
        className="relative h-48 sm:h-56 md:h-64 rounded-lg overflow-hidden border border-white/20 dark:border-white/10"
        onClick={() => setShowSuggestions(false)} // Hide suggestions when clicking on map
        style={{ minHeight: '192px' }} // Ensure minimum height on mobile
      >
        {!MAPBOX_TOKEN ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-muted/50 dark:bg-gray-800/50 p-4">
            <AlertCircle className="w-12 h-12 text-yellow-500 mb-4" />
            <p className="text-sm font-medium text-foreground dark:text-white text-center mb-2">
              Mapbox token not configured
            </p>
            <p className="text-xs text-muted dark:text-gray-400 text-center">
              Please add VITE_MAPBOX_TOKEN to your environment variables
            </p>
          </div>
        ) : (
          <Map
            {...viewState}
            ref={mapRef}
            onMove={(evt) => setViewState(evt.viewState)}
            onClick={(e) => {
              setShowSuggestions(false) // Hide suggestions when clicking on map
              handleMapClick(e)
            }}
            mapboxAccessToken={MAPBOX_TOKEN}
            style={{ width: '100%', height: '100%', minHeight: '192px' }}
            mapStyle="mapbox://styles/mapbox/streets-v12"
            reuseMaps={true}
            antialias={true}
            interactive={true}
            cursor="crosshair"
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
        )}
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

