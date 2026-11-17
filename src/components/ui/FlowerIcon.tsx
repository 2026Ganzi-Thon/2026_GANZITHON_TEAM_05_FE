import { FLOWERS, type FlowerId } from '@/constants/flowers'
import { cn } from '@/utils/cn'

/** flower-01.png ~ flower-18.png → { 1: url, ... } */
const flowerImages = Object.fromEntries(
  Object.entries(
    import.meta.glob<string>('@/assets/flowers/*.png', { eager: true, import: 'default' }),
  ).map(([path, url]) => [Number(path.match(/flower-(\d+)\.png$/)?.[1]), url]),
) as Record<FlowerId, string>

interface FlowerIconProps {
  id: FlowerId
  /** 보유 여부. 보유하면 민트, 아니면 회색 실루엣 */
  owned: boolean
  /** 지름(px). 기본 90 */
  size?: number
  className?: string
}

/**
 * 도감 꽃 아이콘 (동그라미 + 꽃 모양).
 * 꽃 모양 PNG를 마스크로 쓰고 색은 CSS로 입힌다.
 */
export default function FlowerIcon({ id, owned, size = 90, className }: FlowerIconProps) {
  const flower = FLOWERS[id - 1]
  const mask = `url(${flowerImages[id]}) center / contain no-repeat`

  return (
    <div
      role="img"
      aria-label={owned ? flower.name : '아직 얻지 못한 꽃'}
      className={cn(
        'relative shrink-0 rounded-full',
        owned ? 'bg-mint/25 ring-2 ring-mint/50' : 'bg-ink/5',
        className,
      )}
      style={{ width: size, height: size }}
    >
      <span
        aria-hidden
        className={cn('absolute inset-0', owned ? 'bg-mint' : 'bg-ink/25')}
        style={{ mask, WebkitMask: mask }}
      />
    </div>
  )
}
