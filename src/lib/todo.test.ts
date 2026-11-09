// UNIT TEST: test 1 hàm độc lập, input -> output. Nhanh, không cần DOM.
import { describe, it, expect } from 'vitest'
import { validateTodo, filterTodos, type Todo } from './todo'

describe('validateTodo', () => {
  it('trả về null khi hợp lệ', () => {
    expect(validateTodo('Học Playwright')).toBeNull()
  })

  // it.each: chạy cùng 1 test với nhiều bộ dữ liệu (table-driven test)
  it.each([
    ['', 'Vui lòng nhập nội dung'],
    ['   ', 'Vui lòng nhập nội dung'],
    ['a'.repeat(51), 'Tối đa 50 ký tự'],
  ])('input %j -> lỗi "%s"', (input, expected) => {
    expect(validateTodo(input)).toBe(expected)
  })

  it('báo trùng, không phân biệt hoa thường và khoảng trắng', () => {
    const existing: Todo[] = [{ id: 1, text: 'Đi chợ', done: false }]
    expect(validateTodo('  đi CHỢ ', existing)).toBe('Công việc đã tồn tại')
  })
})

describe('filterTodos', () => {
  const todos: Todo[] = [
    { id: 1, text: 'A', done: false },
    { id: 2, text: 'B', done: true },
  ]

  it('lọc theo trạng thái', () => {
    expect(filterTodos(todos, 'all')).toHaveLength(2)
    expect(filterTodos(todos, 'active').map((t) => t.text)).toEqual(['A'])
    expect(filterTodos(todos, 'done').map((t) => t.text)).toEqual(['B'])
  })
})
