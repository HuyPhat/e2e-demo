// COMPONENT TEST: render 1 component vào DOM giả (jsdom), tương tác như người dùng,
// kiểm tra những gì người dùng THẤY — không test state nội bộ.
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TodoForm } from './TodoForm'

describe('<TodoForm />', () => {
  it('gọi onAdd với text đã trim và xoá ô input', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn() // mock function: ghi lại các lần được gọi
    render(<TodoForm existing={[]} onAdd={onAdd} />)

    // Query theo label/role giống cách người dùng & screen reader tìm phần tử
    const input = screen.getByLabelText('Công việc mới')
    await user.type(input, '  Viết test  ')
    await user.click(screen.getByRole('button', { name: 'Thêm' }))

    expect(onAdd).toHaveBeenCalledTimes(1)
    expect(onAdd).toHaveBeenCalledWith('Viết test')
    expect(input).toHaveValue('') // matcher từ @testing-library/jest-dom
  })

  it('hiện lỗi và KHÔNG gọi onAdd khi input rỗng', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()
    render(<TodoForm existing={[]} onAdd={onAdd} />)

    await user.click(screen.getByRole('button', { name: 'Thêm' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Vui lòng nhập nội dung')
    expect(onAdd).not.toHaveBeenCalled()
  })

  it('submit bằng phím Enter', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()
    render(<TodoForm existing={[]} onAdd={onAdd} />)

    await user.type(screen.getByLabelText('Công việc mới'), 'Enter test{Enter}')

    expect(onAdd).toHaveBeenCalledWith('Enter test')
    // queryBy* trả về null thay vì throw -> dùng để khẳng định "không tồn tại"
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
