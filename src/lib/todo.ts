// Logic thuần (pure functions) — không phụ thuộc React/DOM => dễ unit test nhất.
export type Todo = { id: number; text: string; done: boolean }
export type Filter = 'all' | 'active' | 'done'

export function validateTodo(text: string, existing: Todo[] = []): string | null {
  const t = text.trim()
  if (!t) return 'Vui lòng nhập nội dung'
  if (t.length > 50) return 'Tối đa 50 ký tự'
  if (existing.some((x) => x.text.toLowerCase() === t.toLowerCase())) return 'Công việc đã tồn tại'
  return null
}

export function filterTodos(todos: Todo[], filter: Filter): Todo[] {
  if (filter === 'active') return todos.filter((t) => !t.done)
  if (filter === 'done') return todos.filter((t) => t.done)
  return todos
}
