import React from 'react'
import { createRoot } from 'react-dom/client'

export function safeMount(node: React.ReactElement, containerId = 'root') {
  function mount() {
    let el = document.getElementById(containerId)
    if (!el) {
      el = document.createElement('div')
      el.id = containerId
      document.body.appendChild(el)
    }
    const root = createRoot(el)
    root.render(node)
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount, { once: true })
  } else {
    mount()
  }
}

export class ErrorBoundary extends React.Component<{ fallback?: React.ReactNode }, { hasError: boolean; message?: string }> {
  constructor(props: { fallback?: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError(err: unknown) {
    return { hasError: true, message: String(err) }
  }
  componentDidCatch(error: unknown, info: unknown) {
    // eslint-disable-next-line no-console
    console.error('Extension UI error:', error, info)
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div style={{ padding: 12, fontSize: 12 }}>
          UIでエラーが発生しました。拡張機能の検証コンソールを確認してください。
          <div style={{ marginTop: 8, opacity: 0.7 }}>{this.state.message}</div>
        </div>
      )
    }
    return this.props.children as React.ReactElement
  }
}

