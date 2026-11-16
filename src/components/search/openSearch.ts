/** Ask the header search dialog to open. Safe to call from any client component. */
export const openSearch = () => {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('gt:open-search'))
}
