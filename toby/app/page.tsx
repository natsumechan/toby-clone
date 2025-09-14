"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Plus,
  Star,
  StarOff,
  Trash2,
  ExternalLink,
  Edit,
  GripVertical,
  MoreHorizontal,
  Globe,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { isExtensionEnv, onExtMessage, sendExtMessage } from "@/lib/ext"

interface Tab {
  id: string
  title: string
  url: string
  favicon: string
  collection: string
  created: Date
  order: number
  thumbnail?: string
}

type OpenTab = {
  id: number
  title: string
  url: string
  favicon?: string
}

interface Collection {
  id: string
  name: string
  starred: boolean
  expanded: boolean
  order: number
}

export default function TobyDashboard() {
  const [tabs, setTabs] = useState<Tab[]>([])
  const [collections, setCollections] = useState<Collection[]>([])
  const [selectedTabs, setSelectedTabs] = useState<string[]>([])
  const [draggedTab, setDraggedTab] = useState<string | null>(null)
  const [draggedOpenTab, setDraggedOpenTab] = useState<number | null>(null)
  const [draggedCollection, setDraggedCollection] = useState<string | null>(null)
  const [dragOverCollection, setDragOverCollection] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [openTabs, setOpenTabs] = useState<OpenTab[]>([
    // Web環境用のダミーデータ（拡張機能では実タブで上書きされます）
    { id: 1, title: "GitHub - vercel/next.js", url: "https://github.com/vercel/next.js", favicon: "🐙" },
    { id: 2, title: "React Documentation", url: "https://react.dev", favicon: "⚛️" },
    { id: 3, title: "Tailwind CSS", url: "https://tailwindcss.com", favicon: "🎨" },
    { id: 4, title: "TypeScript Handbook", url: "https://typescriptlang.org", favicon: "📘" },
    { id: 5, title: "MDN Web Docs", url: "https://developer.mozilla.org", favicon: "📚" },
  ])

  // 拡張機能が有効な場合、実ブラウザのタブ一覧に同期
  useEffect(() => {
    if (!isExtensionEnv()) return

    async function refreshOpenTabs() {
      const res = (await sendExtMessage<{ ok: boolean; tabs: Array<{ id: number; title?: string; url?: string; favIconUrl?: string; active?: boolean; pinned?: boolean }> }>(
        { type: "GET_OPEN_TABS" },
      ))
      if (res && res.ok) {
        const mapped: OpenTab[] = res.tabs
          .filter((t) => !!t.url)
          .map((t) => ({ id: t.id, title: t.title || t.url!, url: t.url!, favicon: t.favIconUrl }))
        setOpenTabs(mapped)
      }
    }

    // 初回取得
    refreshOpenTabs()

    // 変更通知を受けたら再取得
    const off = onExtMessage((msg) => {
      if ((msg as { type?: string })?.type === "OPEN_TABS_UPDATED") {
        refreshOpenTabs()
      }
    })
    return off
  }, [])

  useEffect(() => {
    const savedTabs = localStorage.getItem("toby-tabs")
    const savedCollections = localStorage.getItem("toby-collections")

    if (savedTabs) {
      const parsedTabs = JSON.parse(savedTabs)
      setTabs(
        parsedTabs.map((tab: any) => ({
          ...tab,
          created: new Date(tab.created),
          order: tab.order || 0,
        })),
      )
    } else {
      // Initial mock data
      const mockTabs: Tab[] = [
        {
          id: "1",
          title: "Claude",
          url: "https://claude.ai",
          favicon: "🤖",
          collection: "INBOX",
          created: new Date("2024-01-15"),
          order: 0,
          thumbnail: "/claude-ai-chat-interface.jpg",
        },
        {
          id: "2",
          title: "Google Gemini",
          url: "https://gemini.google.com",
          favicon: "💎",
          collection: "INBOX",
          created: new Date("2024-01-14"),
          order: 1,
          thumbnail: "/google-gemini-ai-interface.jpg",
        },
        {
          id: "3",
          title: "ChatGPT",
          url: "https://chat.openai.com",
          favicon: "💬",
          collection: "INBOX",
          created: new Date("2024-01-13"),
          order: 2,
          thumbnail: "/chatgpt-conversation-interface.jpg",
        },
        {
          id: "4",
          title: "Mona chat site - v0 by Vercel",
          url: "https://v0.dev",
          favicon: "🔷",
          collection: "INBOX",
          created: new Date("2024-01-12"),
          order: 3,
          thumbnail: "/v0-by-vercel-development-interface.jpg",
        },
        {
          id: "5",
          title: "claudeのアーティファクト機能の使い方",
          url: "https://example.com/claude-artifacts",
          favicon: "📄",
          collection: "INBOX",
          created: new Date("2024-01-11"),
          order: 4,
          thumbnail: "/claude-artifacts-tutorial-page.jpg",
        },
        {
          id: "6",
          title: "NotebookLM",
          url: "https://notebooklm.google.com",
          favicon: "📓",
          collection: "INBOX",
          created: new Date("2024-01-10"),
          order: 5,
          thumbnail: "/google-notebooklm-interface.jpg",
        },
      ]
      setTabs(mockTabs)
    }

    if (savedCollections) {
      const parsedCollections = JSON.parse(savedCollections)
      setCollections(
        parsedCollections.map((collection: any, index: number) => ({
          ...collection,
          order: collection.order !== undefined ? collection.order : index,
        })),
      )
    } else {
      setCollections([
        { id: "inbox", name: "INBOX", starred: false, expanded: true, order: 0 },
        { id: "favorites", name: "欲しい物", starred: true, expanded: false, order: 1 },
      ])
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("toby-tabs", JSON.stringify(tabs))
  }, [tabs])

  useEffect(() => {
    localStorage.setItem("toby-collections", JSON.stringify(collections))
  }, [collections])

  const getCollectionTabs = (collectionName: string) => {
    const collectionTabs = tabs
      .filter((tab) => tab.collection === collectionName)
      .sort((a, b) => a.order - b.order)

    if (!searchQuery.trim()) {
      return collectionTabs
    }

    const query = searchQuery.toLowerCase()
    return collectionTabs.filter(
      (tab) => tab.title.toLowerCase().includes(query) || tab.url.toLowerCase().includes(query),
    )
  }

  // 検索を無視して純粋にコレクションの全タブを取得（順序込み）
  const getCollectionTabsRaw = (collectionName: string) =>
    tabs.filter((tab) => tab.collection === collectionName).sort((a, b) => a.order - b.order)

  const addTab = (title: string, url: string, collectionName = "INBOX") => {
    const collectionTabs = getCollectionTabsRaw(collectionName)
    const maxOrder = collectionTabs.length > 0 ? Math.max(...collectionTabs.map((t) => t.order)) : -1

    const newTab: Tab = {
      id: Date.now().toString(),
      title,
      url,
      favicon: "🌐",
      collection: collectionName,
      created: new Date(),
      order: maxOrder + 1,
      // 既定ではサムネイル無し。必要なら別処理で生成する。
    }
    setTabs((prev) => [...prev, newTab])
  }

  const deleteTab = (tabId: string) => {
    setTabs((prev) => prev.filter((tab) => tab.id !== tabId))
  }

  const editTab = (tabId: string, title: string, url: string) => {
    setTabs((prev) => prev.map((tab) => (tab.id === tabId ? { ...tab, title, url } : tab)))
  }

  const duplicateTab = (tabId: string) => {
    const tab = tabs.find((t) => t.id === tabId)
    if (tab) {
      const collectionTabs = getCollectionTabsRaw(tab.collection)
      const maxOrder = collectionTabs.length > 0 ? Math.max(...collectionTabs.map((t) => t.order)) : -1

      const newTab: Tab = {
        ...tab,
        id: Date.now().toString(),
        title: `${tab.title} (Copy)`,
        created: new Date(),
        order: maxOrder + 1,
      }
      setTabs((prev) => [...prev, newTab])
    }
  }

  const moveTab = (tabId: string, targetCollection: string, targetOrder?: number) => {
    setTabs((prev) => {
      const tab = prev.find((t) => t.id === tabId)
      if (!tab) return prev

      const newOrder =
        targetOrder !== undefined
          ? targetOrder
          : Math.max(...getCollectionTabsRaw(targetCollection).map((t) => t.order), -1) + 1

      return prev.map((t) => (t.id === tabId ? { ...t, collection: targetCollection, order: newOrder } : t))
    })
  }

  const reorderTabsInCollection = (collectionName: string, sourceIndex: number, targetIndex: number) => {
    const collectionTabs = getCollectionTabsRaw(collectionName)
    if (sourceIndex === targetIndex) return

    const reorderedTabs = [...collectionTabs]
    const [movedTab] = reorderedTabs.splice(sourceIndex, 1)
    reorderedTabs.splice(targetIndex, 0, movedTab)

    // Update orders
    const updatedTabs = reorderedTabs.map((tab, index) => ({ ...tab, order: index }))

    setTabs((prev) =>
      prev.map((tab) => {
        const updatedTab = updatedTabs.find((ut) => ut.id === tab.id)
        return updatedTab || tab
      }),
    )
  }

  const bulkMoveToCollection = (collectionName: string) => {
    const maxOrder = Math.max(...getCollectionTabsRaw(collectionName).map((t) => t.order), -1)

    setTabs((prev) =>
      prev.map((tab, index) =>
        selectedTabs.includes(tab.id)
          ? { ...tab, collection: collectionName, order: maxOrder + 1 + selectedTabs.indexOf(tab.id) }
          : tab,
      ),
    )
    setSelectedTabs([])
  }

  const bulkDeleteTabs = () => {
    setTabs((prev) => prev.filter((tab) => !selectedTabs.includes(tab.id)))
    setSelectedTabs([])
  }

  const addCollection = (name: string) => {
    const maxOrder = collections.length > 0 ? Math.max(...collections.map((c) => c.order)) : -1
    const newCollection: Collection = {
      id: Date.now().toString(),
      name,
      starred: false,
      expanded: true,
      order: maxOrder + 1,
    }
    setCollections((prev) => [...prev, newCollection])
  }

  const deleteCollection = (collectionId: string) => {
    const collection = collections.find((c) => c.id === collectionId)
    if (collection) {
      // Move all tabs from this collection to INBOX
      setTabs((prev) => prev.map((tab) => (tab.collection === collection.name ? { ...tab, collection: "INBOX" } : tab)))
      setCollections((prev) => prev.filter((c) => c.id !== collectionId))
    }
  }

  const renameCollection = (collectionId: string, newName: string) => {
    const oldCollection = collections.find((c) => c.id === collectionId)
    if (oldCollection) {
      // Update tabs that reference this collection
      setTabs((prev) =>
        prev.map((tab) => (tab.collection === oldCollection.name ? { ...tab, collection: newName } : tab)),
      )
      // Update collection name
      setCollections((prev) => prev.map((c) => (c.id === collectionId ? { ...c, name: newName } : c)))
    }
  }

  const toggleCollectionStarred = (collectionId: string) => {
    setCollections((prev) => prev.map((c) => (c.id === collectionId ? { ...c, starred: !c.starred } : c)))
  }

  const toggleCollectionExpanded = (collectionId: string) => {
    setCollections((prev) => prev.map((c) => (c.id === collectionId ? { ...c, expanded: !c.expanded } : c)))
  }

  const handleDragStart = (e: React.DragEvent, tabId: string) => {
    setDraggedTab(tabId)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent, collectionName?: string) => {
    e.preventDefault()
    // 開いているタブをドラッグ中は "copy"、保存済みタブの並び替え/移動は "move"
    e.dataTransfer.dropEffect = draggedOpenTab !== null ? "copy" : "move"
    if (collectionName) {
      setDragOverCollection(collectionName)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX
    const y = e.clientY

    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverCollection(null)
    }
  }

  const handleDrop = (e: React.DragEvent, targetCollection: string, targetIndex?: number) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOverCollection(null)

    if (draggedTab) {
      const tab = tabs.find((t) => t.id === draggedTab)
      if (tab && tab.collection === targetCollection && targetIndex !== undefined) {
        // Reordering within same collection
        const collectionTabs = getCollectionTabsRaw(targetCollection)
        const sourceIndex = collectionTabs.findIndex((t) => t.id === draggedTab)
        reorderTabsInCollection(targetCollection, sourceIndex, targetIndex)
      } else {
        // Moving to different collection
        moveTab(draggedTab, targetCollection, targetIndex)
      }
      setDraggedTab(null)
    } else if (draggedOpenTab !== null) {
      const openTab = openTabs[draggedOpenTab]
      addTab(openTab.title, openTab.url, targetCollection)
      // ドロップ先コレクションが閉じている場合は自動で展開
      const col = collections.find((c) => c.name === targetCollection)
      if (col && !col.expanded) {
        setCollections((prev) => prev.map((c) => (c.id === col.id ? { ...c, expanded: true } : c)))
      }
      // 検索が有効で新規タブがヒットしない場合は検索をクリアして見えるようにする
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matches = openTab.title.toLowerCase().includes(q) || openTab.url.toLowerCase().includes(q)
        if (!matches) setSearchQuery("")
      }
      setDraggedOpenTab(null)
    }
  }

  const handleOpenTabDragStart = (e: React.DragEvent, index: number) => {
    setDraggedOpenTab(index)
    // ドロップ先が move を要求しても許可されるように copyMove を許可
    e.dataTransfer.effectAllowed = "copyMove"
    try {
      // ChromeはsetDataが無いとドロップを拒否することがある
      e.dataTransfer.setData("text/plain", openTabs[index]?.url || "")
    } catch {
      // ignore
    }
  }

  const openAllTabsInCollection = (collectionName: string) => {
    const collectionTabs = getCollectionTabsRaw(collectionName)
    collectionTabs.forEach((tab) => {
      window.open(tab.url, "_blank")
    })
  }

  const reorderCollections = (sourceIndex: number, targetIndex: number) => {
    if (sourceIndex === targetIndex) return

    const sortedCollections = [...collections].sort((a, b) => a.order - b.order)
    const [movedCollection] = sortedCollections.splice(sourceIndex, 1)
    sortedCollections.splice(targetIndex, 0, movedCollection)

    // Update orders
    const updatedCollections = sortedCollections.map((collection, index) => ({
      ...collection,
      order: index,
    }))

    setCollections(updatedCollections)
  }

  const handleCollectionDragStart = (e: React.DragEvent, collectionId: string) => {
    setDraggedCollection(collectionId)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleCollectionDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = draggedOpenTab !== null ? "copy" : "move"
  }

  const handleCollectionDrop = (e: React.DragEvent, targetCollectionId: string) => {
    e.preventDefault()
    e.stopPropagation()

    if (draggedCollection && draggedCollection !== targetCollectionId) {
      const sortedCollections = [...collections].sort((a, b) => a.order - b.order)
      const sourceIndex = sortedCollections.findIndex((c) => c.id === draggedCollection)
      const targetIndex = sortedCollections.findIndex((c) => c.id === targetCollectionId)

      if (sourceIndex !== -1 && targetIndex !== -1) {
        reorderCollections(sourceIndex, targetIndex)
      }
    }
    setDraggedCollection(null)
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
        {/* Navigation */}
        <div className="flex-1 p-4 space-y-2">
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-2">📋 コレクション</h2>
          </div>

          <div className="space-y-1">
            {collections.map((collection) => {
              const collectionTabs = getCollectionTabs(collection.name)
              return (
                <div
                  key={collection.id}
                  className="flex items-center justify-between px-3 py-2 rounded text-sm hover:bg-gray-700"
                >
                  <div className="flex items-center space-x-2">
                    <span>{collection.starred ? "⭐" : "📁"}</span>
                    <span>{collection.name}</span>
                  </div>
                  <span className="text-xs text-gray-400">{collectionTabs.length}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Collections Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="border-b border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-400">{tabs.length} タブ</span>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="タブを検索..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 w-64"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {selectedTabs.length > 0 && (
                  <>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          選択した {selectedTabs.length} 個を移動
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {collections.map((collection) => (
                          <DropdownMenuItem key={collection.id} onClick={() => bulkMoveToCollection(collection.name)}>
                            {collection.name}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button variant="outline" size="sm" onClick={bulkDeleteTabs}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}

                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      コレクションを追加
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-800 border-gray-700">
                    <DialogHeader>
                      <DialogTitle>新しいコレクション</DialogTitle>
                    </DialogHeader>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        const formData = new FormData(e.currentTarget)
                        const name = formData.get("name") as string
                        if (name.trim()) {
                          addCollection(name.trim())
                          e.currentTarget.reset()
                        }
                      }}
                    >
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="name">コレクション名</Label>
                          <Input
                            id="name"
                            name="name"
                            placeholder="コレクション名を入力"
                            className="bg-gray-700 border-gray-600"
                            required
                          />
                        </div>
                        <Button type="submit" className="w-full">
                          作成
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

          {/* Collections */}
          <div className="flex-1 overflow-auto p-4">
            <div className="space-y-6">
              {collections
                .sort((a, b) => a.order - b.order)
                .map((collection) => {
                  const collectionTabs = getCollectionTabs(collection.name)

                  return (
                    <div
                      key={collection.id}
                      className={`space-y-3 transition-colors ${
                        dragOverCollection === collection.name
                          ? "bg-gray-800 rounded-lg p-4 border-2 border-dashed border-blue-500"
                          : ""
                      } ${draggedCollection === collection.id ? "opacity-50" : ""}`}
                      draggable
                      onDragStart={(e) => handleCollectionDragStart(e, collection.id)}
                      onDragOver={(e) => {
                        handleDragOver(e, collection.name)
                        handleCollectionDragOver(e)
                      }}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => {
                        handleDrop(e, collection.name)
                        handleCollectionDrop(e, collection.id)
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <GripVertical className="h-4 w-4 text-gray-500 cursor-move" />
                          <button
                            onClick={() => toggleCollectionExpanded(collection.id)}
                            className="text-gray-400 hover:text-white"
                          >
                            {collection.expanded ? "▼" : "▶"}
                          </button>
                          <h2 className="text-lg font-semibold">{collection.name}</h2>
                          <span className="text-sm text-gray-400">({collectionTabs.length})</span>
                          <button
                            onClick={() => toggleCollectionStarred(collection.id)}
                            className="text-gray-400 hover:text-yellow-400"
                          >
                            {collection.starred ? (
                              <Star className="h-4 w-4 fill-current" />
                            ) : (
                              <StarOff className="h-4 w-4" />
                            )}
                          </button>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Plus className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-gray-800 border-gray-700">
                              <DialogHeader>
                                <DialogTitle>タブを追加</DialogTitle>
                              </DialogHeader>
                              <form
                                onSubmit={(e) => {
                                  e.preventDefault()
                                  const formData = new FormData(e.currentTarget)
                                  const title = formData.get("title") as string
                                  const url = formData.get("url") as string
                                  if (title.trim() && url.trim()) {
                                    addTab(title.trim(), url.trim(), collection.name)
                                    e.currentTarget.reset()
                                  }
                                }}
                              >
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="title">タイトル</Label>
                                    <Input
                                      id="title"
                                      name="title"
                                      placeholder="タブのタイトル"
                                      className="bg-gray-700 border-gray-600"
                                      required
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="url">URL</Label>
                                    <Input
                                      id="url"
                                      name="url"
                                      type="url"
                                      placeholder="https://example.com"
                                      className="bg-gray-700 border-gray-600"
                                      required
                                    />
                                  </div>
                                  <Button type="submit" className="w-full">
                                    追加
                                  </Button>
                                </div>
                              </form>
                            </DialogContent>
                          </Dialog>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => openAllTabsInCollection(collection.name)}>
                                <ExternalLink className="h-4 w-4 mr-2" />
                                全てのタブを開く
                              </DropdownMenuItem>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    名前を変更
                                  </DropdownMenuItem>
                                </DialogTrigger>
                                <DialogContent className="bg-gray-800 border-gray-700">
                                  <DialogHeader>
                                    <DialogTitle>コレクション名を変更</DialogTitle>
                                  </DialogHeader>
                                  <form
                                    onSubmit={(e) => {
                                      e.preventDefault()
                                      const formData = new FormData(e.currentTarget)
                                      const name = formData.get("name") as string
                                      if (name.trim()) {
                                        renameCollection(collection.id, name.trim())
                                      }
                                    }}
                                  >
                                    <div className="space-y-4">
                                      <div>
                                        <Label htmlFor="name">新しい名前</Label>
                                        <Input
                                          id="name"
                                          name="name"
                                          defaultValue={collection.name}
                                          className="bg-gray-700 border-gray-600"
                                          required
                                        />
                                      </div>
                                      <Button type="submit" className="w-full">
                                        変更
                                      </Button>
                                    </div>
                                  </form>
                                </DialogContent>
                              </Dialog>
                              <DropdownMenuItem onClick={() => deleteCollection(collection.id)}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                削除
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {collection.expanded && (
                        <div
                          className="grid gap-[var(--toby-card-gap)]"
                          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}
                        >
                          {collectionTabs.map((tab, index) => (
                            <Card
                              key={tab.id}
                              className={`bg-gray-800 border-gray-700 hover:bg-gray-750 cursor-pointer transition-colors overflow-hidden ${
                                selectedTabs.includes(tab.id) ? "ring-2 ring-blue-500" : ""
                              }`}
                              draggable
                              onDragStart={(e) => handleDragStart(e, tab.id)}
                              onDragOver={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                              }}
                              onDrop={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleDrop(e, collection.name, index)
                              }}
                              onClick={(e) => {
                                // DnD開始の微小移動でのクリック誤判定を避けたい場合は必要に応じて距離チェックを追加
                                e.stopPropagation()
                                window.open(tab.url, '_blank', 'noopener,noreferrer')
                              }}
                            >
                              <CardContent className="p-[var(--toby-card-padding)]">
                                <div className="flex items-start gap-2">
                                  <span className="text-base leading-5 flex-shrink-0">{tab.favicon}</span>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium truncate">{tab.title}</div>
                                    <div className="text-xs text-gray-400 truncate">{tab.url}</div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
            </div>
          </div>
        </div>

        {/* Open Tabs Column */}
        <div className="w-64 bg-gray-850 border-l border-gray-700 flex flex-col">
          <div className="border-b border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                開いているタブ
              </h2>
              <span className="text-sm text-gray-400">{openTabs.length}</span>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4">
            <div className="space-y-[var(--toby-card-gap)]">
              {openTabs.map((tab, index) => (
                <Card
                  key={tab.id}
                  className="bg-gray-800 border-gray-700 hover:bg-gray-750 cursor-pointer transition-colors overflow-hidden"
                  draggable
                  onDragStart={(e) => handleOpenTabDragStart(e, index)}
                  onClick={async () => {
                    if (isExtensionEnv()) {
                      await sendExtMessage<{ ok: boolean }>({ type: 'ACTIVATE_TAB', id: tab.id })
                    } else {
                      window.open(tab.url, '_blank', 'noopener,noreferrer')
                    }
                  }}
                >
                  <CardContent className="p-[var(--toby-card-padding)]">
                    <div className="flex items-start gap-2">
                      {tab.favicon && tab.favicon.startsWith("http") ? (
                        // favicon URL の場合は画像表示
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={tab.favicon}
                          alt="favicon"
                          className="h-4 w-4 rounded-sm"
                          onError={(e) => {
                            const el = e.currentTarget as HTMLImageElement
                            el.style.display = "none"
                          }}
                        />
                      ) : (
                        <span className="text-base leading-5">{tab.favicon ?? "🌐"}</span>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{tab.title}</div>
                        <div className="text-xs text-gray-400 truncate">{tab.url}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
