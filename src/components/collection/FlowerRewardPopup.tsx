import { useEffect, useId, useSyncExternalStore } from 'react'
import Button from '@/components/ui/Button'
import FlowerIcon from '@/components/ui/FlowerIcon'
import Modal from '@/components/ui/Modal'
import { router } from '@/app/router'
import { DAYS_PER_FLOWER, todayString, useCollectionStore } from '@/stores/collectionStore'
import { useOutingStore } from '@/stores/outingStore'
import { FLOWERS } from '@/constants/flowers'
import { PATHS } from '@/constants/paths'
import { reconcileCollectionDays } from '@/features/outings/history'

const subscribe = (onChange: () => void) => router.subscribe(onChange)
const getPathname = () => router.state.location.pathname

/**
 * 04 도감 / 꽃 획득 팝업
 * - 앱을 시작할 때 쌓인 일수로 꽃을 지급하고 (syncRewards)
 * - 홈 화면에 있을 때 새로 얻은 꽃을 하나씩 보여준다.
 *
 * App.tsx에서 RouterProvider 옆에 한 번만 둔다. 홈 화면 코드는 건드리지 않는다.
 */
export default function FlowerRewardPopup() {
  const pathname = useSyncExternalStore(subscribe, getPathname)
  const pending = useCollectionStore((s) => s.pendingRewards)
  const dismissReward = useCollectionStore((s) => s.dismissReward)
  const titleId = useId()

  // "다음 앱 실행 때 지급" (기획서 3-10): 앱이 시작될 때 한 번만 확인
  useEffect(() => {
    const collection = useCollectionStore.getState()
    // 예시 기록과 완료 일수를 맞춘다. 브라우저 저장소는 사용하지 않는다.
    reconcileCollectionDays(useOutingStore.getState().state)
    collection.syncRewards(todayString())
  }, [])

  const flowerId = pending[0]
  const open = pathname === PATHS.HOME && flowerId !== undefined
  if (flowerId === undefined) return null
  const flower = FLOWERS[flowerId - 1]

  const close = () => dismissReward(flowerId)
  const goCollection = () => {
    close()
    router.navigate(PATHS.COLLECTION)
  }

  return (
    <Modal open={open} onClose={close} labelledBy={titleId}>
      <div className="page-title flex flex-col gap-[10px] p-[5px]">
        <h2 id={titleId} className="p-[5px] text-heading font-semibold text-ink">
          {DAYS_PER_FLOWER}일 달성으로
          <br />
          {flower.name}
          {hasFinalConsonant(flower.name) ? '을' : '를'} 얻었어요!
        </h2>
        <p className="p-[5px] text-body font-medium text-ink/50">{flower.description}</p>
      </div>
      <div className="flex flex-col items-center gap-[20px] px-[20px] pb-[20px]">
        <FlowerIcon id={flower.id} owned />
        <span className="trim-text text-body font-medium text-ink/50">{flower.name}</span>
      </div>
      <div className="flex gap-[10px]">
        <Button variant="secondary" className="flex-1" onClick={goCollection}>
          도감에서 보기
        </Button>
        <Button className="flex-1" onClick={close}>
          확인했어요
        </Button>
      </div>
    </Modal>
  )
}

/** 마지막 글자에 받침이 있는지 (을/를 고르기) */
function hasFinalConsonant(word: string) {
  const code = word.charCodeAt(word.length - 1) - 0xac00
  return code >= 0 && code <= 11171 && code % 28 !== 0
}
