import { useId, useState, type ComponentProps, type PointerEvent } from 'react'
import { ClearIcon, EyeIcon, EyeOffIcon } from '@/components/icons'
import { cn } from '@/utils/cn'

interface TextFieldProps extends Omit<ComponentProps<'input'>, 'value' | 'onChange'> {
  label: string
  value: string
  onChange: (value: string) => void
}

/** 아이콘 버튼을 눌러도 입력창 포커스(모바일 키보드)가 유지되게 한다 */
const keepInputFocus = (e: PointerEvent) => e.preventDefault()

/**
 * 제목 + 입력창. 값이 있으면 오른쪽에 지우기 버튼이 나온다.
 * type="password"면 지우기 버튼 왼쪽에 비밀번호 보기 버튼이 함께 나온다.
 * (가려져 있을 때 눈 → 누르면 보이고 빗금 눈 → 다시 누르면 가려짐)
 *
 * @example
 * <TextField label="아이디" value={id} onChange={setId} placeholder="아이디" />
 * <TextField label="비밀번호" type="password" value={pw} onChange={setPw} />
 */
export default function TextField({
  label,
  value,
  onChange,
  className,
  id,
  type,
  ...inputProps
}: TextFieldProps) {
  const autoId = useId()
  const inputId = id ?? autoId
  const isPassword = type === 'password'
  const [revealed, setRevealed] = useState(false)

  const handleClear = () => {
    onChange('')
    setRevealed(false)
  }

  return (
    <div className={cn('flex flex-col gap-[15px]', className)}>
      <label htmlFor={inputId} className="p-[5px] text-body font-semibold text-ink">
        {label}
      </label>
      <div className="flex items-center gap-[10px] rounded-chip bg-surface p-[15px] focus-within:ring-2 focus-within:ring-mint/50">
        <input
          id={inputId}
          type={isPassword && revealed ? 'text' : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-[24px] min-w-0 flex-1 bg-transparent text-body font-medium text-black outline-none placeholder:text-ink/25"
          {...inputProps}
        />
        {value && (
          <div className="flex shrink-0 items-center gap-[15px]">
            {isPassword && (
              <button
                type="button"
                aria-label={revealed ? `${label} 가리기` : `${label} 보기`}
                aria-pressed={revealed}
                aria-controls={inputId}
                onPointerDown={keepInputFocus}
                onClick={() => setRevealed((v) => !v)}
                className="text-ink/25"
              >
                {revealed ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            )}
            <button
              type="button"
              aria-label={`${label} 지우기`}
              onPointerDown={keepInputFocus}
              onClick={handleClear}
              className="text-ink/25"
            >
              <ClearIcon />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
