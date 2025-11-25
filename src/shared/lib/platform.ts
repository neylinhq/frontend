export const isMac =
  typeof window !== 'undefined' ? navigator.platform.toUpperCase().indexOf('MAC') >= 0 : false

export function getShortcut(shortcut?: { mac: string; win: string }) {
  if (!shortcut) return null
  return isMac ? shortcut.mac : shortcut.win
}
