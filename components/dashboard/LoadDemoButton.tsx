'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoadDemoButton() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLoad = async () => {
    setLoading(true)
    await fetch('/api/demo-data', { method: 'POST' })
    router.refresh()
    setLoading(false)
  }

  return (
    <button
      onClick={handleLoad}
      disabled={loading}
      className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
    >
      {loading ? 'Loading...' : '🎬 Load Demo Data'}
    </button>
  )
}