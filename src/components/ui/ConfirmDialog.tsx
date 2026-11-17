import { useId, type ReactNode } from 'react'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'

interface ConfirmDialogProps {
  open: boolean
  title: string
  /** 제목 아래 회색 설명. 줄바꿈은 \n */
  description?: ReactNode
  /** 설명 아래 추가 내용 (미션 정보 카드 등) */
  children?: ReactNode
  /** 왼쪽 회색 버튼 문구. null이면 버튼 하나만 보인다 */
  cancelText?: string | null
  /** 오른쪽 민트 버튼 문구 */
  confirmText?: string
  onCancel?: () => void
  onConfirm: () => void
}

/**
 * 제목 + 설명 + [아니오 / 예] 버튼 팝업.
 * 오늘 쉬기, 나가기, 중단, 위치 동의, 중간 저장, 변경, 삭제 확인에 쓴다.
 *
 * @example
 * <ConfirmDialog
 *   open={open}
 *   title="오늘은 쉬어도 돼요"
 *   description={'오늘 충분한 휴식을 갖고,\n내일은 미션을 도전해봐요!'}
 *   onCancel={() => setOpen(false)}
 *   onConfirm={handleRest}
 * />
 */
export default function ConfirmDialog({
  open,
  title,
  description,
  children,
  cancelText = '아니오',
  confirmText = '예',
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  const titleId = useId()

  return (
    <Modal open={open} onClose={onCancel} labelledBy={titleId}>
      <div className="flex flex-col gap-[10px] p-[5px]">
        <h2 id={titleId} className="p-[5px] text-heading font-semibold text-ink">
          {title}
        </h2>
        {description && (
          <p className="p-[5px] text-body font-medium whitespace-pre-line text-ink/50">
            {description}
          </p>
        )}
      </div>
      {children}
      <div className="flex gap-[10px]">
        {cancelText !== null && (
          <Button variant="secondary" className="flex-1" onClick={onCancel}>
            {cancelText}
          </Button>
        )}
        <Button className="flex-1" onClick={onConfirm}>
          {confirmText}
        </Button>
      </div>
    </Modal>
  )
}
