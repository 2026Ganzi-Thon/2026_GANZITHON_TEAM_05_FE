import { useNavigate } from 'react-router'
import PageTitle from '@/components/layout/PageTitle'
import Screen from '@/components/layout/Screen'
import Button from '@/components/ui/Button'
import InfoTable from '@/components/ui/InfoTable'
import { toConditionRows } from '@/constants/options'
import { PATHS } from '@/constants/paths'
import { toConditions, useOnboardingDraftStore } from '@/stores/onboardingDraftStore'
import { useUserDefaultsStore } from '@/stores/userDefaultsStore'
import { useState } from 'react'
import { isApiEnabled } from '@/api/config'
import { defaultsApi } from '@/api/endpoints'
import { fromApiDefaults, toApiDefaults } from '@/api/presentation'
import { useAuthStore } from '@/stores/authStore'
import FieldMessage from './components/FieldMessage'
import { apiErrorMessage } from '@/api/errors'

/**
 * 00 온보딩 / 기본값 설정 안내 (/onboarding/defaults)
 * 설문에서 고른 값(안 고른 항목은 기본값)을 보여주고, "시작하기"를 누르면 저장 후 홈으로 간다.
 */
export default function SurveyDefaultsPage() {
  const navigate = useNavigate()
  const draft = useOnboardingDraftStore()
  const setDefaults = useUserDefaultsStore((s) => s.setDefaults)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  const conditions = toConditions(draft)

  const handleStart = async () => {
    if (pending) return
    setPending(true)
    setError('')
    try {
      if (isApiEnabled) {
        const response = await defaultsApi.save(toApiDefaults(conditions))
        if (!response.onboardingCompleted)
          throw new Error('기본값 설정을 완료하지 못했어요. 다시 시도해 주세요.')
        setDefaults(fromApiDefaults(response))
        useAuthStore.getState().completeOnboarding(true)
      } else setDefaults(conditions)
      draft.reset()
      navigate(PATHS.HOME, { replace: true })
    } catch (error) {
      setError(apiErrorMessage(error))
    } finally {
      setPending(false)
    }
  }

  return (
    <Screen
      bottom={
        <Button disabled={pending} onClick={handleStart}>
          {pending ? '저장하는 중이에요' : '시작하기'}
        </Button>
      }
    >
      <PageTitle
        title={'입력하지 않아도\n미션을 추천받을 수 있어요'}
        description="기본값이 설정되었어요"
      />
      <div className="flex flex-col gap-[25px] p-[20px]">
        <InfoTable rows={toConditionRows(conditions)} />
        {error && <FieldMessage>{error}</FieldMessage>}
        <p className="p-[5px] text-caption font-medium text-ink/25">
          외출할 때 건너뛴 항목은 언제나 이 기본값을 사용해요.
        </p>
      </div>
    </Screen>
  )
}
