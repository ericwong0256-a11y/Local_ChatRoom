import { useEffect, useMemo, useState } from 'react'
import Input from '../ui/Input.jsx'
import Button from '../ui/Button.jsx'
import { useConfirm } from '../ui/ConfirmProvider.jsx'
import { api } from '../../lib/api.js'

export default function KeywordsTab() {
  const confirm = useConfirm()
  const [keywords, setKeywords] = useState([])
  const [word, setWord] = useState('')
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const load = () => api.admin.keywords().then(setKeywords).catch(() => {})
  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return keywords
    return keywords.filter((k) => k.word.toLowerCase().includes(q))
  }, [keywords, query])

  const add = async (e) => {
    e.preventDefault()
    setError('')
    if (!word.trim()) return
    setLoading(true)
    try {
      await api.admin.addKeyword(word.trim())
      setWord('')
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const remove = async (k) => {
    if (
      !(await confirm({
        title: 'Delete keyword',
        message: `Stop flagging messages containing "${k.word}"?`,
        confirmText: 'Delete',
        danger: true,
      }))
    )
      return
    await api.admin.deleteKeyword(k.id)
    load()
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header card */}
      <div className="card p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏷️</span>
              <h2 className="text-lg font-semibold text-slate-800">Watched Keywords</h2>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Messages containing any of these words (case-insensitive) are automatically flagged
              and listed in the <span className="font-medium text-slate-700">Messages</span> tab.
            </p>
          </div>
          <div className="text-right shrink-0">
            <div className="text-3xl font-bold text-brand-600">{keywords.length}</div>
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
              Active
            </div>
          </div>
        </div>

        <form onSubmit={add} className="flex gap-2">
          <Input
            value={word}
            onChange={(e) => setWord(e.target.value)}
            placeholder="Add a new keyword (e.g. urgent, password, meeting)"
          />
          <Button type="submit" disabled={loading || !word.trim()}>
            {loading ? 'Adding...' : '+ Add'}
          </Button>
        </form>
        {error && <p className="field-error mt-2">{error}</p>}
      </div>

      {/* Keyword chips */}
      <div className="card">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between gap-3">
          <span className="font-semibold text-slate-800">All Keywords</span>
          {keywords.length > 0 && (
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter..."
              className="input input-sm max-w-[200px]"
            />
          )}
        </div>

        <div className="p-5">
          {keywords.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-4xl mb-2">🏷️</div>
              <p className="text-sm text-slate-400">
                No keywords yet — add one above to start flagging messages.
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-sm text-slate-400 py-6">
              No keywords match "{query}".
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {filtered.map((k) => (
                <KeywordChip key={k.id} keyword={k} onRemove={() => remove(k)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function KeywordChip({ keyword, onRemove }) {
  return (
    <span
      className="group inline-flex items-center gap-1.5 pl-3 pr-1 py-1 rounded-full
                 bg-amber-50 border border-amber-200 text-amber-800 text-sm font-medium
                 hover:bg-amber-100 hover:border-amber-300 transition"
      title={`Added ${new Date(keyword.created_at).toLocaleDateString()}`}
    >
      <span className="text-amber-500">#</span>
      {keyword.word}
      <button
        type="button"
        onClick={onRemove}
        className="ml-1 w-5 h-5 rounded-full bg-amber-200/0 group-hover:bg-amber-200
                   text-amber-700 hover:bg-red-500 hover:text-white text-xs leading-none
                   flex items-center justify-center transition"
        title="Remove keyword"
      >
        ×
      </button>
    </span>
  )
}
