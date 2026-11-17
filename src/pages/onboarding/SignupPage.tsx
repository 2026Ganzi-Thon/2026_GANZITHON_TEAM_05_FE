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

  const isMismatch = passwordConfirm !== '' && password !== passwordConfirm
  const canSubmit = id.trim() !== '' && password !== '' && password === passwordConfirm

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    if (!signup(id.trim(), password)) {
      setIdTaken(true)
      return
    }
    resetDraft()
    navigate(surveyPath(1), { replace: true })
  }

  return (
    <Screen
      bottom={
        <Button type="submit" form={FORM_ID} disabled={!canSubmit}>
          다음
        </Button>
      }
    >
      <PageTitle title="회원가입" />
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
        />
        {idTaken && <FieldMessage>이미 사용 중인 아이디예요</FieldMessage>}
        <TextField
          label="비밀번호"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="000000"
          autoComplete="new-password"
        />
        <TextField
          label="비밀번호 확인"
          type="password"
          value={passwordConfirm}
          onChange={setPasswordConfirm}
          placeholder="000000"
          autoComplete="new-password"
        />
        {isMismatch && <FieldMessage>비밀번호가 서로 달라요</FieldMessage>}
      </form>
    </Screen>
  )
}
