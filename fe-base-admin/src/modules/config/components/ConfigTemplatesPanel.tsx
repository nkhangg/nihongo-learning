import { useState } from 'react'
import { LayoutTemplate, Plus, Sparkles, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@shared/components/ui/button'
import { Card, CardContent } from '@shared/components/ui/card'
import { Badge } from '@shared/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@shared/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@shared/components/ui/tooltip'
import { cn } from '@shared/utils'
import type { ConfigTemplate } from '../templates'

interface ConfigTemplatesPanelProps {
  templates: ConfigTemplate[]
  existingKeys: Set<string>
  onQuickCreate: (template: ConfigTemplate) => void
}

export function ConfigTemplatesPanel({
  templates,
  existingKeys,
  onQuickCreate,
}: ConfigTemplatesPanelProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  if (templates.length === 0) return null

  const missingCount = templates.filter((tpl) => !existingKeys.has(tpl.key)).length

  const handleQuickCreate = (tpl: ConfigTemplate) => {
    onQuickCreate(tpl)
    setOpen(false)
  }

  return (
    <>
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(true)}
              className="relative gap-1.5 shrink-0"
            >
              <LayoutTemplate className="h-3.5 w-3.5" />
              {t('config.templates.button')}
              {missingCount > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-0.5 h-4 min-w-4 rounded-full bg-amber-100 px-1 text-[10px] font-semibold text-amber-700 hover:bg-amber-100"
                >
                  {missingCount}
                </Badge>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            <p className="text-xs">{t('config.templates.tooltip')}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl gap-0 p-0 rounded-2xl">
          <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-4 pr-12">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
              <Sparkles className="h-4 w-4 text-amber-600" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-base font-semibold text-gray-900">
                {t('config.templates.modalTitle')}
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                {t('config.templates.modalDescription')}
              </DialogDescription>
            </div>
          </div>

          <div className="max-h-[60vh] overflow-y-auto px-6 py-5">
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {templates.map((tpl) => {
                const created = existingKeys.has(tpl.key)
                return (
                  <Card
                    key={tpl.key}
                    className={cn(
                      'border-dashed transition-colors',
                      created
                        ? 'border-gray-200 bg-gray-50/60'
                        : 'border-amber-200 bg-amber-50/40',
                    )}
                  >
                    <CardContent className="space-y-3 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-gray-900">
                            {t(tpl.nameI18nKey)}
                          </p>
                          <p className="truncate font-mono text-[10px] text-gray-400">
                            {tpl.key}
                          </p>
                          <p className="mt-0.5 text-xs text-gray-500">
                            {t(tpl.descriptionI18nKey)}
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1">
                          <Badge variant="outline" className="text-[10px] capitalize">
                            {tpl.scope}
                          </Badge>
                          {created && (
                            <Badge
                              variant="secondary"
                              className="gap-1 bg-emerald-50 text-[10px] text-emerald-700 hover:bg-emerald-50"
                            >
                              <Check className="size-3" />
                              {t('config.templates.alreadyCreated')}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant={created ? 'ghost' : 'secondary'}
                        onClick={() => handleQuickCreate(tpl)}
                        disabled={created}
                        className="w-full gap-1.5"
                      >
                        <Plus className="size-3.5" />
                        {t('config.templates.quickCreate')}
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
