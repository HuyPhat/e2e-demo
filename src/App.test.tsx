// INTEGRATION-STYLE COMPONENT TEST: render cả App, mock network (fetch),
// test luồng async: loading -> data -> tương tác.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

const mockTodos = [
  { id: 1, text: 'Đi chợ', done: false },
  { id: 2, text: 'Nấu cơm', done: true },
]

describe('<App />', () => {
  beforeEach(() => {
    // Mock fetch để test không phụ thuộc server thật -> nhanh, ổn định
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(mockTodos)))
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('hiện loading rồi hiện danh sách từ API', async () => {
    render(<App />)

    expect(screen.getByText('Đang tải...')).toBeInTheDocument()
    // findBy* = async, tự retry đến khi phần tử xuất hiện (mặc định 1s)
    expect(await screen.findByText('Đi chợ')).toBeInTheDocument()
    expect(screen.getByText('Còn 1 việc')).toBeInTheDocument()
    expect(fetch).toHaveBeenCalledWith('/api/todos.json')
  })

  it('thêm, tick hoàn thành và xoá công việc', async () => {
    const user = userEvent.setup()
    render(<App />)
    await screen.findByText('Đi chợ')

    await user.type(screen.getByLabelText('Công việc mới'), 'Học Vitest{Enter}')
    expect(screen.getByText('Còn 2 việc')).toBeInTheDocument()

    await user.click(screen.getByRole('checkbox', { name: 'Học Vitest' }))
    expect(screen.getByRole('checkbox', { name: 'Học Vitest' })).toBeChecked()
    expect(screen.getByText('Còn 1 việc')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Xoá Đi chợ' }))
    expect(screen.queryByText('Đi chợ')).not.toBeInTheDocument()
  })

  it('lọc theo "Đã xong"', async () => {
    const user = userEvent.setup()
    render(<App />)
    await screen.findByText('Đi chợ')

    await user.click(screen.getByRole('button', { name: 'Đã xong' }))

    expect(screen.getByRole('button', { name: 'Đã xong' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getAllByRole('listitem')).toHaveLength(1)
    expect(screen.getByText('Nấu cơm')).toBeInTheDocument()
  })

  it('hiện lỗi khi API trả 500', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response('', { status: 500 }))
    render(<App />)

    expect(await screen.findByRole('alert')).toHaveTextContent('Không tải được danh sách')
  })
})
