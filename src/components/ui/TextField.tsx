import { useId, type ComponentProps } from 'react'
import { ClearIcon } from '@/components/icons'
import { cn } from '@/utils/cn'

interface TextFieldProps extends Omit<ComponentProps<'input'>, 'value' | 'onChange'> {
  label: string
  value: string
  onChange: (value: string) => void
}

/**
 * 제목 + 입력창. 값이 있으면 오른쪽에 지우기 버튼이 나온다.
 *
 * @example
 * <TextField label="아이디" value={id} onChange={setId} placeholder="아이디" />
 */
export default function TextField({
  label,
  value,
  onChange,
  className,
  id,
  ...inputProps
}: TextFieldProps) {
  const autoId = useId()
  const inputId = id ?? autoId

  return (
    <div className={cn('flex flex-col gap-[15px]', className)}>
      <label htmlFor={inputId} className="p-[5px] text-body font-semibold text-ink">
        {label}
      </label>
      <div className="flex items-center gap-[10px] rounded-chip bg-surface p-[15px] focus-within:ring-2 focus-within:ring-mint/50">
        <input
          id={inputId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-[24px] min-w-0 flex-1 bg-transparent text-body font-medium text-black outline-none placeholder:text-ink/25"
          {...inputProps}
        />
        {value && (
          <button
            type="button"
            aria-label={`${label} 지우기`}
            onClick={() => onChange('')}
            className="shrink-0 text-ink/25"
          >
            <ClearIcon />
          </button>
        )}
      </div>
    </div>
  )
}
