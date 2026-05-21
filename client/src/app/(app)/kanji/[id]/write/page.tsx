import { KanjiWritingPage } from '@modules/kanji'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function Page({ params }: PageProps) {
  const { id } = await params
  return <KanjiWritingPage id={id} />
}
