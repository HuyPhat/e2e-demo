// E2E TEST: chạy app THẬT trong trình duyệt THẬT (Chromium), như người dùng thật.
import { test, expect } from '@playwright/test'

test.describe('Todo app', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/') // dùng baseURL trong config
  })

  test('hiển thị dữ liệu từ API thật', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Todo' })).toBeVisible()
    await expect(page.getByRole('listitem')).toHaveCount(2)
    await expect(page.getByText('Còn 1 việc')).toBeVisible()
  })

  test('luồng đầy đủ: thêm -> hoàn thành -> lọc -> xoá', async ({ page }) => {
    // Locator + web-first assertion: expect() tự chờ/retry, KHÔNG cần sleep
    const input = page.getByLabel('Công việc mới')
    await input.fill('Phỏng vấn frontend')
    await input.press('Enter')

    await expect(page.getByRole('listitem')).toHaveCount(3)
    await expect(input).toBeEmpty()

    await page.getByRole('checkbox', { name: 'Phỏng vấn frontend' }).check()
    await expect(page.getByText('Còn 1 việc')).toBeVisible()

    await page.getByRole('button', { name: 'Đã xong' }).click()
    await expect(page.getByRole('listitem')).toHaveCount(2)

    await page.getByRole('button', { name: 'Xoá Phỏng vấn frontend' }).click()
    await expect(page.getByRole('listitem')).toHaveCount(1)
  })

  test('báo lỗi validate khi nhập trùng', async ({ page }) => {
    await page.getByLabel('Công việc mới').fill('viết test đầu tiên')
    await page.getByRole('button', { name: 'Thêm' }).click()
    await expect(page.getByRole('alert')).toHaveText('Công việc đã tồn tại')
  })
})

// Mock network trong E2E bằng page.route — test các case khó tái hiện với server thật
test('hiện lỗi khi API hỏng', async ({ page }) => {
  await page.route('**/api/todos.json', (route) => route.fulfill({ status: 500 }))
  await page.goto('/')
  await expect(page.getByRole('alert')).toHaveText('Không tải được danh sách')
})

test('hiển thị dữ liệu giả từ route mock', async ({ page }) => {
  await page.route('**/api/todos.json', (route) =>
    route.fulfill({ json: [{ id: 1, text: 'Dữ liệu mock', done: false }] }),
  )
  await page.goto('/')
  await expect(page.getByText('Dữ liệu mock')).toBeVisible()
})
