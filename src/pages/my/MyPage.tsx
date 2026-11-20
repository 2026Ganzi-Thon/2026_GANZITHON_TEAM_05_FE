import { useState, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { BackIcon } from '@/components/icons'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { DEFAULT_CONDITIONS } from '@/constants/options'
import { PATHS, myDefaultsPath } from '@/constants/paths'
import { useAuthStore } from '@/stores/authStore'
import { useOnboardingDraftStore } from '@/stores/onboardingDraftStore'
import { useUserDefaultsStore } from '@/stores/userDefaultsStore'

/** 마이페이지: 계정 정보 · 평소 외출 설정 변경 · 로그아웃 */
export default function MyPage() {
  const navigate = useNavigate()
  const saved = (useLocation().state as { saved?: boolean } | null)?.saved
  const username = useAuthStore((s) => s.username ?? s.userId)
  const [logoutOpen, setLogoutOpen] = useState(false)

  const editDefaults = () => {
    // 지금 평소 설정이 선택된 상태로 설문을 다시 연다.
    const defaults = useUserDefaultsStore.getState().defaults ?? DEFAULT_CONDITIONS
    useOnboardingDraftStore.setState(structuredClone(defaults))
    navigate(myDefaultsPath(1))
  }
  const logout = () => {
    useAuthStore.getState().logout()
    navigate(PATHS.ONBOARDING, { replace: true })
  }

  return (
    <main className="flex flex-1 flex-col pt-[env(safe-area-inset-top)]">
      <header className="page-title px-[25px] pt-[100px] pb-[25px]">
        <h1 className="text-title font-semibold text-ink">마이</h1>
      </header>
      <Section title="계정 정보">
        <div className="flex items-center justify-between rounded-card bg-surface p-[25px] text-body font-medium">
          <span className="text-ink/50">아이디</span>
          <span className="text-ink/75">{username ?? '-'}</span>
        </div>
      </Section>
      <Section title="외출 설정">
        <button
          type="button"
          onClick={editDefaults}
          className="flex items-center justify-between rounded-card bg-surface p-[25px] text-left text-body font-medium text-ink transition-[filter] active:brightness-95"
        >
          <span>평소 외출 설정 변경</span>
          <BackIcon width={7} height={12} className="rotate-180 text-ink/25" />
        </button>
        <p
          role={saved ? 'status' : undefined}
          className="px-[5px] text-caption font-medium text-ink/25"
        >
          {saved
            ? '평소 외출 설정을 저장했어요'
            : '외출할 때 건너뛴 항목은 이 설정을 기준으로 추천해 드려요'}
        </p>
      </Section>
      <div className="flex justify-center p-[20px]">
        <button
          type="button"
          onClick={() => setLogoutOpen(true)}
          className="p-[10px] text-body font-medium text-ink/50 underline underline-offset-4"
        >
          로그아웃
        </button>
      </div>
      <ConfirmDialog
        open={logoutOpen}
        title="로그아웃할까요?"
        description="다시 이용하려면 로그인해야 해요"
        cancelText="취소"
        confirmText="로그아웃"
        onCancel={() => setLogoutOpen(false)}
        onConfirm={logout}
      />
    </main>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-[15px] px-[20px] pb-[25px]">
      <h2 className="trim-text p-[5px] text-heading font-semibold text-ink">{title}</h2>
      {children}
    </section>
  )
}
