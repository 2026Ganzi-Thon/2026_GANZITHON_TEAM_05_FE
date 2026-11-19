import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import Screen from '@/components/layout/Screen'
import Button from '@/components/ui/Button'
import FlowerSilhouette, { type SilhouetteVariant } from '@/components/ui/FlowerSilhouette'
import { PATHS } from '@/constants/paths'
import background from '@/assets/silhouettes/background.svg'

/** 꽃 실루엣이 바뀌는 간격 (ms) */
const CYCLE_MS = 3000

/** 00 온보딩 / 시작 */
export default function OnboardingStartPage() {
  const navigate = useNavigate()
  const [variant, setVariant] = useState<SilhouetteVariant>(1)

  // 꽃 실루엣 5종을 차례로 바꿔 보여준다
  useEffect(() => {
    const timer = setInterval(() => {
      setVariant((v) => ((v % 5) + 1) as SilhouetteVariant)
    }, CYCLE_MS)
    return () => clearInterval(timer)
  }, [])

  return (
    <Screen
      className="relative overflow-hidden"
      bottomClassName="pb-[max(30px,env(safe-area-inset-bottom))]"
      bottom={
        <>
          <Button onClick={() => navigate(PATHS.SIGNUP)}>Letit 시작하기</Button>
          <p className="flex h-[30px] items-center justify-center gap-[6px] text-body text-ink/50">
            이미 계정이 있으신가요?
            <button
              type="button"
              onClick={() => navigate(PATHS.LOGIN)}
              className="-my-[10px] py-[10px] font-semibold text-ink underline underline-offset-4 active:opacity-60"
            >
              로그인
            </button>
          </p>
        </>
      }
    >
      {/* 민트 그라데이션 배경 */}
      <img
        src={background}
        alt=""
        aria-hidden
        className="pointer-events-none absolute top-0 left-1/2 max-w-none -translate-x-1/2"
      />

      {/* 꽃 실루엣 (교차 페이드) */}
      <AnimatePresence initial={false}>
        <motion.div
          key={variant}
          className="absolute top-0 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
        >
          <FlowerSilhouette variant={variant} />
        </motion.div>
      </AnimatePresence>

      <h1 className="sr-only">Letit 레딧</h1>
    </Screen>
  )
}
