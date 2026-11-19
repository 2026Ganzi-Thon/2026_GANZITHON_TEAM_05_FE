import { useCollectionQuery } from '@/api/queries'
import type { FlowerId } from '@/constants/flowers'
import ApiFeedback from '@/components/ui/ApiFeedback'
import PageTitle from '@/components/layout/PageTitle'
import CollectionView from './CollectionView'
export default function ApiCollectionPage() {
  const query = useCollectionQuery()
  if (query.isPending || query.error)
    return (
      <main className="lt-app lt-reflection">
        <PageTitle
          className="pt-[100px]"
          title="나의 도감"
          description="미션 달성을 통해 얻은 꽃들이에요"
        />
        <ApiFeedback
          loading={query.isPending}
          error={query.error}
          onRetry={() => void query.refetch()}
        />
      </main>
    )
  return (
    <CollectionView
      flowers={[...query.data.flowers]
        .sort((a, b) => a.flowerNumber - b.flowerNumber)
        .map((flower) => ({
          id: flower.flowerNumber as FlowerId,
          name: flower.name,
          owned: flower.owned,
        }))}
    />
  )
}
