// Minimal storage wrapper for chrome.storage.local
// Using callbacks wrapped in Promises to avoid type deps.
// Note: MV3 provides the global `chrome` runtime.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const chrome: any

export type SavedItem = {
  id: string
  title: string
  url: string
  createdAt: number
}

const KEY = 'items'

export async function getItems(): Promise<SavedItem[]> {
  return new Promise((resolve) => {
    chrome.storage.local.get([KEY], (res: { [KEY]?: SavedItem[] }) => {
      resolve(res[KEY] ?? [])
    })
  })
}

export async function setItems(items: SavedItem[]): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [KEY]: items }, () => resolve())
  })
}

export { KEY as STORAGE_KEY }

