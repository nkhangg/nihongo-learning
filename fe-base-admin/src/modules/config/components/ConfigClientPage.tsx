import { Globe } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ConfigPrefixEditorPage } from './ConfigPrefixEditorPage'

export function ConfigClientPage() {
  const { t } = useTranslation()
  return (
    <ConfigPrefixEditorPage
      prefix="client"
      title={t('config.prefix.clientTitle')}
      description={t('config.prefix.clientDescription')}
      icon={Globe}
    />
  )
}
