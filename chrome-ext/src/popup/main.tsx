import React, { useEffect, useMemo, useState } from 'react'
import '@ext/styles/tailwind.css'
// Reuse UI from Next.js app
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { sendMessage } from '@ext/shared/messaging'
import { ErrorBoundary, safeMount } from '@ext/shared/mount'
import { ExtHeader, ItemCard } from '@ext/shared/ui'

type Item = {
  id: string
  title: string
  url: string
  createdAt: number
}

function App() {
  const [items, setItems] = useState<Item[]>([])
  const [q, setQ] = useState('')
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return items
    return items.filter((i) =>
      (i.title + ' ' + i.url).toLowerCase().includes(s)
    )
  }, [items, q])

  useEffect(() => {
    refresh()
  }, [])

  async function refresh() {
    const res = (await sendMessage<{ ok: boolean; items: Item[] }>(
      { type: 'GET_ITEMS' }
    ))
    if (res?.ok) setItems(res.items)
  }

  async function saveCurrent() {
    const res = await sendMessage<{ ok: boolean }>({ type: 'SAVE_CURRENT_TAB' })
    if (res?.ok) refresh()
  }

  async function remove(id: string) {
    const res = await sendMessage<{ ok: boolean }>({ type: 'REMOVE_ITEM', id })
    if (res?.ok) setItems((prev) => prev.filter((i) => i.id !== id))
  }

  return (
    <ErrorBoundary>
      <div className={cn('p-3 w-[380px] max-w-full')}> 
        <ExtHeader
          title="INBOX"
          right={
            <div className="flex items-center gap-2">
              <Input placeholder="Search saved..." value={q} onChange={(e) => setQ(e.target.value)} />
              <Button onClick={saveCurrent}>Save tab</Button>
            </div>
          }
        />
        <div className="space-y-2 max-h-[60vh] overflow-auto pr-1">
          {filtered.map((i) => (
            <ItemCard
              key={i.id}
              title={i.title}
              url={i.url}
              timestamp={i.createdAt}
              onRemove={() => remove(i.id)}
            />
          ))}
          {!filtered.length && (
            <div className="text-xs text-muted-foreground">No items yet. Use “Save tab”.</div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  )
}
safeMount(<App />)
