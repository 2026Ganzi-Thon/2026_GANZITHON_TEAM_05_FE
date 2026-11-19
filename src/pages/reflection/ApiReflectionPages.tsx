import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router'
import { archiveApi } from '@/api/endpoints'
import { useArchiveQuery, useProgressQuery, useRecordQuery } from '@/api/queries'
import { progressStatistics } from '@/api/dashboard'
import { toRecord } from '@/api/presentation'
import type { ArchiveItem } from '@/api/contracts'
import { invalidateApiData } from '@/lib/queryClient'
import { PATHS, recordPath } from '@/constants/paths'
import { longDate, shortDate } from '@/features/outings/history'
import { todayString } from '@/utils/date'
import {
  Button,
  Card,
  InfoRows,
  Modal,
  Heading,
  Metrics,
  NumberedSteps,
  Page,
  PlaceInfo,
} from '@/features/outings/components'
import ApiFeedback from '@/components/ui/ApiFeedback'
import { apiErrorMessage } from '@/api/errors'
import MissionStats from '@/components/ui/MissionStats'
import Frame from './ReflectionFrame'

const rows = (record: ArchiveItem): [string, string][] => [
  ['시작일', shortDate(record.startedAt)],
  ['종료일', record.endedAt ? shortDate(record.endedAt) : '기록 없음'],
  ['완료한 단계', `${record.completedCount}개`],
  ['남은 단계', `${record.remainingCount}개`],
]
export function ApiArchivePage() {
  const query = useArchiveQuery()
  const navigate = useNavigate()
  const [deleting, setDeleting] = useState<ArchiveItem | null>(null)
  const remove = useMutation({
    mutationFn: async (missionId: string) => {
      const response = await archiveApi.hide(missionId)
      if (!response.success || !response.archivedHidden)
        throw new Error('기록을 삭제하지 못했어요. 다시 시도해 주세요.')
    },
    onSuccess: () => {
      setDeleting(null)
      void invalidateApiData()
    },
  })
  const items = [
    ...new Map(
      (query.data?.pages.flatMap((page) => page.items) ?? []).map((item) => [item.missionId, item]),
    ).values(),
  ].sort((a, b) => b.startedAt.localeCompare(a.startedAt))
  const groups = new Map<string, ArchiveItem[]>()
  for (const item of items) {
    const day = todayString(new Date(item.startedAt))
    groups.set(day, [...(groups.get(day) ?? []), item])
  }
  return (
    <Frame title="아카이브" node="72:9963">
      {query.isPending || (query.error && !query.data) ? (
        <ApiFeedback
          loading={query.isPending}
          error={query.error}
          onRetry={() => void query.refetch()}
        />
      ) : (
        <div className="lt-body lt-archive">
          {!items.length && (
            <Card
              title="아직 남긴 기록이 없어요"
              description="미션을 마치고 오늘의 작은 성공을 남겨보세요"
            />
          )}
          {[...groups].map(([date, records]) => (
            <section className="lt-archive-group" key={date}>
              <h2 className="lt-trim">{longDate(`${date}T12:00:00`)}</h2>
              {records.map((record) => (
                <Card title={record.title} key={record.missionId}>
                  <InfoRows rows={rows(record)} />
                  <div className="lt-button-row">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        remove.reset()
                        setDeleting(record)
                      }}
                    >
                      삭제하기
                    </Button>
                    <Button onClick={() => navigate(recordPath(record.missionId))}>
                      기록 보기
                    </Button>
                  </div>
                </Card>
              ))}
            </section>
          ))}
          {query.error && (
            <p role="alert" className="lt-api-error">
              {apiErrorMessage(query.error)}
            </p>
          )}
          {query.hasNextPage && (
            <Button
              disabled={query.isFetchingNextPage}
              variant="secondary"
              onClick={() => void query.fetchNextPage()}
            >
              {query.isFetchingNextPage ? '기록을 불러오고 있어요' : '이전 기록 더 보기'}
            </Button>
          )}
        </div>
      )}
      {deleting && (
        <Modal
          title="이 기록을 삭제할까요?"
          description={
            '삭제하면 아카이브에서 다시 볼 수 없어요.\n달력·통계와 이미 얻은 꽃은 그대로 유지돼요.'
          }
          nodeId="72:10028"
          onClose={() => {
            if (!remove.isPending) setDeleting(null)
          }}
          actions={
            <>
              <Button
                variant="secondary"
                disabled={remove.isPending}
                onClick={() => setDeleting(null)}
              >
                아니오
              </Button>
              <Button disabled={remove.isPending} onClick={() => remove.mutate(deleting.missionId)}>
                예
              </Button>
            </>
          }
        >
          <Card title={deleting.title}>
            <InfoRows rows={rows(deleting)} />
          </Card>
          {remove.error && (
            <p role="alert" className="lt-api-error">
              {apiErrorMessage(remove.error)}
            </p>
          )}
        </Modal>
      )}
    </Frame>
  )
}
export function ApiChangesPage() {
  const query = useProgressQuery()
  const distances = query.data?.distanceChanges ?? query.data?.distanceHistory ?? []
  return (
    <Frame title="나의 변화" node="72:10067">
      {query.isPending || query.error ? (
        <ApiFeedback
          loading={query.isPending}
          error={query.error}
          onRetry={() => void query.refetch()}
        />
      ) : (
        <div className="lt-body">
          <MissionStats records={[]} statistics={progressStatistics(query.data)} />
          <Card
            title="선택한 장소까지의 거리 변화"
            description={`장소를 선택한 ${distances.length}건만 비교했어요`}
          >
            {distances.length ? (
              <InfoRows
                spacious
                rows={distances.map((item) => [
                  shortDate(item.date),
                  `${item.distanceMeters.toLocaleString('ko-KR')}m`,
                ])}
              />
            ) : (
              <p className="lt-empty lt-trim">아직 장소를 선택한 기록이 없어요</p>
            )}
          </Card>
        </div>
      )}
    </Frame>
  )
}
export function ApiRecordDetailPage() {
  const navigate = useNavigate()
  const { recordId = '' } = useParams()
  const query = useRecordQuery(recordId)
  if (query.isPending || query.error)
    return (
      <div className="lt-app">
        <Page nodeId="72:10190" onBack={() => navigate(PATHS.ARCHIVE)}>
          <Heading title="외출 기록" />
          <ApiFeedback
            loading={query.isPending}
            error={query.error}
            onRetry={() => void query.refetch()}
          />
        </Page>
      </div>
    )
  const record = toRecord(query.data),
    mission = record.mission!
  return (
    <div className="lt-app">
      <Page onBack={() => navigate(PATHS.ARCHIVE)} nodeId="72:10190">
        <Heading eyebrow={shortDate(record.startedAt!)} title={record.title} />
        <div className="lt-body lt-body--detail">
          <NumberedSteps steps={mission.steps} checked={record.checked} />
          <Metrics distance={mission.distance} time={mission.time} budget={mission.budget} />
        </div>
        {record.place && <PlaceInfo place={record.place} />}
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
