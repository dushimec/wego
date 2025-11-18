"use client"

import { useLanguage } from "@/hooks/use-language"
import { useTranslation } from "@/lib/i18n"

interface TProps {
  k: string
  fallback?: string
}

export function T({ k, fallback }: TProps) {
  const { language } = useLanguage()
  const t = useTranslation(language)

  return <>{t(k) || fallback || k}</>
}
