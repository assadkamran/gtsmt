import { getSettings } from '@/lib/cms'
import { HeaderNav } from './HeaderNav'
import { SearchDialog } from './search/SearchDialog'

export async function SiteHeader() {
  const s = await getSettings()
  const contact = [s?.email, s?.phone].filter(Boolean).join('  ·  ')
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-control focus:bg-white focus:px-4 focus:py-2 focus:font-semibold focus:text-dark-900">Skip to content</a>
      <div className="bg-dark-900 text-[0.8125rem] text-on-dark-muted">
        <div className="mx-auto flex max-w-page items-center justify-between gap-4 px-6 py-2 lg:px-10">
          <span className="truncate">{contact || 'Equipment, feeders, spare parts and complete SMT lines, quoted to your specification.'}</span>
          <span className="hidden shrink-0 sm:inline">English</span>
        </div>
      </div>
      <header className="sticky top-0 z-50 border-b border-line bg-white">
        <HeaderNav />
      </header>
      <SearchDialog />
    </>
  )
}
