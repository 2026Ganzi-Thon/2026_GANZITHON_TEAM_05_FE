import { useState, type ReactNode } from 'react'
import PageTitle from '@/components/layout/PageTitle'
import Screen from '@/components/layout/Screen'
import TopNav, { TopNavTextButton } from '@/components/layout/TopNav'
import Button from '@/components/ui/Button'
import ChoiceChipGroup from '@/components/ui/ChoiceChipGroup'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import FlowerIcon from '@/components/ui/FlowerIcon'
import FlowerSilhouette from '@/components/ui/FlowerSilhouette'
import InfoTable from '@/components/ui/InfoTable'
import OptionList, { MultiOptionList } from '@/components/ui/OptionList'
import ProgressBar from '@/components/ui/ProgressBar'
import TextField from '@/components/ui/TextField'
import { FLOWERS } from '@/constants/flowers'
import {
  BARRIER_OPTIONS,
  DEFAULT_CONDITIONS,
  DISTANCE_OPTIONS,
  MOOD_OPTIONS,
  toConditionRows,
} from '@/constants/options'
import { DAYS_PER_FLOWER, todayString, useCollectionStore } from '@/stores/collectionStore'
import type { Barrier, Distance, Mood } from '@/types/condition'

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-[12px] border-t border-ink/10 px-[20px] py-[24px]">
      <h2 className="text-caption font-semibold text-ink/50">{title}</h2>
      {children}
    </section>
  )
}

/** 개발 모드 전용: 공통 컴포넌트 미리보기 (/dev/components) */
export default function ComponentsPage() {
  const [mood, setMood] = useState<Mood | null>('NEED_REFRESH')
  const [barriers, setBarriers] = useState<Barrier[]>(['TIRED', 'CROWD'])
  const [distance, setDistance] = useState<Distance>('WITHIN_10')
  const [text, setText] = useState('HelloWorld')
  const [password, setPassword] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const collection = useCollectionStore()
  /** 테스트용: 오늘부터 하루씩 거슬러 올라간 날짜를 "모두 완료"로 추가 */
  const addCompletedDays = (count: number) => {
    for (let i = 0; i < count; i++) {
      const d = new Date()
      d.setDate(d.getDate() - collection.completedDates.length - i)
      collection.markDayCompleted(todayString(d))
    }
  }

  return (
    <Screen
      header={
        <TopNav right={<TopNavTextButton onClick={() => {}}>모두 건너뛰기</TopNavTextButton>} />
      }
      bottom={
        <>
          <Button>다음</Button>
          <Button variant="secondary">건너뛰기</Button>
        </>
      }
    >
      <PageTitle
        className="pt-[15px]"
        progress={{ current: 1 }}
        title="공통 컴포넌트"
        description="개발 모드에서만 보이는 미리보기 화면이에요"
      />

      <Section title="Button">
        <Button>Letit 시작하기</Button>
        <Button variant="secondary">건너뛰기</Button>
        <Button variant="text">이미 사용해봤어요</Button>
        <Button disabled>비활성</Button>
      </Section>

      <Section title="ProgressBar">
        <ProgressBar current={2} />
        <ProgressBar current={4} />
      </Section>

      <Section title="OptionList (단일)">
        <OptionList className="p-0" options={MOOD_OPTIONS} value={mood} onChange={setMood} />
      </Section>

      <Section title="OptionList (다중)">
        <MultiOptionList
          className="p-0"
          options={BARRIER_OPTIONS}
          value={barriers}
          onChange={setBarriers}
        />
      </Section>

      <Section title="ChoiceChipGroup">
        <ChoiceChipGroup
          title="이동 가능 거리"
          options={DISTANCE_OPTIONS}
          value={distance}
          onChange={setDistance}
        />
      </Section>

      <Section title="TextField">
        <TextField label="아이디" value={text} onChange={setText} placeholder="아이디" />
        <TextField
          label="비밀번호"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="000000"
        />
      </Section>

      <Section title="InfoTable">
        <InfoTable rows={toConditionRows(DEFAULT_CONDITIONS)} />
      </Section>

      <Section title="ConfirmDialog">
        <Button onClick={() => setDialogOpen(true)}>팝업 열기</Button>
        <ConfirmDialog
          open={dialogOpen}
          title="오늘은 쉬어도 돼요"
          description={'오늘 충분한 휴식을 갖고,\n내일은 미션을 도전해봐요!'}
          onCancel={() => setDialogOpen(false)}
          onConfirm={() => setDialogOpen(false)}
        />
      </Section>

      <Section title="FlowerIcon (보유 / 미보유)">
        <div className="grid grid-cols-3 justify-items-center gap-[30px]">
          {FLOWERS.map((f) => (
            <div key={f.id} className="flex flex-col items-center gap-[8px]">
              <FlowerIcon id={f.id} owned={f.id <= 6} />
              <span className="text-caption text-ink/50">
                {f.id}. {f.name}
              </span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="도감 테스트 (localStorage letit-collection)">
        <p className="text-caption text-ink/50">
          모두 완료 {collection.completedDates.length}일 · 보유 {collection.owned.length}개 · 팝업
          대기 {collection.pendingRewards.length}개
        </p>
        <Button onClick={() => addCompletedDays(1)}>모두 완료한 날 +1</Button>
        <Button onClick={() => addCompletedDays(DAYS_PER_FLOWER)}>
          모두 완료한 날 +{DAYS_PER_FLOWER} (꽃 1개 분량)
        </Button>
        <Button variant="secondary" onClick={() => collection.syncRewards(todayString())}>
          꽃 지급 (앱 다시 실행한 것처럼)
        </Button>
        <Button variant="text" onClick={collection.reset}>
          도감 초기화
        </Button>
      </Section>

      <Section title="FlowerSilhouette (1~5)">
        <div className="grid grid-cols-5 gap-[4px]">
          {([1, 2, 3, 4, 5] as const).map((v) => (
            <div key={v} className="relative h-[120px] overflow-hidden rounded-chip bg-mint">
              <FlowerSilhouette
                variant={v}
                className="absolute top-0 left-1/2 size-[200px] -translate-x-1/2"
              />
            </div>
          ))}
        </div>
      </Section>
    </Screen>
  )
}
