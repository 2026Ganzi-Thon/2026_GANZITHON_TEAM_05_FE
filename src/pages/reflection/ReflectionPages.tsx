import { useState, type ReactNode } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router'
import {
  Button,
  Card,
  Heading,
  InfoRows,
  Metrics,
  Modal,
  NumberedSteps,
  Page,
  PlaceInfo,
} from '@/features/outings/components'
import { longDate, recordMission, shortDate } from '@/features/outings/history'
import type { OutingRecord } from '@/features/outings/types'
import { useOutingStore } from '@/stores/outingStore'
import { todayString } from '@/stores/collectionStore'
import MissionStats from '@/components/ui/MissionStats'
import { PATHS, recordPath } from '@/constants/paths'
import '@/features/outings/letit.css'

function Frame({
  title,
  description,
  node,
  children,
}: {
  title: string
  description?: string
  node: string
  children: ReactNode
}) {
  const navigate = useNavigate()
  return (
    <div className="lt-app">
      <Page nodeId={node} onBack={() => navigate(PATHS.REFLECTION)}>
        <Heading title={title} subtitle={description} />
        {children}
      </Page>
    </div>
  )
}
export function ArchivePage() {
  const navigate = useNavigate()
  const { state, setMockState } = useOutingStore()
  const [deleting, setDeleting] = useState<OutingRecord | null>(null)
  const records = state.records
    .filter((record) => !record.hidden)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const groups = new Map<string, OutingRecord[]>()
  for (const record of records) {
    const day = todayString(new Date(record.startedAt ?? record.createdAt))
    groups.set(day, [...(groups.get(day) ?? []), record])
  }
  return (
    <Frame title="아카이브" node="72:9963">
      <div className="lt-body lt-archive">
        {records.length === 0 && (
          <Card
            title="아직 남긴 기록이 없어요"
            description="미션을 마치고 오늘의 작은 성공을 남겨보세요"
          />
        )}
        {[...groups.entries()]
          .sort(([a], [b]) => b.localeCompare(a))
          .map(([day, list]) => (
            <section className="lt-archive-group" key={day}>
              <h2 className="lt-trim">{longDate(`${day}T12:00:00`)}</h2>
              {list.map((record) => (
                <Card key={record.id} title={record.title}>
                  <InfoRows
                    rows={[
                      ['시작일', shortDate(record.startedAt ?? record.createdAt)],
                      ['종료일', shortDate(record.createdAt)],
                      ['완료한 단계', `${record.checked.length}개`],
                      [
                        '남은 단계',
                        `${recordMission(record).steps.length - record.checked.length}개`,
                      ],
                    ]}
                  />
                  <div className="lt-button-row">
                    <Button variant="secondary" onClick={() => setDeleting(record)}>
                      삭제하기
                    </Button>
                    <Button onClick={() => navigate(recordPath(record.id))}>기록 보기</Button>
                  </div>
                </Card>
              ))}
            </section>
          ))}
      </div>
      {deleting && (
        <Modal
          title="이 기록을 삭제할까요?"
          description={
            '삭제하면 아카이브에서 다시 볼 수 없어요.\n달력·통계와 이미 얻은 꽃은 그대로 유지돼요.'
          }
          nodeId="72:10028"
          onClose={() => setDeleting(null)}
          actions={
            <>
              <Button variant="secondary" onClick={() => setDeleting(null)}>
                아니오
              </Button>
              <Button
                onClick={() => {
                  setMockState((prev) => ({
                    ...prev,
                    records: prev.records.map((record) =>
                      record.id === deleting.id ? { ...record, hidden: true } : record,
                    ),
                  }))
                  setDeleting(null)
                }}
              >
                예
              </Button>
            </>
          }
        >
          <Card title={deleting.title}>
            <InfoRows
              rows={[
                ['시작일', shortDate(deleting.startedAt ?? deleting.createdAt)],
                ['종료일', shortDate(deleting.createdAt)],
                ['완료한 단계', `${deleting.checked.length}개`],
                [
                  '남은 단계',
                  `${recordMission(deleting).steps.length - deleting.checked.length}개`,
                ],
              ]}
            />
          </Card>
        </Modal>
      )}
    </Frame>
  )
}
export function ChangesPage() {
  const records = useOutingStore((store) => store.state.records)
  const distances = [...records]
    .filter((record) => record.place)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  return (
    <Frame title="나의 변화" node="72:10067">
      <div className="lt-body">
        <MissionStats records={records} />
        <Card
          title="선택한 장소까지의 거리 변화"
          description={`장소를 선택한 ${distances.length}건만 비교했어요`}
        >
          {distances.length ? (
            <InfoRows
              spacious
              rows={distances.map((record) => [
                shortDate(record.createdAt),
                record.place!.distance,
              ])}
            />
          ) : (
            <p className="lt-empty lt-trim">아직 장소를 선택한 기록이 없어요</p>
          )}
        </Card>
      </div>
    </Frame>
  )
}
export function HelpPage() {
  return (
    <Frame
      title="도움 받기"
      description="필요 시 받을 수 있는 전문 지원 정보를 확인하세요"
      node="72:10132"
    >
      <div className="lt-body">
        <Card>
          <div className="lt-help-copy">
            <p className="lt-trim">지금 위급하다면</p>
            <h2 className="lt-trim">109</h2>
            <p className="lt-trim">자살예방상담전화</p>
          </div>
          <a
            className="lt-button lt-button--danger lt-trim"
            href="tel:+82109?oai_link_source=model_response_hotline"
          >
            109 전화하기
          </a>
        </Card>
        <div className="lt-button-row">
          {[
            ['긴급 신고', '112'],
            ['긴급 구조', '119'],
          ].map(([label, number]) => (
            <Card key={number}>
              <div className="lt-help-copy">
                <p className="lt-trim">{label}</p>
                <h2 className="lt-trim">{number}</h2>
              </div>
              <a
                className="lt-button lt-button--secondary lt-trim"
                href={`tel:${number}`}
                aria-label={`${label} ${number} 전화하기`}
              >
                전화하기
              </a>
            </Card>
          ))}
        </div>
      </div>
      <div className="lt-divider" />
      <a
        className="lt-help-link"
        href="https://www.simlimap.com/regions"
        target="_blank"
        rel="noopener noreferrer"
      >
        <strong className="lt-trim">지역 상담 기관 찾기</strong>
        <span className="lt-trim">정신건강복지센터 등 주변 기관</span>
      </a>
    </Frame>
  )
}
export function RecordDetailPage() {
  const navigate = useNavigate()
  const { recordId } = useParams()
  const record = useOutingStore((store) =>
    store.state.records.find((record) => record.id === recordId && !record.hidden),
  )
  if (!record) return <Navigate to={PATHS.ARCHIVE} replace />
  const mission = recordMission(record)
  return (
    <div className="lt-app">
      <Page onBack={() => navigate(PATHS.ARCHIVE)} nodeId="72:10190">
        <Heading eyebrow={shortDate(record.startedAt ?? record.createdAt)} title={record.title} />
        <div className="lt-body lt-body--detail">
          <NumberedSteps steps={mission.steps} checked={record.checked} />
          <Metrics distance={mission.distance} time={mission.time} budget={mission.budget} />
        </div>
        {record.place && <PlaceInfo place={record.place} park={mission.placeType !== 'store'} />}
        <div className="lt-body lt-record-review">
          {[
            ['오늘의 한 줄 후기', record.note],
            ['다시 해보고 싶은 활동', record.retry],
            ['오늘 외출에서 좋았던 점', record.good],
          ].map(([label, value]) => (
            <section key={label}>
              <h2 className="lt-trim">{label}</h2>
              <p className={value ? '' : 'is-empty'}>{value || '기록없음'}</p>
            </section>
          ))}
        </div>
      </Page>
    </div>
  )
}
