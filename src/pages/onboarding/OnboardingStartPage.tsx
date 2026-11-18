import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import Screen from '@/components/layout/Screen'
import Button from '@/components/ui/Button'
import FlowerSilhouette, { type SilhouetteVariant } from '@/components/ui/FlowerSilhouette'
import { PATHS } from '@/constants/paths'

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
          <Button variant="text" onClick={() => navigate(PATHS.LOGIN)}>
            이미 사용해봤어요
          </Button>
        </>
      }
    >
      {/* 민트 그라데이션 배경 */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[700px] bg-linear-to-b from-mint to-mint/0"
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
