import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import PageTitle from '@/components/layout/PageTitle'
import Screen from '@/components/layout/Screen'
import Button from '@/components/ui/Button'
import TextField from '@/components/ui/TextField'
import FieldMessage from '@/pages/onboarding/components/FieldMessage'
import { surveyPath } from '@/constants/paths'
import { useAuthStore } from '@/stores/authStore'
import { useOnboardingDraftStore } from '@/stores/onboardingDraftStore'
import { useUserDefaultsStore } from '@/stores/userDefaultsStore'
import { isApiEnabled } from '@/api/config'
import { authApi } from '@/api/endpoints'
import { apiErrorMessage } from '@/api/errors'

const FORM_ID = 'signup-form'

/** 00 인증 / 회원가입 → 기본값 설문 01 */
export default function SignupPage() {
  const navigate = useNavigate()
  const signup = useAuthStore((s) => s.signup)
  const resetDraft = useOnboardingDraftStore((s) => s.reset)

  const [id, setId] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [idTaken, setIdTaken] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  const isMismatch = passwordConfirm !== '' && password !== passwordConfirm
  const canSubmit =
    id.trim() !== '' &&
    password !== '' &&
    password === passwordConfirm &&
    (!isApiEnabled ||
      (/^[A-Za-z0-9_]{3,80}$/.test(id.trim()) && password.length >= 8 && password.length <= 128))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!canSubmit || pending) return
    setError('')
    setPending(true)
    try {
      if (isApiEnabled) {
        const response = await authApi.signup(id.trim(), password, passwordConfirm)
        useAuthStore.getState().setSession(response, false)
      } else if (!signup(id.trim(), password)) {
        setIdTaken(true)
        return
      }
      resetDraft()
      useUserDefaultsStore.getState().reset()
      navigate(surveyPath(1), { replace: true })
    } catch (error) {
      setError(apiErrorMessage(error))
    } finally {
      setPending(false)
    }
  }

  return (
    <Screen
      bottom={
        <Button type="submit" form={FORM_ID} disabled={!canSubmit || pending}>
          {pending ? '가입하는 중이에요' : '다음'}
        </Button>
      }
    >
      <PageTitle title="회원가입" />
      {isApiEnabled && (
        <p className="px-[25px] text-caption text-ink/50">
          아이디는 영문·숫자·밑줄 3~80자, 비밀번호는 8~128자로 입력해 주세요.
        </p>
      )}
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
            setIdTaken(false)
          }}
          placeholder="아이디"
          autoComplete="username"
          autoCapitalize="none"
          maxLength={80}
        />
        {idTaken && <FieldMessage>이미 사용 중인 아이디예요</FieldMessage>}
        <TextField
          label="비밀번호"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="000000"
          autoComplete="new-password"
          maxLength={128}
        />
        <TextField
          label="비밀번호 확인"
          type="password"
          value={passwordConfirm}
          onChange={setPasswordConfirm}
          placeholder="000000"
          autoComplete="new-password"
          maxLength={128}
        />
        {isMismatch && <FieldMessage>비밀번호가 서로 달라요</FieldMessage>}
        {error && <FieldMessage>{error}</FieldMessage>}
      </form>
    </Screen>
  )
}
