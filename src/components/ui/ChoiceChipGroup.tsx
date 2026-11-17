import { useId } from 'react'
import type { Option } from '@/types/condition'
import { cn } from '@/utils/cn'

interface ChoiceChipProps {
  label: string
  selected: boolean
  onClick: () => void
}

/** 2열 선택 버튼 하나 (높이 45). 선택되면 민트 배경. */
export function ChoiceChip({ label, selected, onClick }: ChoiceChipProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={cn(
        'flex h-[45px] items-center justify-center rounded-chip px-[10px] text-body transition-colors',
        selected ? 'bg-mint font-semibold text-ink' : 'bg-ink/5 font-medium text-ink/50',
      )}
    >
      {label}
    </button>
  )
}

interface ChoiceChipGroupProps<T> {
  /** 그룹 제목 (예: 이동 가능 거리) */
  title: string
  options: Option<T>[]
  value: T
  onChange: (value: T) => void
  className?: string
}

/**
 * 제목 + 2열 선택 버튼 묶음 (거리 · 시간 · 예산).
 *
 * @example
 * <ChoiceChipGroup title="이동 가능 거리" options={DISTANCE_OPTIONS} value={distance} onChange={setDistance} />
 */
export default function ChoiceChipGroup<T>({
  title,
  options,
  value,
  onChange,
  className,
}: ChoiceChipGroupProps<T>) {
  const titleId = useId()

  return (
    <div className={cn('flex flex-col gap-[15px]', className)}>
      <p id={titleId} className="p-[5px] text-body font-semibold text-ink">
        {title}
      </p>
      <div role="radiogroup" aria-labelledby={titleId} className="grid grid-cols-2 gap-[10px]">
        {options.map((option) => (
          <ChoiceChip
            key={String(option.value)}
            label={option.label}
            selected={option.value === value}
            onClick={() => onChange(option.value)}
          />
        ))}
      </div>
    </div>
  )
}
