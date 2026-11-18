import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, type ReactNode } from 'react'
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
  describedBy?: string
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
  describedBy,
}: ModalProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  // 팝업이 열려 있는 동안 뒤 화면 스크롤 막기 + Esc로 닫기
  useEffect(() => {
    if (!open) return
    const prevOverflow = document.body.style.overflow
    const previousFocus =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
    document.body.style.overflow = 'hidden'
    const focusable = () =>
      Array.from(
        contentRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex="0"]',
        ) ?? [],
      ).filter((element) => element.getClientRects().length > 0)
    const frame = requestAnimationFrame(() => (focusable()[0] ?? contentRef.current)?.focus())
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose?.()
      if (e.key !== 'Tab') return
      const elements = focusable()
      const first = elements[0]
      const last = elements.at(-1)
      if (!first || !last) {
        e.preventDefault()
        contentRef.current?.focus()
        return
      }
      if (
        e.shiftKey &&
        (document.activeElement === first || !contentRef.current?.contains(document.activeElement))
      ) {
        e.preventDefault()
        last.focus()
      } else if (
        !e.shiftKey &&
        (document.activeElement === last || !contentRef.current?.contains(document.activeElement))
      ) {
        e.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = prevOverflow
      cancelAnimationFrame(frame)
      window.removeEventListener('keydown', onKeyDown)
      previousFocus?.focus()
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
            ref={contentRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            aria-describedby={describedBy}
            className={cn(
              'flex max-h-[calc(100dvh-40px)] w-full max-w-[362px] flex-col gap-[15px] overflow-y-auto overscroll-contain rounded-popup bg-white p-[15px]',
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
