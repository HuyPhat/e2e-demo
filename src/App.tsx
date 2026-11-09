import { useEffect, useState } from 'react'
import { TodoForm } from './components/TodoForm'
import { filterTodos, type Filter, type Todo } from './lib/todo'

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'active', label: 'Đang làm' },
  { value: 'done', label: 'Đã xong' },
]

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [filter, setFilter] = useState<Filter>('all')

  useEffect(() => {
    // BASE_URL = '/' khi dev, '/<repo>/' khi deploy GitHub Pages
    fetch(`${import.meta.env.BASE_URL}api/todos.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((data: Todo[]) => {
        setTodos(data)
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [])

  if (status === 'loading') return <p>Đang tải...</p>
  if (status === 'error') return <p role="alert">Không tải được danh sách</p>

  const add = (text: string) =>
    setTodos((ts) => [...ts, { id: Math.max(0, ...ts.map((t) => t.id)) + 1, text, done: false }])
  const toggle = (id: number) =>
    setTodos((ts) => ts.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))
  const remove = (id: number) => setTodos((ts) => ts.filter((t) => t.id !== id))

  const remaining = todos.filter((t) => !t.done).length

  return (
    <main>
      <h1>Todo</h1>
      <TodoForm existing={todos} onAdd={add} />

      <div role="group" aria-label="Bộ lọc">
        {FILTERS.map((f) => (
          <button key={f.value} aria-pressed={filter === f.value} onClick={() => setFilter(f.value)}>
            {f.label}
          </button>
        ))}
      </div>

      <ul>
        {filterTodos(todos, filter).map((t) => (
          <li key={t.id} className={t.done ? 'done' : undefined}>
            <label>
              <input type="checkbox" checked={t.done} onChange={() => toggle(t.id)} />
              {t.text}
            </label>
            <button aria-label={`Xoá ${t.text}`} onClick={() => remove(t.id)}>
              ✕
            </button>
          </li>
        ))}
      </ul>

      <p>Còn {remaining} việc</p>
    </main>
  )
}
