import { useEffect, useMemo, useRef, useState } from 'react'
import SharedButton from '@/components/ui/Button'
import { kakaoMapAppKey, loadKakaoMaps, type Coordinates, type KakaoMap } from '@/lib/kakaoMaps'
import { isApiEnabled } from '@/api/config'
import { assets } from './assets'
import type { Place } from './types'

export default function OutingMap({
  places,
  selectedPlaceId,
  onSelect,
  park = false,
  currentPosition,
}: {
  places: readonly Place[]
  selectedPlaceId: string
  onSelect?: (id: string) => void
  park?: boolean
  currentPosition?: Coordinates | null
}) {
  const container = useRef<HTMLDivElement>(null)
  const pins = useRef(new Map<string, HTMLButtonElement>())
  const onSelectRef = useRef(onSelect)
  const [attempt, setAttempt] = useState(0)
  const [error, setError] = useState(false)
  const [ready, setReady] = useState<KakaoMap | null>(null)
  const locations = useMemo(
    () =>
      places.filter(
        (place) =>
          place.coordinates &&
          Number.isFinite(place.coordinates.lat) &&
          Number.isFinite(place.coordinates.lng),
      ),
    [places],
  )
  const locationsRef = useRef(locations)
  const positionRef = useRef(currentPosition)
  const locationKey = locations
    .map((place) => `${place.id}:${place.coordinates!.lat}:${place.coordinates!.lng}`)
    .join('|')
  const usable = !!kakaoMapAppKey && locations.length > 0
  useEffect(() => {
    onSelectRef.current = onSelect
    locationsRef.current = locations
    positionRef.current = currentPosition
  }, [onSelect, locations, currentPosition])
  useEffect(() => {
    if (!usable || !container.current) return
    let disposed = false
    let observer: ResizeObserver | undefined
    const target = container.current
    void loadKakaoMaps()
      .then((sdk) => {
        if (disposed) return
        const first = locationsRef.current[0].coordinates!
        const map = new sdk.Map(target, { center: new sdk.LatLng(first.lat, first.lng), level: 4 })
        observer = new ResizeObserver(() => map.relayout())
        observer.observe(target)
        setReady(map)
        setError(false)
      })
      .catch(() => {
        if (!disposed) setError(true)
      })
    return () => {
      disposed = true
      observer?.disconnect()
      target.replaceChildren()
      setReady(null)
    }
  }, [usable, attempt])
  useEffect(() => {
    if (!ready || !window.kakao?.maps) return
    const sdk = window.kakao.maps
    const bounds = new sdk.LatLngBounds()
    const pinElements = pins.current
    const overlays = locationsRef.current.map((place, index) => {
      const point = new sdk.LatLng(place.coordinates!.lat, place.coordinates!.lng)
      bounds.extend(point)
      const pin = document.createElement('button')
      pin.type = 'button'
      pin.className = 'lt-map-pin'
      pinElements.set(place.id, pin)
      pin.textContent = String(index + 1)
      pin.setAttribute('aria-label', `${index + 1}. ${place.name}`)
      pin.addEventListener('click', () => onSelectRef.current?.(place.id))
      return new sdk.CustomOverlay({
        position: point,
        content: pin,
        map: ready,
        yAnchor: 1,
        zIndex: 2,
      })
    })
    const current = positionRef.current
    if (current) {
      const point = new sdk.LatLng(current.lat, current.lng)
      bounds.extend(point)
      const marker = document.createElement('img')
      marker.src = assets.locationDot
      marker.alt = '현재 위치'
      overlays.push(
        new sdk.CustomOverlay({ position: point, content: marker, map: ready, zIndex: 3 }),
      )
    }
    ready.setBounds(bounds, 35, 35, 35, 35)
    return () => {
      overlays.forEach((overlay) => overlay.setMap(null))
      pinElements.clear()
    }
  }, [ready, locationKey, currentPosition])
  useEffect(() => {
    for (const [id, pin] of pins.current) {
      pin.classList.toggle('is-selected', id === selectedPlaceId)
      pin.setAttribute('aria-pressed', String(id === selectedPlaceId))
    }
    const place = locations.find((place) => place.id === selectedPlaceId)
    if (ready && place?.coordinates && window.kakao?.maps)
      ready.panTo(new window.kakao.maps.LatLng(place.coordinates.lat, place.coordinates.lng))
  }, [ready, locations, selectedPlaceId, locationKey, currentPosition])
  return (
    <div className={`lt-map ${park ? 'lt-map--park' : ''}`} aria-label="미션 장소 지도">
      {usable && <div ref={container} className="lt-map-canvas" />}
      {!usable && !isApiEnabled && (
        <div className="lt-map-crop">
          <img className="lt-map-image" src={assets.map} alt="" />
          {places.map((place, index) => (
            <button
              key={place.id}
              type="button"
              className={`lt-map-marker ${index === 0 ? 'lt-map-marker--one' : 'lt-map-marker--two'}`}
              aria-label={`${index + 1}. ${place.name}`}
              onClick={() => onSelect?.(place.id)}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}
      {isApiEnabled && (!usable || error) && (
        <div className="lt-map-unavailable">
          <p>
            지도를 표시할 수 없어요.
            <br />
            장소 정보로 확인해 주세요.
          </p>
        </div>
      )}
      {(!usable || !ready || error) && (
        <div className="lt-map-notice">
          <span>
            {!isApiEnabled && !usable
              ? '지도 미리보기'
              : error
                ? '지도를 불러오지 못했어요'
                : '지도를 불러오고 있어요'}
          </span>
          {error && (
            <SharedButton
              className="lt-map-retry"
              variant="text"
              onClick={() => {
                setError(false)
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
