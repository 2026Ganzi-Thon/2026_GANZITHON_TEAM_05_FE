import flower1 from '@/assets/silhouettes/flower-1.webp'
import flower2 from '@/assets/silhouettes/flower-2.webp'
import flower3 from '@/assets/silhouettes/flower-3.webp'
import flower4 from '@/assets/silhouettes/flower-4.webp'
import flower5 from '@/assets/silhouettes/flower-5.webp'
import { cn } from '@/utils/cn'

const SILHOUETTES = [flower1, flower2, flower3, flower4, flower5] as const
export type SilhouetteVariant = 1 | 2 | 3 | 4 | 5

interface FlowerSilhouetteProps {
  variant: SilhouetteVariant
  className?: string
}

/**
 * 흐릿한 흰색 꽃 실루엣 (900 × 900). 민트 배경 위에 겹쳐 쓴다.
 * 온보딩 시작 화면, 홈 헤더에 사용.
 */
export default function FlowerSilhouette({ variant, className }: FlowerSilhouetteProps) {
  return (
    <img
      src={SILHOUETTES[variant - 1]}
      alt=""
      aria-hidden
      draggable={false}
      className={cn('pointer-events-none size-[900px] max-w-none select-none', className)}
    />
  )
}
