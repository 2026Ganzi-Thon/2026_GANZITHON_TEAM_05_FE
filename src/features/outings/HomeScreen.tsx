import { Fragment, useState } from 'react'
import BottomNav from '@/components/layout/BottomNav'
import { assets, calendarAssets } from './assets'
import { Button, Card, InfoRows, StatusBar } from './components'
import { missionById } from './mockData'
import type { MockState } from './types'

export function HomeScreen({
  state,
  onStart,
  onResume,
  onRest,
  onNavigateExternal,
}: {
  state: MockState
  onStart: () => void
  onResume: () => void
  onRest: () => void
  onNavigateExternal?: (destination: 'collection' | 'reflection') => void
}) {
  const [monthOffset, setMonthOffset] = useState(0)
  const date = new Date(2026, 8 + monthOffset, 1)
  const month = date.getMonth() + 1
  const year = date.getFullYear()
  const firstDay = date.getDay()
  const dayCount = new Date(year, month, 0).getDate()
  const weeks = Math.ceil((firstDay + dayCount) / 7)
  const completed = state.records.filter((r) => r.completed).length
  const latest = state.records.at(-1)
  const savedTitle = state.savedMissions[0]
    ? missionById(state.savedMissions[0].missionId).title.replace('집 앞 ', '')
    : ''
  function navigate(destination: 'collection' | 'reflection') {
    if (onNavigateExternal) onNavigateExternal(destination)
    else
      document
        .getElementById(`lt-${destination}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  return (
    <div className="lt-screen lt-home" data-figma-node="72:7657">
      <main className="lt-home-scroll">
        <div className="lt-home-content">
          <section className="lt-hero">
            <div className="lt-hero-main">
              <p className="lt-hero-date lt-trim">2026년 9월 1일</p>
              <h1 className="lt-trim">
                오늘은 어디까지
                <br />
                해볼까요?
              </h1>
              {[
                assets.heroFlower1,
                assets.heroFlower2,
                assets.heroFlower3,
                assets.heroFlower4,
                assets.heroFlower5,
              ].map((src, i) => (
                <div className={`lt-hero-art lt-hero-art--${i + 1}`} key={src}>
                  <img src={src} alt="" />
                </div>
              ))}
            </div>
            <div className="lt-hero-wave">
              <img src={assets.heroWave} alt="" />
            </div>
          </section>
          <section className="lt-home-section">
            <h2 className="lt-section-title lt-trim">투데이</h2>
            <Card
              title={
                state.resting ? '오늘은 쉬어가도\n괜찮아요' : '작은 미션으로\n외출을 시작해보세요'
              }
              description={
                state.resting
                  ? '충분히 쉬고, 준비가 되면 다시 시작해요'
                  : '기분과 에너지에 맞는 미션을 추천해드려요'
              }
            >
              <div className="lt-button-stack">
                <Button onClick={onStart}>
                  {state.resting ? '오늘의 외출 다시 시작하기' : '오늘의 외출 시작하기'}
                </Button>
                <Button variant="text" onClick={onRest}>
                  오늘은 쉬고 싶어요
                </Button>
              </div>
            </Card>
            {state.savedMissions.length > 0 && (
              <Card
                title="이전에 하던 미션이 있어요"
                description={`${savedTitle}${state.savedMissions.length > 1 ? ` 외 ${state.savedMissions.length - 1}개` : ''}`}
              >
                <Button onClick={onResume}>자세히 알아보기</Button>
              </Card>
            )}
            {latest && (
              <Card title="오늘의 미션을 기록했어요" description={latest.title}>
                <InfoRows
                  rows={[
                    [
                      latest.completed ? '완료한 미션' : '완료한 단계',
                      latest.completed ? '1개' : `${latest.checked.length}개`,
                    ],
                    ['외출 후 기분', latest.mood ?? '선택 안 함'],
                  ]}
                />
                {latest.note && <p className="lt-saved-note">{latest.note}</p>}
              </Card>
            )}
          </section>
          <div className="lt-divider" />
          <section className="lt-home-section" id="lt-collection">
            <h2 className="lt-section-title lt-trim">나의 도감</h2>
            <div className="lt-flower-row">
              {[
                [assets.flowerCalla, '칼라'],
                [assets.flowerIris, '아이리스'],
                [assets.flowerAmaryllis, '아마릴리스'],
              ].map(([src, name]) => (
                <figure key={name}>
                  <div className="lt-flower-image">
                    <img src={src} alt={name} />
                  </div>
                  <figcaption className="lt-trim">{name}</figcaption>
                </figure>
              ))}
            </div>
            <Button variant="secondary" onClick={() => navigate('collection')}>
              도감에서 보기
            </Button>
          </section>
          <div className="lt-divider" />
          <section className="lt-home-section" id="lt-reflection">
            <h2 className="lt-section-title lt-trim">성찰</h2>
            <Card
              title={`${month}월 한 달 동안\n${8 + completed}번의 미션을 성공했어요!`}
              className="lt-calendar-card"
            >
              <div className="lt-calendar">
                <div className="lt-month">
                  <button
                    aria-label="이전 달"
                    type="button"
                    onClick={() => setMonthOffset((v) => v - 1)}
                  >
                    <img src={assets.monthPrevious} alt="" />
                  </button>
                  <span>
                    {year}년 {month}월
                  </span>
                  <button
                    aria-label="다음 달"
                    type="button"
                    onClick={() => setMonthOffset((v) => v + 1)}
                  >
                    <img src={assets.monthNext} alt="" />
                  </button>
                </div>
                <div className="lt-calendar-grid">
                  {['일', '월', '화', '월', '목', '금', '토'].map((name, i) => (
                    <span className="lt-weekday" key={`${name}-${i}`}>
                      {name}
                    </span>
                  ))}
                  {Array.from({ length: weeks }, (_, week) => (
                    <Fragment key={week}>
                      {Array.from({ length: 7 }, (_, day) => {
                        const value = week * 7 + day - firstDay + 1
                        return (
                          <span
                            className={`lt-day${value <= 0 || value > dayCount ? 'is-empty' : ''}`}
                            key={day}
                          >
                            {value <= 0 || value > dayCount ? '0' : value}
                          </span>
                        )
                      })}
                      {Array.from({ length: 7 }, (_, day) => (
                        <div className="lt-calendar-marker" key={day}>
                          <img
                            src={calendarAssets[(week * 7 + day) % calendarAssets.length]}
                            alt=""
                          />
                        </div>
                      ))}
                    </Fragment>
                  ))}
                </div>
              </div>
            </Card>
            <Card title="처음과 최근의 미션">
              <InfoRows
                rows={[
                  ['10월 28일', '창문 열고 바깥 공기 쐬기'],
                  [latest ? '9월 1일' : '11월 11일', latest?.title ?? '집 앞 편의점 다녀오기'],
                ]}
              />
            </Card>
            <Card title="단계별 성공 기록">
              <div className="lt-chart">
                <div className="lt-chart-counts">
                  {[2, 3, 2 + completed, 1, 0].map((count, i) => (
                    <span key={i}>{count}회</span>
                  ))}
                </div>
                <div className="lt-chart-bars">
                  {[64, 96, 64, 32, 5].map((height, i) => (
                    <span key={i} style={{ height }} className={i === 1 ? 'is-active' : ''} />
                  ))}
                </div>
                <div className="lt-chart-labels">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <span key={i} className={i === 1 ? 'is-active' : ''}>
                      {i}단계
                    </span>
                  ))}
                </div>
              </div>
            </Card>
            <Button onClick={() => navigate('reflection')}>자세히 보기</Button>
          </section>
        </div>
      </main>
      <StatusBar />
      <BottomNav />
    </div>
  )
}
