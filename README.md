# Todo App — Demo Unit / Component / E2E Testing

React + Vite + TypeScript, test bằng **Vitest**, **React Testing Library** và **Playwright**, chạy CI/CD trên **GitHub Actions** và deploy lên **GitHub Pages**.

## Cấu trúc

```
src/lib/todo.ts                  logic thuần (validate, filter)
src/lib/todo.test.ts             UNIT test        (Vitest)
src/components/TodoForm.tsx      component form
src/components/TodoForm.test.tsx COMPONENT test   (Vitest + Testing Library)
src/App.test.tsx                 INTEGRATION test (render cả App, mock fetch)
src/setupTests.ts                nạp jest-dom matchers
e2e/todo.spec.ts                 E2E test         (Playwright, trình duyệt thật)
playwright.config.ts             config Playwright (tự bật dev server)
.github/workflows/ci.yml         CI/CD: test -> e2e -> deploy
```

## Chạy ở máy local

```bash
npm install
npx playwright install chromium   # tải trình duyệt cho Playwright (1 lần)

npm run dev        # chạy app: http://localhost:5173
npm test           # Vitest, chế độ watch (lưu file là chạy lại)
npm run test:run   # Vitest, chạy 1 lần (dùng trên CI)
npm run e2e        # Playwright, chạy headless
npm run e2e:ui     # Playwright UI mode: xem từng bước, time-travel, debug
npx playwright test --headed      # mở trình duyệt thật để xem
npx playwright show-report        # mở báo cáo HTML
npx playwright codegen localhost:5173  # thao tác bằng tay, Playwright sinh code test
```

## CI/CD với GitHub Actions

1. Tạo repo trên GitHub, rồi push code:
   ```bash
   git init && git add . && git commit -m "init"
   git branch -M main
   git remote add origin https://github.com/<user>/<repo>.git
   git push -u origin main
   ```
2. Trên GitHub: **Settings → Pages → Source: GitHub Actions**.
3. Mỗi lần push hoặc mở PR, workflow sẽ chạy:
   - `unit`: type-check + build + Vitest
   - `e2e`: cài Chromium và chạy Playwright; upload `playwright-report` vào tab **Actions → run → Artifacts**
   - `deploy`: chỉ chạy khi push lên `main` **và** cả hai job trên pass → app lên `https://<user>.github.io/<repo>/`
4. (Nên làm) **Settings → Branches → Branch protection** cho `main`: bắt buộc check `unit` và `e2e` pass thì mới được merge PR.

`unit` và `e2e` chạy **song song** để nhanh hơn; `deploy` có `needs: [unit, e2e]` nên chỉ deploy khi test xanh.

---

## Kiến thức để trả lời phỏng vấn

### 1. Testing pyramid / testing trophy
- **Unit**: test một hàm/module độc lập. Rất nhanh, nên viết nhiều. Ví dụ: `validateTodo`.
- **Component/Integration**: render component trong jsdom (DOM giả chạy trên Node), tương tác như người dùng. Đây là chỗ "đáng tiền" nhất với frontend (Kent C. Dodds gọi là *testing trophy*).
- **E2E**: chạy app thật trong trình duyệt thật. Tự tin cao nhất nhưng chậm và dễ flaky, nên chỉ viết cho các luồng quan trọng (đăng nhập, thanh toán, ...).

### 2. Vitest và Jest
- API gần như giống hệt nhau (`describe/it/expect`, `vi.fn()` tương ứng `jest.fn()`, `vi.mock()` tương ứng `jest.mock()`).
- Vitest dùng chung config/transform với Vite → hỗ trợ sẵn ESM và TS, không cần Babel, rất nhanh, watch mode thông minh.
- Jest phổ biến ở các dự án cũ (CRA, Next cũ); cần `babel-jest`/`ts-jest` để chạy TS/ESM.
- Ý hay khi trả lời: "Kiến thức chuyển qua lại gần như 1:1, khác biệt chủ yếu nằm ở config."

### 3. Triết lý của Testing Library
> "The more your tests resemble the way your software is used, the more confidence they can give you."
- Test **hành vi** người dùng thấy, **không** test implementation (state, tên hàm nội bộ). Nhờ vậy refactor không làm vỡ test.
- **Thứ tự ưu tiên query**: `getByRole` > `getByLabelText` > `getByPlaceholderText` > `getByText` > ... > `getByTestId` (cách cuối cùng). Query theo role/label còn tiện thể kiểm tra luôn accessibility.
- **getBy / queryBy / findBy**:
  - `getBy*`: tìm đồng bộ, **throw** nếu không thấy
  - `queryBy*`: trả về `null` nếu không thấy → dùng để assert *không tồn tại*
  - `findBy*`: trả về Promise, **tự retry** → dùng cho UI async (sau khi fetch xong)
- **`userEvent` và `fireEvent`**: `userEvent` mô phỏng đầy đủ chuỗi sự kiện thật (focus, keydown, input, keyup, click...), nên ưu tiên dùng. `fireEvent` chỉ bắn đúng một event.
- `@testing-library/jest-dom` bổ sung matcher: `toBeInTheDocument`, `toHaveValue`, `toBeChecked`, `toHaveTextContent`, ...

### 4. Mocking
- `vi.fn()`: tạo hàm giả để kiểm tra callback (`toHaveBeenCalledWith`). Xem `TodoForm.test.tsx`.
- `vi.spyOn(globalThis, 'fetch')`: giả lập network trong unit/component test. Xem `App.test.tsx`.
- `vi.mock('./module')`: mock cả một module.
- Dự án lớn thường dùng **MSW (Mock Service Worker)** để mock ở tầng network; cùng một bộ handler dùng được cho cả test lẫn dev.
- Nhớ `vi.restoreAllMocks()` trong `afterEach` để các test không ảnh hưởng nhau.

### 5. Playwright — những điểm hay bị hỏi
- **Auto-waiting**: action (`click`, `fill`) tự chờ phần tử visible, enabled và stable. **Web-first assertions** (`await expect(locator).toBeVisible()`) tự retry đến khi timeout → **không bao giờ dùng `waitForTimeout`/sleep**.
- **Locator** (`page.getByRole`, `getByLabel`, `getByText`, `getByTestId`) là lazy: mỗi lần dùng lại tìm phần tử mới → tránh lỗi element bị "stale".
- **Isolation**: mỗi test có một `BrowserContext` mới (cookie/storage sạch) → các test chạy song song an toàn.
- **Network mocking**: `page.route()` + `route.fulfill()` để giả lỗi 500 hoặc dữ liệu đặc biệt (xem 2 test cuối trong `e2e/todo.spec.ts`).
- **Đa trình duyệt**: `projects` trong config (chromium, firefox, webkit, mobile viewport).
- **Debug**: `--ui`, `--debug` (Playwright Inspector), **Trace Viewer** (`trace: 'on-first-retry'` ghi lại DOM, network, console của từng bước), `codegen` để sinh code.
- **`webServer`** trong config: tự khởi động app trước khi chạy test.
- **Auth**: đăng nhập một lần trong *setup project*, lưu `storageState` ra file, các test sau dùng lại → không phải login ở mỗi test.
- **Page Object Model (POM)**: gom locator và action của một trang vào một class để tái sử dụng, giảm trùng lặp khi số test tăng lên.

### 6. Flaky test: nguyên nhân và cách xử lý
- Nguyên nhân: dùng sleep cố định, phụ thuộc thứ tự test, dữ liệu dùng chung giữa các test, network thật chập chờn, animation.
- Cách xử lý: dùng web-first assertion, mỗi test tự tạo dữ liệu riêng, mock các API bên thứ ba, bật `retries` trên CI kèm trace để tìm nguyên nhân gốc (retry không phải là cách sửa).

### 7. CI/CD
- Chạy test trên mỗi PR, đặt branch protection để chặn merge khi test đỏ.
- Cache `npm` (`setup-node` với `cache: npm`), chạy song song các job, dùng **sharding** khi bộ E2E lớn (`--shard=1/4`).
- Luôn upload Playwright report/trace làm artifact khi fail để debug được.
- Chỉ deploy khi mọi job test pass (`needs:`).

### Câu trả lời mẫu: "Kể về kinh nghiệm testing của bạn"
> "Tôi viết unit test bằng Vitest cho các logic thuần như validation, filter, dùng `it.each` cho các test dạng bảng dữ liệu. Với component, tôi dùng React Testing Library: query theo role/label, tương tác bằng `userEvent` và assert những gì người dùng nhìn thấy chứ không assert state nội bộ. Khi có gọi API, tôi mock `fetch` (hoặc dùng MSW) để test cả trạng thái loading, success và error. Với E2E, tôi dùng Playwright cho các luồng chính, tận dụng auto-waiting và web-first assertion để tránh flaky, và dùng `page.route` để giả lập lỗi server. Tất cả chạy trên GitHub Actions ở mỗi PR; job E2E upload trace khi fail, và app chỉ deploy khi mọi test đều xanh."
