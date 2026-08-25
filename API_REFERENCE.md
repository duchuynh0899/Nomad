# Nomad Backend — API Reference cho Frontend

Tài liệu này mô tả toàn bộ API hiện có của `nomad-backend` (NestJS + MongoDB) để đội FE tích hợp. Copy file này sang repo FE làm nguồn tham chiếu.

## 1. Thông tin chung

- **Base URL**: `http://localhost:4000` (dev) — đổi theo `PORT`/domain thật khi deploy. Không có global prefix (không có `/api`), gọi thẳng `/auth/login`, `/products`, ...
- **Content-Type**: `application/json` cho mọi request trừ upload ảnh (`multipart/form-data`).
- **CORS**: backend chỉ chấp nhận origin khai báo trong `FRONTEND_URL` (server-side, phân tách bằng dấu phẩy nếu nhiều domain) và bắt buộc `credentials: true`. FE phải gọi API với:
  - `fetch(url, { credentials: 'include' })`, hoặc
  - `axios.create({ withCredentials: true })`
- **Không có global versioning/prefix.**

## 2. Xác thực (Auth)

- **Access token**: trả về trong JSON response (`accessToken`), FE tự lưu (memory/localStorage) và gắn vào mọi request cần đăng nhập:
  `Authorization: Bearer <accessToken>`
- **Refresh token**: backend set qua cookie `refresh_token` — `HttpOnly`, `Secure` (production), `SameSite=Lax`, **`path=/auth`** (chỉ tự động gửi kèm khi gọi các endpoint dưới `/auth/*`). FE **không đọc được** cookie này (HttpOnly) và không cần tự quản lý nó, chỉ cần luôn gọi `/auth/*` với `credentials: 'include'`.
- **Access token hết hạn sau `JWT_ACCESS_EXPIRES_IN` giây (mặc định 900s = 15 phút).** FE nên tự động gọi `POST /auth/refresh` khi nhận `401` để lấy access token mới, sau đó retry request gốc. Nếu `/auth/refresh` cũng trả `401` → coi như phiên hết hạn, điều hướng về trang login.
- Mỗi lần refresh sẽ **rotate** token (refresh token cũ bị thu hồi ngay), token cũ dùng lại sẽ bị từ chối — không nên gọi `/auth/refresh` song song nhiều lần.
- Đổi mật khẩu / reset mật khẩu sẽ thu hồi toàn bộ session cũ (đăng xuất tất cả thiết bị).
- **Có OAuth Google/Facebook** — nhưng backend **không tự làm redirect flow / callback URL**. Kiến trúc là "verify token": FE tự tích hợp SDK của Google/Facebook ở phía client để lấy token, rồi gửi token đó lên backend để backend tự xác minh với Google/Facebook (xem mục 2.1).

### Endpoints

| Method | Path | Auth | Rate limit | Mô tả |
| --- | --- | --- | --- | --- |
| POST | `/auth/register` | – | 5/phút | Đăng ký, tự động đăng nhập |
| POST | `/auth/login` | – | 10/phút | Đăng nhập |
| POST | `/auth/google` | – | 10/phút | Đăng nhập/đăng ký bằng Google |
| POST | `/auth/facebook` | – | 10/phút | Đăng nhập/đăng ký bằng Facebook |
| POST | `/auth/refresh` | cookie `refresh_token` | – | Lấy access token mới |
| POST | `/auth/logout` | cookie `refresh_token` | – | Thu hồi refresh token, xoá cookie |
| POST | `/auth/change-password` | Bearer | – | Đổi mật khẩu khi đã đăng nhập |
| POST | `/auth/forgot-password` | – | 5/phút | Gửi email reset password |
| POST | `/auth/reset-password` | – | 5/phút | Đặt lại mật khẩu bằng token trong email |

### 2.1. Đăng nhập Google / Facebook

**Kiến trúc: FE tự lấy token từ SDK, backend chỉ verify token.** Backend **không có** endpoint redirect/callback kiểu `/auth/google/redirect`. Lý do: đây là REST API thuần cho SPA/mobile, không phải server render — flow "verify token" đơn giản hơn nhiều và không cần cấu hình redirect URI phức tạp theo từng môi trường (dev/staging/prod).

**Google — dùng [Google Identity Services](https://developers.google.com/identity/gsi/web) ở FE:**
1. FE nhúng script Google, lấy `idToken` (một JWT) sau khi người dùng chọn tài khoản Google. **Không dùng `access_token` của Google cho endpoint này — bắt buộc phải là `idToken` (ID token / credential).**
2. FE gọi `POST /auth/google` với `idToken` đó.
3. Backend verify chữ ký + `audience` (phải khớp `GOOGLE_CLIENT_ID`) + bắt buộc `email_verified = true` bằng thư viện `google-auth-library`, KHÔNG tin bất kỳ field nào FE tự khai ngoài token.

```json
// Request
{ "idToken": "eyJhbGciOiJSUzI1NiIs..." }
// Response 200 — giống hệt response của /auth/login
{
  "user": { "id": "665f...", "name": "Nguyen Van A", "email": "a@gmail.com", "role": "customer" },
  "accessToken": "eyJhbGciOi..."
}
```
Cookie `refresh_token` cũng được set kèm y như login thường — FE xử lý y hệt luồng login email/password sau bước này (cùng access token, cùng refresh flow).

**Facebook — dùng [Facebook Login JavaScript SDK](https://developers.facebook.com/docs/facebook-login/web) ở FE:**
1. FE gọi `FB.login()` xin quyền `email`, lấy `accessToken` từ SDK.
2. FE gọi `POST /auth/facebook` với `accessToken` đó.
3. Backend verify token bằng Graph API `debug_token` (xác nhận token thuộc đúng app, dùng `FACEBOOK_APP_ID`/`FACEBOOK_APP_SECRET`) rồi lấy `id`/`name`/`email` qua `/me`.

```json
// Request
{ "accessToken": "EAAB..." }
// Response 200 — giống hệt /auth/login
```
**Lưu ý:** nếu tài khoản Facebook của người dùng không có email đã xác minh (hoặc không cấp quyền `email`), backend trả `401` — FE nên hiển thị thông báo yêu cầu người dùng cấp quyền email hoặc dùng cách đăng nhập khác.

**Hành vi gộp tài khoản (auto-merge):**
- Nếu email từ Google/Facebook **trùng với tài khoản đã đăng ký bằng mật khẩu** (hoặc đã liên kết provider khác) → tự động gộp vào tài khoản đó, **không tạo tài khoản mới, không đổi mật khẩu/role hiện có**. Người dùng có thể đăng nhập bằng cả email/password lẫn nút Google/Facebook sau đó.
- Nếu email chưa từng tồn tại → tạo tài khoản `customer` mới, không có mật khẩu (tài khoản "OAuth-only"). Người dùng này vẫn dùng được `POST /auth/forgot-password` để tự đặt mật khẩu lần đầu nếu muốn đăng nhập bằng email/password sau này.
- Lỗi có thể gặp: `401` (token không hợp lệ/hết hạn/email chưa xác minh/tài khoản đã bị khoá), `503` (`GOOGLE_CLIENT_ID`/`FACEBOOK_APP_ID`/`FACEBOOK_APP_SECRET` chưa được cấu hình ở backend — hỏi admin backend nếu gặp lỗi này ở production).

**POST `/auth/register`**
```json
// Request
{ "name": "Nguyen Van A", "email": "a@example.com", "password": "Abcd1234" }
```
Ràng buộc: `name` 2–100 ký tự · `email` hợp lệ · `password` 8–72 ký tự, phải có chữ hoa + chữ thường + số.
Role luôn bị ép về `customer` — **không thể tự đăng ký làm admin**, field `role` trong body sẽ bị từ chối (whitelist strict → 400 nếu gửi field lạ).

```json
// Response 201
{
  "user": { "id": "665f...", "name": "Nguyen Van A", "email": "a@example.com", "role": "customer" },
  "accessToken": "eyJhbGciOi..."
}
```
Cookie `refresh_token` được set kèm theo (không nằm trong JSON body).

**POST `/auth/login`** — body `{ email, password }` → response 200 giống register.

**POST `/auth/refresh`** — không cần body, cookie tự gửi kèm → response 200 giống register (access token + user mới).

**POST `/auth/logout`** — không cần body → 204 No Content.

**POST `/auth/change-password`** — cần Bearer token.
```json
{ "currentPassword": "Abcd1234", "newPassword": "Newpass123" }
```
→ 204. Mật khẩu mới phải khác mật khẩu hiện tại (409 nếu trùng).

**POST `/auth/forgot-password`** — body `{ "email": "a@example.com" }` → luôn trả `202` kèm message chung chung, **không tiết lộ email có tồn tại hay không** (bảo mật). FE hiển thị thông báo "nếu email tồn tại, hướng dẫn đã được gửi" bất kể kết quả thật.

**POST `/auth/reset-password`** — body `{ "token": "...", "password": "Newpass123" }` (token lấy từ query string `?token=` trong link email, xem `FRONTEND_URL` + `/reset-password?token=...`) → 204. Token dùng một lần, hết hạn sau `RESET_PASSWORD_EXPIRES_IN` giây (mặc định 900s).

## 3. Users

| Method | Path | Auth | Mô tả |
| --- | --- | --- | --- |
| GET | `/users/me` | Bearer | Lấy thông tin bản thân |
| PATCH | `/users/me` | Bearer | Sửa `name`, `phone` |
| GET | `/admin/users` | Bearer + admin | Danh sách, hỗ trợ `search`, `role`, `page`, `limit` |
| GET | `/admin/users/:id` | Bearer + admin | Chi tiết 1 user |
| PATCH | `/admin/users/:id` | Bearer + admin | Sửa `role` (`admin`\|`customer`), `isActive` |

`PATCH /users/me` body: `{ "name"?: string, "phone"?: string }` (phone dạng `+84901234567` hoặc `0901234567`).

Admin không thể tự hạ quyền/khoá chính mình (409).

User object trả về **không bao giờ chứa** `password`, `resetPasswordTokenHash`, `resetPasswordExpiresAt`, `authVersion` (bị strip ở tầng schema).

```json
{
  "_id": "665f...",
  "name": "Nguyen Van A",
  "email": "a@example.com",
  "role": "customer",
  "phone": "0901234567",
  "isActive": true,
  "createdAt": "...",
  "updatedAt": "..."
}
```

## 4. Danh mục (Categories)

| Method | Path | Auth | Mô tả |
| --- | --- | --- | --- |
| GET | `/categories` | – | Danh sách danh mục đang active |
| GET | `/categories/:idOrSlug` | – | Chi tiết theo `_id` hoặc `slug`, chỉ trả active |
| GET | `/admin/categories` | admin | Toàn bộ danh mục (kể cả ẩn) |
| POST | `/admin/categories` | admin | Tạo mới |
| PATCH | `/admin/categories/:id` | admin | Sửa |
| DELETE | `/admin/categories/:id` | admin | Xoá cứng — chỉ được nếu **không còn sản phẩm** nào thuộc danh mục |

Body tạo/sửa:
```json
{ "name": "Giày", "slug": "giay", "description": "...", "isActive": true }
```
`slug` bắt buộc dạng kebab-case (`^[a-z0-9]+(?:-[a-z0-9]+)*$`). Không thể set `isActive: false` nếu danh mục đang có sản phẩm active (409).

## 5. Sản phẩm (Products)

| Method | Path | Auth | Mô tả |
| --- | --- | --- | --- |
| GET | `/products` | – | List public, chỉ sản phẩm active thuộc danh mục active |
| GET | `/products/:idOrSlug` | – | Chi tiết |
| GET | `/admin/products` | admin | List tất cả (kể cả đã ẩn) |
| POST | `/admin/products` | admin | Tạo |
| PATCH | `/admin/products/:id` | admin | Sửa |
| DELETE | `/admin/products/:id` | admin | Soft delete (`isActive=false`) |
| POST | `/admin/products/bulk-sale` | admin | Đặt giảm giá % cho nhiều sản phẩm cùng lúc |
| POST | `/admin/products/bulk-sale/clear` | admin | Gỡ giảm giá hàng loạt |

### Query params `GET /products` (và `/admin/products`)

| Param | Kiểu | Ghi chú |
| --- | --- | --- |
| `page`, `limit` | number | mặc định `page=1`, `limit=20`, `limit` tối đa 100 |
| `search` | string | full-text search trên `name` + `information` |
| `category` | ObjectId | lọc theo danh mục |
| `minPrice`, `maxPrice` | number | lọc theo giá |
| `color` | string | khớp `variants.color` (lowercase) |
| `size` | string | khớp `variants.size` (uppercase) |
| `isBestSeller` | boolean (`true`/`false`) | |
| `onSale` | boolean (`true`/`false`) | chỉ trả sản phẩm đang trong khung giờ giảm giá (`salePrice` tồn tại và thời điểm hiện tại nằm trong `saleStartAt`–`saleEndAt`) |
| `sort` | `newest`\|`price-asc`\|`price-desc`\|`name-asc` | mặc định `newest` — **sắp xếp theo `price` gốc, không theo `effectivePrice`** |

### Product object
```json
{
  "_id": "665f...",
  "name": "Nomad Runner",
  "slug": "nomad-runner",
  "price": 100,
  "originalPrice": 120,
  "salePrice": 80,
  "saleStartAt": "2026-08-25T00:00:00.000Z",
  "saleEndAt": "2026-08-26T00:00:00.000Z",
  "effectivePrice": 80,
  "isOnSale": true,
  "category": { "_id": "...", "name": "Giày", "slug": "giay" },
  "images": [{ "url": "https://...", "publicId": "nomad/xyz", "alt": "..." }],
  "colors": [{ "name": "Black", "slug": "black", "hex": "#000000" }],
  "variants": [
    { "_id": "665f...", "sku": "NMD-BLK-40", "color": "black", "size": "40", "stock": 5 }
  ],
  "information": "<p>HTML đã được sanitize (xss-filter), an toàn để render trực tiếp</p>",
  "isBestSeller": false,
  "isActive": true,
  "createdAt": "...",
  "updatedAt": "..."
}
```
`information` đã qua XSS sanitize ở backend (whitelist thẻ HTML cơ bản + `img`) — FE có thể `dangerouslySetInnerHTML` / `v-html` trực tiếp mà không cần sanitize lại.

**Giá hiển thị — dùng `effectivePrice`, không dùng `price`:** `effectivePrice` là giá **thực sự sẽ tính tiền lúc checkout** — bằng `salePrice` nếu `isOnSale: true` (đang trong khung giờ sale), ngược lại bằng `price`. FE nên hiển thị `effectivePrice` làm giá chính, và nếu `isOnSale: true` thì hiển thị thêm `price` gạch ngang bên cạnh (khác với `originalPrice`, vốn chỉ là giá tham chiếu tĩnh admin tự nhập, không liên quan đến sale). `salePrice`/`saleStartAt`/`saleEndAt`/`effectivePrice`/`isOnSale` chỉ xuất hiện khi sản phẩm có cấu hình sale (thiếu thì coi như không sale).

### Tạo/sửa sản phẩm (admin)
```json
{
  "name": "Nomad Runner",
  "slug": "nomad-runner",
  "price": 100,
  "originalPrice": 120,
  "salePrice": 80,
  "saleStartAt": "2026-08-25T00:00:00.000Z",
  "saleEndAt": "2026-08-26T00:00:00.000Z",
  "category": "665f...",
  "images": [{ "url": "https://...", "publicId": "nomad/xyz", "alt": "..." }],
  "colors": [{ "name": "Black", "slug": "black", "hex": "#000000" }],
  "variants": [{ "sku": "NMD-BLK-40", "color": "black", "size": "40", "stock": 5 }],
  "information": "<p>...</p>",
  "isBestSeller": false,
  "isActive": true
}
```
`salePrice`/`saleStartAt`/`saleEndAt` đều tuỳ chọn, nhưng nếu gửi `salePrice` thì **bắt buộc** gửi kèm cả `saleStartAt` và `saleEndAt` (400 nếu thiếu), `saleEndAt` phải sau `saleStartAt`, và `salePrice` phải nhỏ hơn `price` — tất cả validate ở backend. Muốn gỡ sale sớm (trước `saleEndAt`), gọi `POST /admin/products/bulk-sale/clear` với `productIds: ["<id>"]` (xem bên dưới) — PATCH thường không có cách "xoá" 1 field, chỉ ghi đè.

**⚠️ Quan trọng khi PATCH variants:** khi sửa sản phẩm và gửi lại mảng `variants`, mỗi variant hiện có phải giữ đúng `_id` cũ (field `id` trong payload) — nếu không gửi `id`, backend cố khớp theo `sku` để giữ ID; nếu SKU cũng đổi thì bị coi là **xoá variant**, mà **variant đã tồn tại (đã từng có đơn hàng) không được phép xoá** → trả `409`. Muốn "xoá" variant, đặt `stock: 0` thay vì bỏ nó khỏi mảng.
```json
{
  "variants": [
    { "id": "665f...", "sku": "NMD-BLK-40", "color": "black", "size": "40", "stock": 3 },
    { "sku": "NMD-BLK-42", "color": "black", "size": "42", "stock": 0 }
  ]
}
```
Có thể cập nhật đồng thời nhiều field khác, không cần gửi toàn bộ object (PATCH là partial update).

### Giảm giá hàng loạt (flash sale)

**POST `/admin/products/bulk-sale`**
```json
{
  "percentOff": 20,
  "startAt": "2026-08-25T00:00:00.000Z",
  "endAt": "2026-08-26T00:00:00.000Z",
  "categoryId": "665f..."
}
```
- Chọn **đúng 1** trong 2: `categoryId` (áp dụng cho mọi sản phẩm thuộc danh mục đó) hoặc `productIds: string[]` (danh sách sản phẩm cụ thể, tối đa 500) — gửi cả hai hoặc không gửi gì đều bị `400`.
- `percentOff`: 1–90.
- `salePrice` được tính **riêng cho từng sản phẩm** dựa trên `price` hiện tại của chính nó tại thời điểm chạy (vd. `percentOff: 20` trên sản phẩm giá 100 → `salePrice: 80`, sản phẩm giá 250 → `salePrice: 200`), không phải một mức giá chung.
- Response: `{ "matched": 12, "modified": 12 }`.

**POST `/admin/products/bulk-sale/clear`** — body giống hệt (chọn `productIds` hoặc `categoryId`), gỡ `salePrice`/`saleStartAt`/`saleEndAt` khỏi các sản phẩm khớp. Dùng để huỷ sale sớm hơn dự kiến, hoặc dọn sale đã hết hạn (backend không tự dọn — sản phẩm hết hạn chỉ đơn giản không còn `isOnSale: true`/không xuất hiện ở `onSale=true`, dữ liệu `salePrice` cũ vẫn còn trên bản ghi cho tới khi bị gỡ hoặc ghi đè bằng một đợt sale mới).

## 6. Upload ảnh

| Method | Path | Auth | Mô tả |
| --- | --- | --- | --- |
| POST | `/admin/uploads/images` | admin | Upload 1 ảnh lên Cloudinary |
| DELETE | `/admin/uploads/images` | admin | Xoá ảnh trên Cloudinary |

**POST** — `multipart/form-data`, field tên `file`, tối đa **5MB**, chỉ nhận `image/*`.
```json
// Response 201
{ "url": "https://res.cloudinary.com/.../image.jpg", "publicId": "nomad/xyz", "width": 800, "height": 600, "format": "jpg" }
```
Dùng `url` + `publicId` này để điền vào `images[]` khi tạo/sửa sản phẩm.

**DELETE** — body `{ "publicId": "nomad/xyz" }` → `{ "success": true }`.

## 7. Giỏ hàng / Đặt hàng (COD + PayOS)

Giỏ hàng **không có ở backend** — FE tự quản lý giỏ hàng ở client (localStorage/state), chỉ gửi lên backend khi checkout. Giá, phí ship, giảm giá, tổng tiền đều **tính lại 100% ở backend** — FE gửi `price` trong item sẽ bị từ chối (400, whitelist strict). `unitPrice` của từng dòng trong đơn là `effectivePrice` tại đúng thời điểm đặt hàng (đã áp giảm giá sale nếu sản phẩm đang trong khung giờ sale) — FE nên hiển thị giỏ hàng theo `effectivePrice` để khớp với số tiền thực tế lúc thanh toán, tránh trường hợp giỏ hàng hiện giá gốc rồi checkout ra giá khác làm khách hoang mang.

| Method | Path | Auth | Mô tả |
| --- | --- | --- | --- |
| POST | `/orders` | Bearer | Checkout, tạo đơn |
| GET | `/orders` | Bearer | Danh sách đơn của tôi, hỗ trợ `status` |
| GET | `/orders/:id` | Bearer | Chi tiết đơn (chỉ đơn của mình) |
| PATCH | `/orders/:id/cancel` | Bearer | Huỷ đơn (chỉ khi đang `pending`) |
| POST | `/orders/:id/pay` | Bearer | Tạo/tạo lại link thanh toán PayOS cho đơn `payos` chưa trả tiền |

**POST `/orders`**
```json
{
  "items": [
    { "productId": "665f...", "variantId": "665f...", "quantity": 2 }
  ],
  "shippingAddress": {
    "recipientName": "Nguyen Van A",
    "phone": "0901234567",
    "addressLine": "123 Main Street",
    "ward": "Phường 1",
    "district": "Quận 1",
    "province": "Ho Chi Minh City"
  },
  "note": "Giao giờ hành chính",
  "couponCode": "SALE10",
  "paymentMethod": "payos"
}
```
- `items`: 1–50 dòng, `quantity` mỗi dòng 1–100 (nếu trùng `productId+variantId` sẽ tự gộp, tổng không quá 100).
- `note` tối đa 1000 ký tự — tuỳ chọn.
- `couponCode` — tuỳ chọn, xem mục Coupons bên dưới.
- `paymentMethod` — tuỳ chọn, `"cod"` (mặc định) hoặc `"payos"`.
- `province` phải khớp đúng chuỗi đã cấu hình ở `provinceFees` (xem mục Shipping) để nhận phí ship theo tỉnh, nếu không sẽ dùng phí mặc định.

```json
// Response 201 — Order object (paymentMethod: "cod")
{
  "_id": "665f...",
  "orderNumber": "NMD-M1X2Y3-AB12CD",
  "user": "665f...",
  "items": [
    {
      "product": "665f...", "variantId": "665f...", "name": "Nomad Runner", "slug": "nomad-runner",
      "image": "https://...", "sku": "NMD-BLK-40", "color": "black", "size": "40",
      "unitPrice": 100, "quantity": 2, "lineTotal": 200
    }
  ],
  "shippingAddress": { "...": "..." },
  "note": "Giao giờ hành chính",
  "subtotal": 200,
  "shippingFee": 15000,
  "couponCode": "SALE10",
  "discount": 20,
  "total": 15180,
  "paymentMethod": "cod",
  "paymentStatus": "unpaid",
  "refundStatus": "none",
  "status": "pending",
  "createdAt": "...",
  "updatedAt": "..."
}
```
Lỗi thường gặp khi checkout: `409` sản phẩm/biến thể không đủ tồn kho hoặc đã ẩn, `400` biến thể không hợp lệ, `400` coupon không hợp lệ/hết lượt/hết hạn/chưa đạt `minOrderValue`.

**State machine** của `status`:
```
pending -> confirmed -> shipping -> delivered
pending -> cancelled
confirmed -> cancelled (chỉ admin)
```
Khách hàng **chỉ huỷ được đơn đang `pending`**. Khi chuyển sang `delivered`, `paymentStatus` tự động thành `paid` (COD). Huỷ đơn sẽ hoàn tồn kho và hoàn lượt dùng coupon (nếu có) tự động.

**Email thông báo đơn hàng:** backend tự gửi email cho khách (xác nhận khi tạo đơn, cập nhật mỗi khi đổi trạng thái kể cả huỷ) — FE **không cần tự gửi email này**. Chỉ gửi được nếu đơn có gắn tài khoản (`user`); đơn khách vãng lai do admin tạo (không `userId`) sẽ không có email nào được gửi vì backend không lưu email trong `shippingAddress`. Nếu Resend chưa cấu hình (`RESEND_API_KEY`) hoặc gửi lỗi, backend chỉ log cảnh báo — không ảnh hưởng đến kết quả request tạo/đổi trạng thái đơn, FE không cần xử lý gì thêm cho trường hợp này.

### 7.1. Thanh toán online PayOS

Tồn kho vẫn bị trừ ngay lúc tạo đơn (giống hệt COD, không đợi thanh toán xong). Khi `paymentMethod: "payos"`, response `POST /orders` có thêm field `payment`:

```json
// Response 201 — Order object + payment (paymentMethod: "payos")
{
  "_id": "665f...",
  "orderNumber": "NMD-M1X2Y3-AB12CD",
  "paymentMethod": "payos",
  "paymentStatus": "unpaid",
  "status": "pending",
  "total": 15180,
  "payment": {
    "checkoutUrl": "https://pay.payos.vn/web/xxxxxxxxxxxx",
    "qrCode": "00020101021238570010A00000072701...",
    "paymentLinkId": "abc123...",
    "orderCode": 1735000000123,
    "expiredAt": 1735000900
  },
  "...": "..."
}
```
- FE điều hướng khách sang `payment.checkoutUrl` (redirect hoặc mở tab mới), hoặc tự render QR từ chuỗi `payment.qrCode` (dùng thư viện QR code phía client, đây là raw VietQR payload chứ không phải URL ảnh).
- `payment.expiredAt` là Unix timestamp (giây) — link hết hạn sau **15 phút** kể từ lúc tạo. FE nên đếm ngược và nhắc khách hoàn tất trước khi hết hạn.
- **Nếu tạo link thất bại lúc checkout** (PayOS lỗi mạng, chưa cấu hình...), đơn **vẫn được tạo bình thường** (tồn kho vẫn bị trừ) nhưng response **không có field `payment`**. FE phải kiểm tra `if (!response.payment)` và hiển thị nút "Thử tạo lại link thanh toán" gọi sang `POST /orders/:id/pay`.
- Sau khi khách thanh toán xong ở trang PayOS, PayOS redirect khách về `${FRONTEND_URL}/orders/:id/payment-result?status=success` (thành công) hoặc `...?status=cancel` (huỷ) — **route này FE phải tự tạo**. Khi tới trang đó, gọi `GET /orders/:id` để lấy `paymentStatus` mới nhất (đã được cập nhật qua webhook ở backend, không cần FE tự xác nhận thanh toán).
- **`paymentStatus` chuyển `paid` hoàn toàn qua webhook phía backend** (PayOS gọi thẳng vào server, không qua FE) — thường mất vài giây sau khi khách bấm thanh toán xong. Nếu FE poll `GET /orders/:id` ngay sau khi redirect mà chưa thấy `paid`, nên tự retry vài lần (vd. mỗi 2 giây, tối đa ~15 giây) trước khi báo lỗi.
- Thanh toán thành công **không tự động đổi `status`** — đơn vẫn ở `pending` chờ admin xác nhận/giao hàng như COD, chỉ có `paymentStatus` là khác (`paid` ngay từ đầu thay vì đến lúc `delivered`).

**POST `/orders/:id/pay`** — tạo lại link thanh toán (vd. link cũ hết hạn, hoặc lần đầu tạo link bị lỗi). Không cần body.
```json
// Response 201
{ "order": { "...": "..." }, "payment": { "checkoutUrl": "...", "qrCode": "...", "paymentLinkId": "...", "orderCode": 123, "expiredAt": 123 } }
```
Lỗi: `400` nếu đơn không dùng `payos`, `409` nếu đơn đã thanh toán hoặc đã bị huỷ. Gọi lại nhiều lần sẽ tự huỷ link cũ và phát hành link mới — link cũ (nếu khách đang mở) sẽ không dùng được nữa sau khi gọi endpoint này.

## 8. Coupons (mã giảm giá)

| Method | Path | Auth | Mô tả |
| --- | --- | --- | --- |
| GET | `/coupons/featured` | – (public) | Danh sách mã đang khuyến mãi công khai, dùng để hiển thị banner |
| POST | `/coupons/validate` | – (public) | Xem trước số tiền giảm, KHÔNG trừ lượt dùng |
| GET | `/admin/coupons` | admin | Danh sách, hỗ trợ `isActive`, `page`, `limit` |
| POST | `/admin/coupons` | admin | Tạo |
| PATCH | `/admin/coupons/:id` | admin | Sửa |
| DELETE | `/admin/coupons/:id` | admin | Xoá cứng |

**GET `/coupons/featured`** — dùng cho banner khuyến mãi động ở trang chủ/trang danh mục: FE gọi endpoint này để tự lấy danh sách mã đang chạy, **không cần hardcode mã hay sửa code FE mỗi khi admin đổi/thêm coupon mới** — chỉ cần admin bật `isPublic: true` khi tạo/sửa coupon là banner tự cập nhật.
```json
// Response 200 — mảng, không phân trang, tối đa 20 phần tử, mới nhất trước
[
  {
    "code": "SALE10",
    "type": "percent",
    "value": 10,
    "maxDiscount": 50000,
    "minOrderValue": 100000,
    "expiresAt": "2026-12-31T23:59:59.000Z"
  }
]
```
Chỉ trả về coupon thoả **đồng thời cả 4 điều kiện**: `isPublic: true`, `isActive: true`, chưa tới `expiresAt` (hoặc không set), và `usedCount < usageLimit` (hoặc không set `usageLimit`) — tức là mã hết hạn hoặc hết lượt dùng sẽ tự động biến mất khỏi banner mà admin không cần vào xoá/ẩn thủ công. Response **không có** `usedCount`/`usageLimit`/`isPublic`/`isActive` (không cần thiết cho việc hiển thị banner) — muốn hiển thị "chỉ còn N lượt" thì hiện chưa có, cần thì báo lại để bổ sung field vào response.

**POST `/coupons/validate`** — dùng để hiển thị số tiền giảm ngay ở trang giỏ hàng trước khi bấm đặt hàng (khách tự nhập mã, không nhất thiết phải là mã lấy từ `/coupons/featured`):
```json
// Request
{ "code": "SALE10", "subtotal": 200000 }
// Response 200
{ "code": "SALE10", "discount": 20000 }
// hoặc 400 nếu không hợp lệ/hết hạn/chưa đạt minOrderValue/hết lượt dùng
```
Lượt dùng thật sự chỉ bị trừ khi tạo đơn (`POST /orders` với `couponCode`) — gọi `/coupons/validate` bao nhiêu lần cũng không tốn lượt. Endpoint này **không đòi hỏi coupon phải `isPublic: true`** — mã riêng gửi cho từng khách (`isPublic: false`) vẫn validate/áp dụng được bình thường, chỉ là không xuất hiện ở `/coupons/featured`.

**Tạo coupon (admin)**
```json
{
  "code": "SALE10",
  "type": "percent",
  "value": 10,
  "maxDiscount": 50000,
  "minOrderValue": 100000,
  "usageLimit": 100,
  "expiresAt": "2026-12-31T23:59:59.000Z",
  "isActive": true,
  "isPublic": true
}
```
- `type`: `"percent"` (value = %, tối đa 100, có thể set `maxDiscount` để chặn trần) hoặc `"fixed"` (value = số tiền giảm thẳng, VND).
- `isPublic` (mặc định `false`) — bật để mã hiện ở `GET /coupons/featured` (banner công khai). Tắt (hoặc để mặc định) cho mã riêng/mã gửi tay từng khách — vẫn dùng được bình thường qua `/coupons/validate` và checkout, chỉ không lên banner.
- Tất cả field trừ `code`, `type`, `value` đều tuỳ chọn.
- `code` tự động uppercase khi lưu và khi áp dụng (FE gửi hoa/thường đều được).

## 9. Cấu hình phí vận chuyển (Shipping Settings)

| Method | Path | Auth | Mô tả |
| --- | --- | --- | --- |
| GET | `/admin/settings/shipping` | admin | Xem cấu hình hiện tại |
| PATCH | `/admin/settings/shipping` | admin | Cập nhật |

```json
{
  "defaultFee": 20000,
  "freeShippingThreshold": 500000,
  "provinceFees": [
    { "province": "Ho Chi Minh City", "fee": 15000 },
    { "province": "Ha Noi", "fee": 25000 }
  ]
}
```
Logic tính phí ship khi checkout: nếu `subtotal >= freeShippingThreshold` → phí = 0; nếu không, khớp `shippingAddress.province` (không phân biệt hoa/thường) với `provinceFees` → dùng phí riêng nếu có, ngược lại dùng `defaultFee`. **Chưa cấu hình gì → phí ship mặc định = 0.** FE nên có trang admin để nhập tỉnh/thành trùng khớp chính xác với danh sách tỉnh dùng ở form địa chỉ, tránh sai chính tả khiến không khớp fee.

## 10. Đơn hàng — Admin

| Method | Path | Auth | Mô tả |
| --- | --- | --- | --- |
| GET | `/admin/orders` | admin | Danh sách + filter |
| GET | `/admin/orders/export` | admin | Xuất CSV (cùng filter với list) |
| GET | `/admin/orders/:id` | admin | Chi tiết (có populate `user`) |
| POST | `/admin/orders` | admin | Tạo đơn thủ công (phone/Zalo order) |
| PATCH | `/admin/orders/:id/status` | admin | Đổi trạng thái |
| PATCH | `/admin/orders/:id/refund` | admin | Đánh dấu đơn đã hoàn tiền thủ công |

### Filter cho `GET /admin/orders` (và `/export`)

| Param | Ghi chú |
| --- | --- |
| `status` | `pending`\|`confirmed`\|`shipping`\|`delivered`\|`cancelled` |
| `refundStatus` | `none`\|`pending`\|`refunded` — lọc đơn đang chờ hoàn tiền bằng `refundStatus=pending` |
| `orderNumber` | khớp chính xác (không phân biệt hoa thường) |
| `search` | tìm theo tên hoặc SĐT người nhận (regex, không phân biệt hoa thường) |
| `dateFrom`, `dateTo` | ISO date string, lọc theo `createdAt` |
| `page`, `limit` | phân trang |

`GET /admin/orders/export` trả về file CSV (`Content-Type: text/csv`, có header `Content-Disposition: attachment`), tối đa 10.000 dòng, cột: `orderNumber,createdAt,status,paymentStatus,refundStatus,recipientName,phone,province,district,ward,subtotal,shippingFee,discount,couponCode,total`.

**POST `/admin/orders`** — admin đặt đơn hộ khách (điện thoại/Zalo). Body giống `POST /orders` cộng thêm `userId` tuỳ chọn:
```json
{
  "userId": "665f...",
  "items": [{ "productId": "665f...", "variantId": "665f...", "quantity": 1 }],
  "shippingAddress": { "...": "..." },
  "note": "Đặt qua điện thoại",
  "couponCode": "SALE10"
}
```
- Có `userId` → đơn gắn với tài khoản khách đó, hiện trong `GET /orders` của khách.
- Không gửi `userId` → đơn "khách vãng lai" (`user: null`), **không** hiện trong list của bất kỳ khách hàng nào, chỉ admin xem được qua `GET /admin/orders`.

**PATCH `/admin/orders/:id/status`** — body `{ "status": "confirmed" }` (nhận `confirmed`\|`shipping`\|`delivered`\|`cancelled`, không nhận `pending`). Chuyển trạng thái sai state machine → `409`.

### Hoàn tiền (`refundStatus`)

Mỗi đơn có field `refundStatus`: `"none"` (mặc định, chưa cần hoàn) | `"pending"` (đã thu tiền nhưng đơn bị huỷ, đang chờ admin hoàn tiền) | `"refunded"` (admin đã hoàn xong). Backend **tự động** chuyển `none → pending` khi một đơn đang `paymentStatus: "paid"` bị huỷ (dù khách tự huỷ lúc `pending` hay admin huỷ) — FE không cần tự tính, chỉ cần đọc field này. PayOS không cung cấp API hoàn tiền tự động nên bước chuyển khoản lại cho khách vẫn phải làm thủ công ngoài hệ thống; endpoint dưới đây chỉ để **ghi nhận** là admin đã làm xong.

**PATCH `/admin/orders/:id/refund`**
```json
// Request (note tuỳ chọn)
{ "note": "Đã chuyển khoản hoàn tiền qua Momo, mã GD 123456" }
// Response 200 — Order object với refundStatus: "refunded", refundedAt, refundNote
```
Lỗi: `409` nếu đơn không ở trạng thái `refundStatus: "pending"` (đã hoàn rồi, hoặc chưa từng cần hoàn) — gọi lại 2 lần sẽ báo lỗi ở lần thứ 2, tránh đánh dấu nhầm.

Muốn xem danh sách đơn đang chờ hoàn tiền: `GET /admin/orders?refundStatus=pending`.

## 11. Dashboard (thống kê admin)

| Method | Path | Auth | Mô tả |
| --- | --- | --- | --- |
| GET | `/admin/dashboard/summary` | admin | Tổng quan cho trang admin home |

Query: `days` (mặc định 30, tối đa 365) — phạm vi tính doanh thu/số đơn mới; `lowStockThreshold` (mặc định 5) — ngưỡng cảnh báo sắp hết hàng.

```json
{
  "rangeDays": 30,
  "revenue": 15230000,
  "ordersInRange": 42,
  "ordersByStatus": { "pending": 3, "confirmed": 5, "shipping": 2, "delivered": 30, "cancelled": 2 },
  "bestSellers": [
    { "_id": "665f...", "name": "Nomad Runner", "quantitySold": 58, "revenue": 5800000 }
  ],
  "lowStock": [
    { "_id": "665f...", "name": "Nomad Runner", "sku": "NMD-BLK-41", "color": "black", "size": "41", "stock": 1 }
  ],
  "pendingRefunds": 2
}
```
- `revenue`/`ordersInRange` tính trong `rangeDays` ngày gần nhất, loại trừ đơn `cancelled`.
- `ordersByStatus` là số liệu **toàn thời gian** (không lọc theo `days`) — dùng để hiển thị badge "X đơn đang chờ xử lý" luôn đúng thực tế hiện tại.
- `bestSellers` top 5 theo số lượng bán trong `rangeDays`.
- `lowStock` liệt kê từng **biến thể** (không phải sản phẩm) có `stock <= lowStockThreshold`, tối đa 50 dòng.
- `pendingRefunds` — số liệu **toàn thời gian** (không lọc theo `days`), đếm số đơn đang `refundStatus: "pending"`. Dùng để hiển thị badge nhắc admin còn đơn chưa hoàn tiền, xem chi tiết qua `GET /admin/orders?refundStatus=pending`.

## 12. Health check

`GET /health` — không cần auth. Dùng cho uptime monitor, không phải để FE gọi trong luồng nghiệp vụ.
```json
// 200 khi ổn
{ "status": "ok", "mongo": "up" }
// 503 khi mất kết nối DB
{ "status": "error", "mongo": "down" }
```

## 13. Phân trang (chuẩn dùng chung)

Mọi endpoint list (`products`, `admin/products`, `admin/users`, `admin/orders`, `admin/coupons`, ...) trả cùng 1 shape:
```json
{
  "items": [ /* ... */ ],
  "meta": { "page": 1, "limit": 20, "total": 137, "totalPages": 7 }
}
```
`page` mặc định 1, `limit` mặc định 20 (tối đa 100).

## 14. Định dạng lỗi (chuẩn dùng chung)

Mọi lỗi (validate, business rule, 404, 500...) đều trả về cùng 1 shape JSON:
```json
{
  "statusCode": 400,
  "message": "Email đã được sử dụng",
  "error": "Bad Request",
  "path": "/auth/register",
  "timestamp": "2026-08-25T10:00:00.000Z"
}
```
- Lỗi validate (class-validator) có `message` là **mảng string**, mỗi phần tử là 1 lỗi field, ví dụ:
  ```json
  { "statusCode": 400, "message": ["email must be an email", "password must be longer than or equal to 8 characters"], "error": "Bad Request", ... }
  ```
- Các mã lỗi HTTP hay gặp: `400` (validate/logic sai) · `401` (chưa đăng nhập/token hết hạn) · `403` (không đủ quyền — sai role) · `404` (không tìm thấy) · `409` (xung đột nghiệp vụ: hết hàng, trạng thái không hợp lệ, trùng dữ liệu...) · `429` (vượt rate limit) · `503` (dịch vụ phụ trợ chưa cấu hình, vd Cloudinary/Mongo).

## 15. Rate limit

Giới hạn mặc định toàn hệ thống: **120 request/phút/IP**. Ngoài ra các endpoint auth có giới hạn riêng chặt hơn:

| Endpoint | Giới hạn |
| --- | --- |
| `POST /auth/register` | 5/phút |
| `POST /auth/login` | 10/phút |
| `POST /auth/forgot-password` | 5/phút |
| `POST /auth/reset-password` | 5/phút |

Khi vượt giới hạn, backend trả `429 Too Many Requests`. FE nên hiển thị thông báo rõ ràng ("Thử lại sau ít phút") thay vì lỗi chung chung, đặc biệt ở form login/register.

## 16. RBAC — vai trò

- `customer`: mặc định khi đăng ký, dùng được các endpoint không có tiền tố `/admin`.
- `admin`: dùng được toàn bộ endpoint `/admin/*`. **Không có cách tự đăng ký làm admin** — tài khoản admin đầu tiên được tạo bằng script `npm run create-admin` ở backend (đọc từ env `ADMIN_*`), sau đó admin có thể promote user khác qua `PATCH /admin/users/:id`.
- Guard áp dụng theo thứ tự: `JwtAuthGuard` (bắt buộc Bearer hợp lệ) → `RolesGuard` (kiểm tra role) trên các route `/admin/*`. Sai token → `401`; đúng token nhưng sai role → `403`.

## 17. Việc FE cần tự làm (chưa có ở backend)

Để tránh nhầm là "thiếu API", các mục sau là quyết định thiết kế — **cố ý không có ở backend**, FE tự xử lý:
- Giỏ hàng (cart) trước khi checkout — hoàn toàn ở client.
- Banner/nội dung trang chủ, CMS — không có API, FE tự cấu hình tĩnh hoặc dùng dịch vụ khác nếu cần.
- Đánh giá/review sản phẩm — chưa có module này ở backend.
- Danh sách tỉnh/thành/quận/huyện/phường/xã chuẩn — backend chỉ lưu chuỗi tự do (`province`, `district`, `ward`), FE tự tích hợp bộ dữ liệu địa giới hành chính (vd. dùng thư viện sẵn có) và đảm bảo giá trị `province` gửi lên khớp với `provinceFees` đã cấu hình ở mục 9 nếu muốn tính phí ship theo khu vực chính xác.
