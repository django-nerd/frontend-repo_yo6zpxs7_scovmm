import React, { useMemo, useState } from 'react'

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function ImageGrid({ urls }) {
  if (!urls || urls.length === 0) return null
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
      {urls.map((u, i) => (
        <img key={i} src={`${u}?auto=format&fit=crop&w=800&q=60`} alt="product" className="rounded-xl object-cover w-full h-40 sm:h-48 shadow" />
      ))}
    </div>
  )
}

function DealCard({ deal, onOpen }) {
  return (
    <div className="p-4 rounded-2xl border bg-white/70 backdrop-blur shadow-sm hover:shadow-md transition">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm uppercase tracking-wide text-gray-500">{deal.platform}</div>
          <h3 className="text-lg font-semibold">{deal.title}</h3>
        </div>
        <span className="px-3 py-1 rounded-full text-xs bg-emerald-50 text-emerald-700">Score {deal.quality_score}</span>
      </div>
      <div className="flex items-end gap-3 mt-2">
        <div className="text-2xl font-bold">₹{Math.round(deal.price)}</div>
        {deal.original_price && (
          <div className="line-through text-gray-400">₹{Math.round(deal.original_price)}</div>
        )}
        {deal.discount_percent && (
          <div className="text-emerald-600 text-sm font-medium">{deal.discount_percent}% off</div>
        )}
      </div>
      <div className="text-sm text-gray-600 mt-1">{deal.rating}★ · {deal.reviews_count}+ reviews · {deal.delivery}</div>
      <ImageGrid urls={deal.image_urls} />
      <div className="mt-4 flex gap-2">
        <a href={deal.product_url} target="_blank" className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-black text-white text-sm hover:bg-gray-800" onClick={onOpen}>
          View on {deal.platform}
        </a>
        <button className="px-3 py-2 rounded-xl border text-sm hover:bg-gray-50">Why this deal?</button>
      </div>
    </div>
  )
}

export default function App() {
  const [query, setQuery] = useState('Wireless earbuds')
  const [loading, setLoading] = useState(false)
  const [pitch, setPitch] = useState('')
  const [deals, setDeals] = useState([])
  const [error, setError] = useState('')

  const search = async (e) => {
    e?.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })
      if (!res.ok) throw new Error('Failed to search')
      const data = await res.json()
      setDeals(data.deals)
      setPitch(data.pitch)
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-100">
      <header className="sticky top-0 backdrop-blur bg-white/70 border-b">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="font-bold text-xl">DealMate</div>
          <form onSubmit={search} className="flex-1 flex gap-2">
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search any product across Amazon, Flipkart, Myntra, Ajio..." className="flex-1 px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-black/10" />
            <button type="submit" className="px-4 py-2 rounded-xl bg-black text-white hover:bg-gray-800">Find deals</button>
          </form>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {loading && <div className="animate-pulse">Hunting best prices, reviews and quality...</div>}
        {error && <div className="text-red-600">{error}</div>}
        {!loading && pitch && (
          <div className="p-4 rounded-2xl bg-amber-50 border text-amber-900 mb-6">{pitch}</div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          {deals.map((d, i) => (
            <DealCard key={i} deal={d} />
          ))}
        </div>

        {!loading && deals.length === 0 && (
          <div className="text-gray-600 mt-16 text-center">
            Start by searching for a product. I’ll compare prices, ratings and reviews to recommend the best value across stores.
          </div>
        )}
      </main>
    </div>
  )
}
