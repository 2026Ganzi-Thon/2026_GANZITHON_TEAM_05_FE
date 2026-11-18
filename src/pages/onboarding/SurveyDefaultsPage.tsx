import { useNavigate } from 'react-router'
import PageTitle from '@/components/layout/PageTitle'
import Screen from '@/components/layout/Screen'
import Button from '@/components/ui/Button'
import InfoTable from '@/components/ui/InfoTable'
import { toConditionRows } from '@/constants/options'
import { PATHS } from '@/constants/paths'
import { toConditions, useOnboardingDraftStore } from '@/stores/onboardingDraftStore'
import { useUserDefaultsStore } from '@/stores/userDefaultsStore'

/**
 * 00 온보딩 / 기본값 설정 안내 (/onboarding/defaults)
 * 설문에서 고른 값(안 고른 항목은 기본값)을 보여주고, "시작하기"를 누르면 저장 후 홈으로 간다.
 */
export default function SurveyDefaultsPage() {
  const navigate = useNavigate()
  const draft = useOnboardingDraftStore()
  const setDefaults = useUserDefaultsStore((s) => s.setDefaults)

  const conditions = toConditions(draft)

  const handleStart = () => {
    setDefaults(conditions)
    draft.reset()
    navigate(PATHS.HOME, { replace: true })
  }

  return (
    <Screen bottom={<Button onClick={handleStart}>시작하기</Button>}>
      <PageTitle
        title={'입력하지 않아도\n미션을 추천받을 수 있어요'}
        description="기본값이 설정되었어요"
      />
      <div className="flex flex-col gap-[25px] p-[20px]">
        <InfoTable rows={toConditionRows(conditions)} />
        <p className="p-[5px] text-caption font-medium text-ink/25">
          기본값은 추후 변경할 수 없어요
        </p>
      </div>
    </Screen>
  )
}
