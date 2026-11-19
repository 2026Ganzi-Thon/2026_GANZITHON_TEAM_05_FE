import { FLOWERS } from '@/constants/flowers'
import { useCollectionStore } from '@/stores/collectionStore'
import { isApiEnabled } from '@/api/config'
import ApiCollectionPage from './ApiCollectionPage'
import CollectionView from './CollectionView'
export default function CollectionPage() {
  const owned = useCollectionStore((state) => state.owned)
  if (isApiEnabled) return <ApiCollectionPage />
  const ownedIds = new Set(owned.map((flower) => flower.id))
  return (
    <CollectionView
      flowers={[
        ...owned.map(({ id }) => ({ id, name: FLOWERS[id - 1].name, owned: true })),
        ...FLOWERS.filter((flower) => !ownedIds.has(flower.id)).map((flower) => ({
          id: flower.id,
          name: flower.name,
          owned: false,
        })),
      ]}
    />
  )
}
