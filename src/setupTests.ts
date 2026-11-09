// Chạy trước mỗi file test: thêm matcher DOM (toBeInTheDocument, toHaveValue, ...)
import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => cleanup()) // gỡ component đã render giữa các test
