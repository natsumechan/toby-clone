import React, { useEffect, useState } from 'react'
import '@ext/styles/tailwind.css'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ErrorBoundary, safeMount } from '@ext/shared/mount'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const chrome: any

type Item = { id: string; title: string; url: string; createdAt: number }

function App() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    chrome.storage.local.get(['items'], (res: { items?: Item[] }) => {
      setCount((res.items ?? []).length)
    })
  }, [])

  function exportJson() {
    chrome.storage.local.get(['items'], (res: { items?: Item[] }) => {
      const blob = new Blob([JSON.stringify(res.items ?? [], null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'toby-export.json'
      a.click()
      URL.revokeObjectURL(url)
    })
  }

  function importJson(ev: React.ChangeEvent<HTMLInputElement>) {
    const file = ev.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result)) as Item[]
        chrome.storage.local.set({ items: data }, () => setCount(data.length))
      } catch {
        // ignore
      }
    }
    reader.readAsText(file)
  }

  return (
    <ErrorBoundary>
      <div className={cn('p-6 space-y-4 max-w-xl')}> 
        <h1 className="text-lg font-semibold">Options</h1>
        <div className="text-sm text-muted-foreground">Saved items: {count}</div>
        <div className="flex items-center gap-3">
          <Button onClick={exportJson}>Export JSON</Button>
          <label className="inline-flex items-center gap-2">
            <span className="text-sm">Import JSON</span>
            <input type="file" accept="application/json" onChange={importJson} />
          </label>
        </div>
      </div>
    </ErrorBoundary>
  )
}
safeMount(<App />)
