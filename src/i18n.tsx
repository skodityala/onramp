import React, { createContext, useContext } from 'react';
import { COPIES, EXAMPLES_BY_LOCALE, type Locale } from './copy';

/**
 * Runtime locale for the tree. Views read this via useCopy() / useExamples()
 * rather than importing COPY directly, so switching the selector re-renders
 * everything.
 */
export const LocaleContext = createContext<Locale>('en');

export const useLocale = (): Locale => useContext(LocaleContext);

export const useCopy = () => {
  const loc = useContext(LocaleContext);
  return COPIES[loc] ?? COPIES.en;
};

export const useExamples = (): readonly string[] => {
  const loc = useContext(LocaleContext);
  return EXAMPLES_BY_LOCALE[loc] ?? EXAMPLES_BY_LOCALE.en;
};

export const LocaleProvider: React.FC<{ locale: Locale; children: React.ReactNode }> = ({
  locale, children,
}) => (
  <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
);
