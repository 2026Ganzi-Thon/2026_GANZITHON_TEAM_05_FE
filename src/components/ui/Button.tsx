import type { ComponentProps } from 'react'
import { cn } from '@/utils/cn'

type ButtonVariant = 'primary' | 'secondary' | 'text'

interface ButtonProps extends ComponentProps<'button'> {
  /**
   * - primary: 민트 배경 (다음, 예, 시작하기)
   * - secondary: 회색 배경 (건너뛰기, 아니오)
   * - text: 배경 없는 글자 버튼 (이미 사용해봤어요)
   */
  variant?: ButtonVariant
}

const variantClass: Record<ButtonVariant, string> = {
  primary: 'h-[50px] rounded-button bg-mint text-ink',
  secondary: 'h-[50px] rounded-button bg-ink/5 text-ink/50',
  text: 'h-[30px] rounded-button text-ink/50',
}

/** 공통 버튼. 기본 너비는 100%이고, 비활성 상태는 회색으로 보인다. */
export default function Button({
  variant = 'primary',
  className,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'flex w-full items-center justify-center px-[25px] text-body font-semibold transition-[filter,background-color] active:brightness-95',
        variantClass[variant],
        'disabled:cursor-not-allowed disabled:bg-ink/5 disabled:text-ink/25 disabled:active:brightness-100',
        variant === 'text' && 'disabled:bg-transparent',
        className,
      )}
      {...props}
    />
  )
}
