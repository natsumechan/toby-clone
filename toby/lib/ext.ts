// Tiny helpers to talk to Chrome extension APIs when available.
// These are safe no-ops in a normal web environment.

export function isExtensionEnv(): boolean {
  if (typeof window === 'undefined') return false
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any
  return !!w.chrome?.runtime?.id
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function sendExtMessage<T = unknown>(message: any): Promise<T | null> {
  if (!isExtensionEnv()) return Promise.resolve(null)
  return new Promise((resolve) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any
    try {
      w.chrome.runtime.sendMessage(message, (response: T) => resolve(response))
    } catch {
      resolve(null)
    }
  })
}

// Subscribe to extension runtime messages. Returns an unsubscribe function.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function onExtMessage(handler: (msg: any) => void): () => void {
  if (!isExtensionEnv()) return () => {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any
  const listener = (msg: unknown) => handler(msg)
  try {
    w.chrome.runtime.onMessage.addListener(listener)
  } catch {
    // ignore
  }
  return () => {
    try {
      w.chrome.runtime.onMessage.removeListener(listener)
    } catch {
      // ignore
    }
  }
}

