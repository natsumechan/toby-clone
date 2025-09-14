// Background service worker (MV3)
// Handles storage, tab capture, and message routing.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const chrome: any

type SavedItem = {
  id: string
  title: string
  url: string
  createdAt: number
}

const KEY = 'items'

function nanoid() {
  return Math.random().toString(36).slice(2, 10)
}

function tabsQuery(query: unknown): Promise<any[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new Promise((resolve) => chrome.tabs.query(query, (tabs: any[]) => resolve(tabs)))
}

function storageGet(keys: string[]): Promise<Record<string, unknown>> {
  return new Promise((resolve) => chrome.storage.local.get(keys, (res: Record<string, unknown>) => resolve(res)))
}

function storageSet(obj: Record<string, unknown>): Promise<void> {
  return new Promise((resolve) => chrome.storage.local.set(obj, () => resolve()))
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get([KEY], (res: Record<string, unknown>) => {
    if (!res[KEY]) chrome.storage.local.set({ [KEY]: [] })
  })
})

chrome.runtime.onMessage.addListener((message: any, _sender: any, sendResponse: (res?: unknown) => void) => {
  const done = (result?: unknown) => sendResponse(result)

  ;(async () => {
    switch (message?.type) {
      case 'SAVE_CURRENT_TAB': {
        const tabs = await tabsQuery({ active: true, currentWindow: true })
        const tab = tabs?.[0]
        if (!tab || !tab.url) return done({ ok: false })

        const item: SavedItem = {
          id: nanoid(),
          title: tab.title || tab.url,
          url: tab.url,
          createdAt: Date.now(),
        }
        const res = (await storageGet([KEY])) as { [KEY]?: SavedItem[] }
        const items = (res[KEY] ?? []) as SavedItem[]
        items.unshift(item)
        await storageSet({ [KEY]: items.slice(0, 500) })
        done({ ok: true, item })
        break
      }
      case 'GET_OPEN_TABS': {
        const tabs = await tabsQuery({ currentWindow: true })
        const mapped = tabs
          .filter((t) => !!t.url)
          .map((t) => ({
            id: t.id,
            title: t.title || t.url,
            url: t.url,
            favIconUrl: t.favIconUrl || undefined,
            pinned: !!t.pinned,
            active: !!t.active,
          }))
        done({ ok: true, tabs: mapped })
        break
      }
      case 'ACTIVATE_TAB': {
        try {
          // Focus window then activate the tab
          const id = Number(message.id)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          chrome.tabs.get(id, (tab: any) => {
            if (tab?.windowId) {
              chrome.windows.update(tab.windowId, { focused: true }, () => {
                chrome.tabs.update(id, { active: true }, () => done({ ok: true }))
              })
            } else {
              chrome.tabs.update(id, { active: true }, () => done({ ok: true }))
            }
          })
        } catch {
          done({ ok: false })
        }
        break
      }
      case 'GET_ITEMS': {
        const res = (await storageGet([KEY])) as { [KEY]?: SavedItem[] }
        done({ ok: true, items: (res[KEY] ?? []) as SavedItem[] })
        break
      }
      case 'REMOVE_ITEM': {
        const res = (await storageGet([KEY])) as { [KEY]?: SavedItem[] }
        const items = (res[KEY] ?? []) as SavedItem[]
        const next = items.filter((i) => i.id !== message.id)
        await storageSet({ [KEY]: next })
        done({ ok: true })
        break
      }
      case 'CLEAR_ITEMS': {
        await storageSet({ [KEY]: [] })
        done({ ok: true })
        break
      }
      default:
        done({ ok: false, error: 'unknown message' })
    }
  })()

  return true // keep channel open for async response
})

// Notify UI when open tabs change so it can refresh.
function notifyOpenTabsUpdated() {
  try {
    chrome.runtime.sendMessage({ type: 'OPEN_TABS_UPDATED' })
  } catch {
    // ignore
  }
}

// Wire tab change events
// eslint-disable-next-line @typescript-eslint/no-explicit-any
chrome.tabs.onCreated.addListener((_tab: any) => notifyOpenTabsUpdated())
// eslint-disable-next-line @typescript-eslint/no-explicit-any
chrome.tabs.onUpdated.addListener((_id: any, _info: any, _tab: any) => notifyOpenTabsUpdated())
// eslint-disable-next-line @typescript-eslint/no-explicit-any
chrome.tabs.onRemoved.addListener((_id: any, _info: any) => notifyOpenTabsUpdated())
