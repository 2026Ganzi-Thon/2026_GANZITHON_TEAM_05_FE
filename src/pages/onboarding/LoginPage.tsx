import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import PageTitle from '@/components/layout/PageTitle'
import Screen from '@/components/layout/Screen'
import Button from '@/components/ui/Button'
import TextField from '@/components/ui/TextField'
import { PATHS } from '@/constants/paths'
import FieldMessage from '@/pages/onboarding/components/FieldMessage'
import { useAuthStore } from '@/stores/authStore'
import { useUserDefaultsStore } from '@/stores/userDefaultsStore'
import { MOCK_USER_DEFAULTS } from '@/mocks/data'

const FORM_ID = 'login-form'

/** 00 인증 / 목업 로그인 → 홈 */
export default function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)

  const [id, setId] = useState('')
  const [password, setPassword] = useState('')
  const [failed, setFailed] = useState(false)

  const canSubmit = id.trim() !== '' && password !== ''

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    if (!login(id.trim(), password)) {
      setFailed(true)
      return
    }
    useUserDefaultsStore.getState().setDefaults(MOCK_USER_DEFAULTS)
    navigate(PATHS.HOME, { replace: true })
  }

  return (
    <Screen
      bottom={
        <Button type="submit" form={FORM_ID} disabled={!canSubmit}>
          시작하기
        </Button>
      }
    >
      <PageTitle title="로그인" />
      <form
        id={FORM_ID}
        onSubmit={handleSubmit}
        className="flex flex-col gap-[25px] p-[20px]"
        noValidate
      >
        <TextField
          label="아이디"
          value={id}
          onChange={(v) => {
            setId(v)
            setFailed(false)
          }}
          placeholder="아이디"
          autoComplete="username"
          autoCapitalize="none"
        />
        <TextField
          label="비밀번호"
          type="password"
          value={password}
          onChange={(v) => {
            setPassword(v)
            setFailed(false)
          }}
          placeholder="000000"
          autoComplete="current-password"
        />
        {failed && <FieldMessage>아이디 또는 비밀번호를 다시 확인해 주세요</FieldMessage>}
      </form>
    </Screen>
  )
}
