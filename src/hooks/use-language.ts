"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Language } from "@/lib/i18n"

interface LanguageStore {
  language: Language
  setLanguage: (language: Language) => void
}

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set) => ({
      language: "en",
      setLanguage: (language: Language) => set({ language }),
    }),
    {
      name: "language-store",
    },
  ),
)

export function useLanguage() {
  const language = useLanguageStore((state) => state.language)
  const setLanguage = useLanguageStore((state) => state.setLanguage)

  return { language, setLanguage }
}

// Explicit named export useLanguage
