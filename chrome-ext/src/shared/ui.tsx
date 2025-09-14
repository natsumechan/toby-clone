import React from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function ExtHeader({
  title,
  right,
  className,
}: { title: string; right?: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-center justify-between mb-3', className)}>
      <h1 className="text-base font-semibold tracking-tight">{title}</h1>
      <div className="flex items-center gap-2">{right}</div>
    </div>
  )
}

export function Sidebar({ children }: { children: React.ReactNode }) {
  return (
    <Card className="p-3">
      <CardContent className="p-0 space-y-3">{children}</CardContent>
    </Card>
  )
}

export function SidebarSection({
  title,
  children,
}: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
        {title}
      </div>
      <div className="space-y-1">{children}</div>
    </section>
  )
}

export function SidebarItem({
  active,
  children,
  onClick,
}: { active?: boolean; children: React.ReactNode; onClick?: () => void }) {
  return (
    <Button
      variant={active ? 'secondary' : 'ghost'}
      className={cn('w-full justify-between h-8 px-2 text-sm')}
      onClick={onClick}
    >
      {children}
    </Button>
  )
}

export function ItemCard({
  title,
  url,
  timestamp,
  onRemove,
}: {
  title: string
  url: string
  timestamp?: number
  onRemove?: () => void
}) {
  return (
    <Card className="hover:bg-accent/40 transition">
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <a
              className="text-sm font-medium truncate hover:underline"
              href={url}
              target="_blank"
              rel="noreferrer"
              title={title}
            >
              {title}
            </a>
            <div className="text-xs text-muted-foreground truncate">{url}</div>
            {timestamp ? (
              <div className="text-[11px] text-muted-foreground mt-1">
                {new Date(timestamp).toLocaleString()}
              </div>
            ) : null}
          </div>
          {onRemove ? (
            <Button size="sm" variant="ghost" onClick={onRemove} className="shrink-0">
              Remove
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}

