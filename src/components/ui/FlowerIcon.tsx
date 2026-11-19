import { FLOWERS, type FlowerId } from '@/constants/flowers'
import { cn } from '@/utils/cn'

const flowerImages = import.meta.glob<string>('@/assets/flower-icons/*.svg', {
  eager: true,
  import: 'default',
})

interface FlowerIconProps {
  id: FlowerId
  /** 보유 여부. 보유하면 민트, 아니면 회색 실루엣 */
  owned: boolean
  /** 지름(px). 기본 90 */
  size?: number
  className?: string
  name?: string
}

/**
 * 도감 꽃 아이콘 (동그라미 + 꽃 모양).
 * 피그마 원본 보유·미보유 SVG를 사용한다. 보유 아이콘의 2px 외곽 테두리도 보존한다.
 */
export default function FlowerIcon({ id, owned, size = 90, className, name }: FlowerIconProps) {
  const flower = FLOWERS[id - 1]
  const src =
    flowerImages[
      `/src/assets/flower-icons/${String(id).padStart(2, '0')}-${owned ? 'owned' : 'unowned'}.svg`
    ]

  return (
    <div
      role="img"
      aria-label={owned ? (name ?? flower.name) : '아직 얻지 못한 꽃'}
      className={cn('relative shrink-0', className)}
      style={{ width: size, height: size }}
    >
      <span
        aria-hidden
        className="absolute top-0 left-0 size-[90px] origin-top-left"
        style={{ transform: `scale(${size / 90})` }}
      >
        <img
          alt=""
          src={src}
          className={cn(
            'absolute block max-w-none',
            owned ? '-top-[2px] -left-[2px]' : 'top-0 left-0',
          )}
        />
      </span>
    </div>
  )
}
