import type { ReactNode } from 'react'
import type { Option } from '@/types/condition'
import { cn } from '@/utils/cn'

/** 동그라미 체크 표시 (25 × 25) */
function CheckCircle({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden
      className="flex size-[25px] shrink-0 items-center justify-center rounded-full ring-2 ring-mint/50 ring-inset"
    >
      {checked && <span className="size-[15px] rounded-full bg-mint" />}
    </span>
  )
}

interface OptionItemProps {
  label: string
  checked: boolean
  multiple?: boolean
  onClick: () => void
  /** 원본 피그마 에셋처럼 별도의 선택 표시를 사용하는 화면 */
  indicator?: ReactNode
}

/** 선택지 한 줄. 선택되면 동그라미가 채워지고 글자가 진해진다. */
export function OptionItem({ label, checked, multiple, onClick, indicator }: OptionItemProps) {
  return (
    <button
      type="button"
      role={multiple ? 'checkbox' : 'radio'}
      aria-checked={checked}
      onClick={onClick}
      className="flex w-full items-center gap-[15px] p-[5px] text-left"
    >
      {indicator ?? <CheckCircle checked={checked} />}
      <span
        className={cn('text-body', checked ? 'font-semibold text-ink' : 'font-medium text-ink/50')}
      >
        {label}
      </span>
    </button>
  )
}

interface OptionListProps<T> {
  options: Option<T>[]
  /** 선택한 값. 없으면 null */
  value: T | null
  /** 선택한 항목을 다시 누르면 null(해제)이 넘어온다 */
  onChange: (value: T | null) => void
  className?: string
}

/**
 * 세로 선택지 목록 — 하나만 선택 (기분, 에너지, 미션 후 기분, 상황 변화 등).
 *
 * @example
 * <OptionList options={MOOD_OPTIONS} value={mood} onChange={setMood} />
 */
export default function OptionList<T>({ options, value, onChange, className }: OptionListProps<T>) {
  return (
    <div role="radiogroup" className={cn('flex flex-col gap-[5px] p-[20px]', className)}>
      {options.map((option) => (
        <OptionItem
          key={String(option.value)}
          label={option.label}
          checked={value === option.value}
          onClick={() => onChange(value === option.value ? null : option.value)}
        />
      ))}
    </div>
  )
}

interface MultiOptionListProps<T> {
  options: Option<T>[]
  value: T[]
  onChange: (value: T[]) => void
  className?: string
}

/**
 * 세로 선택지 목록 — 여러 개 선택 (외출 장벽).
 *
 * @example
 * <MultiOptionList options={BARRIER_OPTIONS} value={barriers} onChange={setBarriers} />
 */
export function MultiOptionList<T>({
  options,
  value,
  onChange,
  className,
}: MultiOptionListProps<T>) {
  const toggle = (v: T) =>
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v])

  return (
    <div role="group" className={cn('flex flex-col gap-[5px] p-[20px]', className)}>
      {options.map((option) => (
        <OptionItem
          key={String(option.value)}
          label={option.label}
          checked={value.includes(option.value)}
          multiple
          onClick={() => toggle(option.value)}
        />
      ))}
    </div>
  )
}
