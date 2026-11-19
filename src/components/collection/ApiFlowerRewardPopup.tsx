import { useEffect, useId, useRef, useState, useSyncExternalStore } from 'react'
import { router } from '@/app/router'
import { PATHS } from '@/constants/paths'
import { useCollectionQuery } from '@/api/queries'
import { collectionApi } from '@/api/endpoints'
import { useAuthStore } from '@/stores/authStore'
import { invalidateApiData } from '@/lib/queryClient'
import { apiErrorMessage } from '@/api/errors'
import Button from '@/components/ui/Button'
import FlowerIcon from '@/components/ui/FlowerIcon'
import Modal from '@/components/ui/Modal'
import type { FlowerId } from '@/constants/flowers'
const subscribe = (onChange: () => void) => router.subscribe(onChange)
const getPath = () => router.state.location.pathname
export default function ApiFlowerRewardPopup() {
  const path = useSyncExternalStore(subscribe, getPath)
  const userId = useAuthStore((store) => store.userId)
  const query = useCollectionQuery()
  const refetchCollection = query.refetch
  const [dismissed, setDismissed] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const operation = useRef(false)
  const titleId = useId()
  useEffect(() => {
    if (path === PATHS.HOME && userId) void refetchCollection()
  }, [path, userId, refetchCollection])
  const owned = [...(query.data?.flowers ?? [])]
    .filter((flower) => flower.owned)
    .sort((a, b) => a.flowerNumber - b.flowerNumber)
  const count = Math.min(query.data?.pendingClaimCount ?? 0, owned.length)
  const flowers = count ? owned.slice(-count) : []
  const signature = `${userId}:${flowers.map((flower) => `${flower.flowerNumber}:${flower.acquiredAt}`).join(',')}`
  const open = path === PATHS.HOME && flowers.length > 0 && signature !== dismissed
  async function acknowledge(goCollection = false) {
    if (operation.current) return
    operation.current = true
    setPending(true)
    setError('')
    try {
      await collectionApi.claim()
      setDismissed(signature)
      void invalidateApiData()
      if (goCollection) await router.navigate(PATHS.COLLECTION)
    } catch (error) {
      setError(apiErrorMessage(error))
    } finally {
      operation.current = false
      setPending(false)
    }
  }
  if (!flowers.length) return null
  const flower = flowers[0]
  return (
    <Modal open={open} onClose={() => void acknowledge()} labelledBy={titleId}>
      <div className="page-title flex flex-col gap-[10px] p-[5px]">
        <h2 id={titleId} className="p-[5px] text-heading font-semibold text-ink">
          {flowers.length === 1 ? (
            <>
              3일 달성으로
              <br />
              {flower.name}
              {hasFinalConsonant(flower.name) ? '을' : '를'} 얻었어요!
            </>
          ) : (
            `${flowers.length}개의 새 꽃을 얻었어요!`
          )}
        </h2>
        <p className="p-[5px] text-body text-ink/50">
          {flowers.length === 1
            ? flower.description
            : '미션 달성으로 얻은 새로운 꽃들을 확인해 보세요.'}
        </p>
      </div>
      <div
        className={
          flowers.length === 1
            ? 'flex flex-col items-center gap-[20px] pb-[20px]'
            : 'grid grid-cols-3 gap-[20px] py-[20px]'
        }
      >
        {flowers.map((item) => (
          <figure key={item.flowerNumber} className="flex flex-col items-center gap-[20px]">
            <FlowerIcon id={item.flowerNumber as FlowerId} owned name={item.name} />
            <figcaption className="trim-text text-body text-ink/50">{item.name}</figcaption>
          </figure>
        ))}
      </div>
      {error && (
        <p role="alert" className="text-caption text-red-500">
          {error}
        </p>
      )}
      <div className="flex gap-[10px]">
        <Button
          className="flex-1"
          variant="secondary"
          disabled={pending}
          onClick={() => void acknowledge(true)}
        >
          도감에서 보기
        </Button>
        <Button className="flex-1" disabled={pending} onClick={() => void acknowledge()}>
          확인했어요
        </Button>
      </div>
    </Modal>
  )
}
function hasFinalConsonant(value: string) {
  const code = value.charCodeAt(value.length - 1) - 0xac00
  return code >= 0 && code <= 11171 && code % 28 !== 0
}
