/** Figma 추천(72:8925)·장소 검색(72:8958)의 공통 로딩 화면. */
export default function MissionSkeletons({ places = false }: { places?: boolean }) {
  return (
    <div
      className={`lt-body lt-skeletons${places ? 'lt-location-skeletons' : ''}`}
      role="status"
      aria-label="정보를 불러오는 중"
    >
      {places ? (
        <>
          <div className="lt-card">
            <div className="lt-skeleton lt-skeleton--short" />
            <div className="lt-skeleton lt-skeleton--medium" />
          </div>
          <div className="lt-skeleton-map" />
          <div className="lt-skeleton-pair">
            {[0, 1].map((index) => (
              <div className="lt-card" key={index}>
                <div className="lt-skeleton lt-skeleton--short" />
                <div className="lt-skeleton lt-skeleton--tiny" />
              </div>
            ))}
          </div>
        </>
      ) : (
        [0, 1].map((index) => (
          <div className="lt-card" key={index}>
            <div className="lt-skeleton lt-skeleton--short" />
            <div className="lt-skeleton lt-skeleton--medium" />
            <div className="lt-skeleton lt-skeleton--button" />
          </div>
        ))
      )}
    </div>
  )
}
