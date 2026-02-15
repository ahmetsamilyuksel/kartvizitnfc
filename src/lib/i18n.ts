import ru from "@/messages/ru.json";
import tr from "@/messages/tr.json";
import en from "@/messages/en.json";

export const locales = ["ru", "tr", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "ru";

const messages = { ru, tr, en } as const;

export function getMessages(locale: string) {
  if (locale in messages) {
    return messages[locale as Locale];
  }
  return messages[defaultLocale];
}

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}
