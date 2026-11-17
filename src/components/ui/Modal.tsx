import { AnimatePresence, motion } from 'motion/react'
import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/utils/cn'

interface ModalProps {
  open: boolean
  /** 딤 영역 클릭 · Esc로 닫을 때 호출 */
  onClose?: () => void
  /** 딤 영역을 눌러 닫을 수 있는지 (기본 false) */
  closeOnDimClick?: boolean
  children: ReactNode
  className?: string
  /** 스크린리더용 제목 id (aria-labelledby) */
  labelledBy?: string
}

/**
 * 화면 위에 뜨는 팝업의 바탕. 내용은 children으로 넣는다.
 * 보통은 ConfirmDialog를 쓰고, 모양이 다른 팝업(꽃 획득 등)만 직접 쓴다.
 */
export default function Modal({
  open,
  onClose,
  closeOnDimClick = false,
  children,
  className,
  labelledBy,
}: ModalProps) {
  // 팝업이 열려 있는 동안 뒤 화면 스크롤 막기 + Esc로 닫기
  useEffect(() => {
    if (!open) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="dim"
          className="fixed inset-y-0 left-1/2 z-50 flex w-full max-w-app -translate-x-1/2 items-center justify-center bg-dim px-[20px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={closeOnDimClick ? onClose : undefined}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            className={cn(
              'flex w-full max-w-[362px] flex-col gap-[15px] rounded-popup bg-white p-[15px]',
              className,
            )}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
