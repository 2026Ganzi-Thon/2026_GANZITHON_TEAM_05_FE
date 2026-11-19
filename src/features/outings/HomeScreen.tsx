import { useState } from 'react'
import BottomNav from '@/components/layout/BottomNav'
import FlowerIcon from '@/components/ui/FlowerIcon'
import MissionCalendar from '@/components/ui/MissionCalendar'
import MissionStats from '@/components/ui/MissionStats'
import { FLOWERS } from '@/constants/flowers'
import { todayString, useCollectionStore } from '@/stores/collectionStore'
import { assets } from './assets'
import { Button, Card, InfoRows } from './components'
import { dailyStatuses, longDate, resumableMissions, shortDate } from './history'
import { missionById } from './mockData'
import type { MockState, SavedMission } from './types'
import type { DayStatus } from './history'
import type { MissionStatistics } from '@/components/ui/MissionStats'

export function HomeScreen({
  state,
  onStart,
  onResume,
  onRest,
  onStop,
  onNavigateExternal,
  dashboard,
}: {
  state: MockState
  onStart: () => void
  onResume: () => void
  onRest: () => void
  onStop: (saved: SavedMission) => void
  onNavigateExternal: (destination: 'collection' | 'reflection') => void
  dashboard?: {
    month: string
    statuses: Record<string, DayStatus>
    completed: number
    statistics: MissionStatistics
    onMonthChange: (month: string) => void
  }
}) {
  const ownedFlowers = useCollectionStore((store) => store.owned)
  const recentFlowers = ownedFlowers.slice(-3)
  const [now] = useState(() => new Date())
  const today = todayString(now)
  const [month, setMonth] = useState(today.slice(0, 7))
  const resting = state.restDates.includes(today)
  const saved = resumableMissions(state)
  const completed = new Set(
    state.records
      .filter(
        (record) => record.completed && todayString(new Date(record.createdAt)).startsWith(month),
      )
      .map((record) => record.runId ?? record.id),
  ).size
  return (
    <div className="lt-screen lt-home" data-figma-node="72:7657">
      <main tabIndex={0} className="lt-home-scroll">
        <div className="lt-home-content">
          <section className="lt-hero">
            <div className="lt-hero-main">
              <p className="lt-hero-date lt-trim">{longDate(now.toISOString())}</p>
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
              title={resting ? '오늘은 쉬어가도\n괜찮아요' : '작은 미션으로\n외출을 시작해보세요'}
              description={
                resting
                  ? '충분히 쉬고, 준비가 되면 다시 시작해요'
                  : '기분과 에너지에 맞는 미션을 추천해드려요'
              }
            >
              <div className="lt-button-stack">
                <Button onClick={onStart}>
                  {resting ? '오늘의 외출 다시 시작하기' : '오늘의 외출 시작하기'}
                </Button>
                <Button variant="text" onClick={onRest}>
                  오늘은 쉬고 싶어요
                </Button>
              </div>
            </Card>
            {saved.map((mission) => (
              <Card
                key={mission.id}
                title="이전에 하던 미션이 있어요"
                description={mission.title ?? missionById(mission.missionId).title}
              >
                <InfoRows
                  rows={[
                    ['시작일', shortDate(mission.startedAt)],
                    ['완료한 단계', `${mission.completedCount ?? mission.checked.length}개`],
                    ['남은 단계', `${mission.remainingCount ?? 5 - mission.checked.length}개`],
                  ]}
                />
                <div className="lt-button-stack">
                  <Button onClick={onResume}>자세히 알아보기</Button>
                  <Button variant="secondary" onClick={() => onStop(mission)}>
                    그만하기
                  </Button>
                </div>
              </Card>
            ))}
          </section>
          <div className="lt-divider" />
          <section className="lt-home-section" id="lt-collection">
            <h2 className="lt-section-title lt-trim">나의 도감</h2>
            {recentFlowers.length ? (
              <div className="lt-flower-row">
                {recentFlowers.map(({ id, name }) => (
                  <figure key={id}>
                    <FlowerIcon id={id} owned name={name} />
                    <figcaption className="lt-trim">{name ?? FLOWERS[id - 1].name}</figcaption>
                  </figure>
                ))}
              </div>
            ) : (
              <p className="lt-hint lt-trim">
                아직 얻은 꽃이 없어요. 미션 달성으로 꽃을 모아보세요.
              </p>
            )}
            <Button variant="secondary" onClick={() => onNavigateExternal('collection')}>
              도감에서 보기
            </Button>
          </section>
          <div className="lt-divider" />
          <section className="lt-home-section" id="lt-reflection">
            <h2 className="lt-section-title lt-trim">성찰</h2>
            <Card
              title={`${Number(month.slice(5))}월 한 달 동안\n${dashboard?.completed ?? completed}번의 미션을 성공했어요!`}
              className="lt-calendar-card"
            >
              <MissionCalendar
                month={dashboard?.month}
                statuses={dashboard?.statuses ?? dailyStatuses(state)}
                onMonthChange={(next) => {
                  setMonth(next)
                  dashboard?.onMonthChange(next)
                }}
              />
            </Card>
            <MissionStats records={state.records} statistics={dashboard?.statistics} />
            <Button onClick={() => onNavigateExternal('reflection')}>자세히 보기</Button>
          </section>
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
