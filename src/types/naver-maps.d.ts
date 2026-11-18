/// <reference types="navermaps" />

interface Window {
  naver?: { maps: typeof naver.maps }
  __letitNaverMapsReady?: () => void
  navermap_authFailure?: () => void
}
