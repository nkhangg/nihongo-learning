import { KanjiDetailPage } from '@modules/kanji'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function Page({ params }: PageProps) {
  const { id } = await params
  return <KanjiDetailPage id={id} />
}
