import { useEffect, useRef, useState } from 'react'
import SharedButton from '@/components/ui/Button'
import {
  loadNaverMaps,
  NAVER_MAP_ERROR_EVENT,
  naverMapClientId,
  resolvePlaceCoordinates,
  type Coordinates,
  type NaverMaps,
} from '@/lib/naverMaps'
import { cn } from '@/utils/cn'
import { assets } from './assets'
import type { Place } from './types'

interface OutingMapProps {
  places: readonly Place[]
  selectedPlaceId: string
  onSelect?: (id: string) => void
  park?: boolean
}
type MapResource = { sdk: NaverMaps; map: naver.maps.Map }
type LocatedPlace = { place: Place; coordinates: Coordinates }

export default function OutingMap({
  places,
  selectedPlaceId,
  onSelect,
  park = false,
}: OutingMapProps) {
  const container = useRef<HTMLDivElement>(null)
  const onSelectRef = useRef(onSelect)
  const lastSelection = useRef<string | null>(null)
  const [resource, setResource] = useState<MapResource | null>(null)
  const [placeResolution, setPlaceResolution] = useState<{
    source: readonly Place[]
    locations: LocatedPlace[]
  } | null>(null)
  const locatedPlaces = placeResolution?.source === places ? placeResolution.locations : null
  const [error, setError] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    onSelectRef.current = onSelect
  }, [onSelect])
  useEffect(() => {
    if (!naverMapClientId) return
    let disposed = false
    let map: naver.maps.Map | null = null
    let observer: ResizeObserver | null = null
    const onError = () => {
      if (!disposed) setError(true)
    }
    window.addEventListener(NAVER_MAP_ERROR_EVENT, onError)
    void loadNaverMaps()
      .then((sdk) => {
        if (disposed || !container.current) return
        map = new sdk.Map(container.current, {
          center: new sdk.LatLng(37.5665, 126.978),
          zoom: 14,
          zoomControl: true,
          zoomControlOptions: {
            position: sdk.Position.TOP_RIGHT,
            style: sdk.ZoomControlStyle.SMALL,
          },
          scrollWheel: false,
        })
        const currentMap = map
        observer = new ResizeObserver(() => currentMap.autoResize())
        observer.observe(container.current)
        setResource({ sdk, map })
      })
      .catch(onError)
    return () => {
      disposed = true
      observer?.disconnect()
      window.removeEventListener(NAVER_MAP_ERROR_EVENT, onError)
      map?.destroy()
    }
  }, [attempt])

  useEffect(() => {
    if (!resource) return
    let disposed = false
    void Promise.all(
      places.map(async (place) => ({
        place,
        coordinates: await resolvePlaceCoordinates(place, resource.sdk),
      })),
    )
      .then((resolved) => {
        if (disposed) return
        setPlaceResolution({ source: places, locations: resolved })
        if (resolved.length)
          resource.map.fitBounds(
            resolved.map(
              ({ coordinates }) => new resource.sdk.LatLng(coordinates.lat, coordinates.lng),
            ),
            { top: 28, right: 45, bottom: 28, left: 28, maxZoom: 16 },
          )
      })
      .catch(() => {
        if (!disposed) setError(true)
      })
    return () => {
      disposed = true
    }
  }, [resource, places])

  useEffect(() => {
    if (!resource || !locatedPlaces || error) return
    const { sdk, map } = resource
    const markers = locatedPlaces.map(({ place, coordinates }, index) => {
      const selected = place.id === selectedPlaceId
      const button = document.createElement('button')
      button.type = 'button'
      button.disabled = !onSelectRef.current
      button.className = cn('lt-map-pin', selected && 'is-selected')
      button.textContent = String(index + 1)
      button.setAttribute('aria-label', `${place.name} 선택`)
      button.setAttribute('aria-pressed', String(selected))
      const select = () => onSelectRef.current?.(place.id)
      button.addEventListener('click', select)
      const marker = new sdk.Marker({
        map,
        position: new sdk.LatLng(coordinates.lat, coordinates.lng),
        title: place.name,
        icon: { content: button, size: new sdk.Size(25, 25), anchor: new sdk.Point(12.5, 12.5) },
        zIndex: selected ? 10 : 1,
      })
      return { marker, button, select }
    })
    const selected = locatedPlaces.find(({ place }) => place.id === selectedPlaceId)
    if (selected && lastSelection.current && lastSelection.current !== selectedPlaceId) {
      map.panTo(new sdk.LatLng(selected.coordinates.lat, selected.coordinates.lng))
    }
    lastSelection.current = selectedPlaceId
    return () =>
      markers.forEach(({ marker, button, select }) => {
        button.removeEventListener('click', select)
        marker.setMap(null)
      })
  }, [resource, locatedPlaces, selectedPlaceId, error])

  const ready = !!resource && !!locatedPlaces?.length && !error
  const status = !naverMapClientId
    ? '지도 미리보기'
    : error
      ? '지도를 불러오지 못했어요'
      : !ready
        ? '지도를 불러오는 중이에요'
        : null

  return (
    <div
      className={cn('lt-map', park && 'lt-map--park')}
      data-map-state={ready ? 'ready' : status}
      aria-label="장소 지도"
    >
      <div
        ref={container}
        className="lt-map-canvas"
        aria-hidden={!ready}
        style={{ visibility: ready ? 'visible' : 'hidden' }}
      />
      {!ready && (
        <>
          <div className="lt-map-crop">
            <img className="lt-map-image" src={assets.map} alt="장소 지도 미리보기" />
          </div>
          {places.map((place, index) => (
            <button
              key={place.id}
              className={cn(
                'lt-map-marker',
                index === 0 ? 'lt-map-marker--one' : 'lt-map-marker--two',
                place.id === selectedPlaceId && 'is-selected',
              )}
              onClick={() => onSelect?.(place.id)}
              aria-label={`${place.name} 선택`}
              aria-pressed={place.id === selectedPlaceId}
              type="button"
              disabled={!onSelect}
            >
              <span className="lt-trim">{index + 1}</span>
            </button>
          ))}
        </>
      )}
      {status && (
        <div className="lt-map-notice" role="status">
          <span>{status}</span>
          {error && (
            <SharedButton
              variant="text"
              className="lt-map-retry"
              onClick={() => {
                setError(false)
                setPlaceResolution(null)
                setResource(null)
                setAttempt((value) => value + 1)
              }}
            >
              다시 시도
            </SharedButton>
          )}
        </div>
      )}
    </div>
  )
}
