// Message contracts for popup/sidepanel <-> background

export type Message =
  | { type: 'SAVE_CURRENT_TAB' }
  | { type: 'GET_ITEMS' }
  | { type: 'REMOVE_ITEM'; id: string }
  | { type: 'CLEAR_ITEMS' }
  | { type: 'GET_OPEN_TABS' }
  | { type: 'OPEN_TABS_UPDATED' }
  | { type: 'ACTIVATE_TAB'; id: number }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const chrome: any

export function sendMessage<T = unknown>(message: Message): Promise<T> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(message, (response: T) => resolve(response))
  })
}
