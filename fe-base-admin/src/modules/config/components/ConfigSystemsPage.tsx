import { Settings } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ConfigPrefixEditorPage } from './ConfigPrefixEditorPage'

export function ConfigSystemsPage() {
  const { t } = useTranslation()
  return (
    <ConfigPrefixEditorPage
      prefix="system"
      title={t('config.prefix.systemsTitle')}
      description={t('config.prefix.systemsDescription')}
      icon={Settings}
    />
  )
}
