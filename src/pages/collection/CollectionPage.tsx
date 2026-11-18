import type { ReactNode } from 'react'
import FlowerIcon from '@/components/ui/FlowerIcon'
import { FLOWERS } from '@/constants/flowers'
import { useCollectionStore } from '@/stores/collectionStore'

/**
 * 04 도감 / 보유 · 미보유 꽃 목록 (/collection)
 * - 보유: 색이 들어간 꽃 + 이름 (얻은 순서)
 * - 미보유: 회색 실루엣, 이름 없음
 */
export default function CollectionPage() {
  const owned = useCollectionStore((s) => s.owned)
  const ownedIds = new Set(owned.map((f) => f.id))
  const unowned = FLOWERS.filter((f) => !ownedIds.has(f.id))

  return (
    <main className="flex flex-1 flex-col pt-[env(safe-area-inset-top)]">
      <header className="page-title flex flex-col gap-[20px] px-[25px] pt-[100px] pb-[25px]">
        <h1 className="text-title font-semibold text-ink">나의 도감</h1>
        <p className="text-body font-medium text-ink/50">미션 달성을 통해 얻은 꽃들이에요</p>
      </header>

      <Section title="보유">
        {owned.length > 0 ? (
          <ul className="grid grid-cols-3 justify-items-center gap-y-[26px] p-[20px]">
            {owned.map(({ id }) => (
              <li key={id} className="flex flex-col items-center gap-[20px]">
                <FlowerIcon id={id} owned />
                <span className="trim-text text-body font-medium text-ink/50">
                  {FLOWERS[id - 1].name}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="p-[5px] text-body font-medium text-ink/25">아직 얻은 꽃이 없어요</p>
        )}
      </Section>

      {unowned.length > 0 && (
        <>
          <div aria-hidden className="h-[15px] shrink-0 bg-divider" />
          <Section title="미보유">
            <ul className="grid grid-cols-3 justify-items-center gap-[26px] p-[20px]">
              {unowned.map(({ id }) => (
                <li key={id}>
                  <FlowerIcon id={id} owned={false} />
                </li>
              ))}
            </ul>
          </Section>
        </>
      )}
    </main>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-[20px] p-[20px]">
      <h2 className="trim-text p-[5px] text-heading font-semibold text-ink">{title}</h2>
      {children}
    </section>
  )
}
