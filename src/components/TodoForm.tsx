import { useState, type FormEvent } from 'react'
import { validateTodo, type Todo } from '../lib/todo'

type Props = { existing: Todo[]; onAdd: (text: string) => void }

export function TodoForm({ existing, onAdd }: Props) {
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const err = validateTodo(text, existing)
    setError(err)
    if (err) return
    onAdd(text.trim())
    setText('')
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="new-todo">Công việc mới</label>
      <input id="new-todo" value={text} onChange={(e) => setText(e.target.value)} />
      <button type="submit">Thêm</button>
      {error && <p role="alert">{error}</p>}
    </form>
  )
}
