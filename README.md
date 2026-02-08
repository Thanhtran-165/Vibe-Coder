# Từ Vibe Coder đến Kiến trúc sư AI

**Website trình diễn giáo dục về năng lực làm việc với AI**

Một trang web tĩnh (static site) tương tác, trình bày khung phân loại năng lực L0-L6 khi làm việc với AI, giúp người dùng tự đánh giá và định vị bản thân.

## 🎯 Tính năng

- ✅ **Không cần build** - Chỉ HTML + CSS + JS thuần
- ✅ **Dark mode** - Tự động lưu preferences vào localStorage
- ✅ **Responsive** - Mobile-first design
- ✅ **Interactive Quiz** - 3 câu hỏi → xác định level L0-L6 + persona
- ✅ **Timeline Animation** - Accordion mượt cho thang L0-L6
- ✅ **2-Axis Chart** - Biểu đồ 4 kiểu người dùng AI
- ✅ **Scroll Spy** - Highlight section đang đọc
- ✅ **Reading Progress** - Thanh tiến độ đọc
- ✅ **Reveal Animations** - Hiệu ứng nhẹ khi scroll

## 📁 Cấu trúc file

```
/
├── index.html          # Main HTML
├── assets/
│   ├── styles.css      # Toàn bộ styles
│   ├── app.js          # Logic & interactions
│   └── content.json    # Data-driven content
└── README.md           # File này
```

## 🚀 Cách chạy

### Local development

1. Clone hoặc download project
2. Mở terminal tại thư mục project
3. Chạy local server:

```bash
# Python 3
python -m http.server 8000

# Hoặc Python 2
python -m SimpleHTTPServer 8000

# Hoặc Node.js (nếu đã install http-server)
npx http-server -p 8000
```

4. Mở browser: `http://localhost:8000`

### Mở trực tiếp

Có thể mở trực tiếp file `index.html` trong browser, nhưng một số tính năng có thể không hoạt động do CORS restrictions.

## 🌐 Deploy lên GitHub Pages

### Cách 1: GitHub CLI (nếu đã cài)

```bash
# Initialize git repo
git init
git add .
git commit -m "Initial commit"

# Create repo trên GitHub và push
gh repo create vibe-coder-website --public --source=.
git push -u origin main
```

### Cách 2: Manual trên GitHub

1. Tạo repo mới trên GitHub
2. Upload code lên repo
3. Vào **Settings** → **Pages**
4. Chọn **Source**: Deploy from a branch
5. Chọn **Branch**: main / root
6. Click **Save**

Site sẽ available tại: `https://username.github.io/<ten-repo>/` (ví dụ: `https://thanhtran-165.github.io/Vibe-Coder/`)

> Lưu ý: URL dạng `https://username.github.io/` (không có `/ten-repo/`) là **user site** và phải deploy trong repo tên đúng `username.github.io`.

## 🎨 Design System

### Colors
- Primary: `#6366f1` (Indigo 500)
- Secondary: `#8b5cf6` (Violet 500)
- Accent: `#06b6d4` (Cyan 500)

### Typography
- Font: System fonts (Apple, Segoe UI, Roboto)
- Heading scale: 3rem → 1.5rem
- Body: 1rem, line-height 1.7

### Components
- **Cards**: Glassmorphism với border radius 1rem
- **Buttons**: Gradient bg + hover lift effect
- **Accordion**: Smooth height animation
- **Tooltips**: Absolute positioning với fade in/out

## 📊 Nội dung

Website bao gồm 9 section chính:

1. **Hero** - Title, subtitle, 2 CTA buttons
2. **Why Now** - Stat strip (6 số liệu từ tài liệu gốc)
3. **Vibe Coder?** - 4 cards định nghĩa
4. **Hiểu lầm** - 3 misconceptions + "So what?"
5. **4 Kiểu người dùng** - Biểu đồ 2 trục (Agency vs Engineering Literacy)
6. **Thang L0-L6** - Timeline dọc + accordion chi tiết
7. **Quiz 1 phút** - 3 câu hỏi → level + persona + upgrade steps
8. **Kết luận** - Takeaways + CTA
9. **References** - 6 nguồn từ tài liệu gốc

## 🧠 Quiz Scoring Logic

Mỗi câu 0-2 điểm:

| Câu hỏi | 0 điểm | 1 điểm | 2 điểm |
|---------|--------|--------|--------|
| **Q1: Spec** | Không có | Sơ bộ | Rõ + kiểm chứng |
| **Q2: Gate/Validation** | Không có | Thủ công | Tự động |
| **Q3: Debug/Rollback** | Không có | Chậm/khó | Nhanh + quy trình |

**Level mapping:**
- 0-1 → L0-L1
- 2 → L2
- 3 → L3
- 4 → L4
- 5 → L5
- 6 → L6

**Persona mapping:**
- Agency proxy = Q1 + Q2
- Literacy proxy = Q2 + Q3

## 🔧 Tùy chỉnh

### Thay đổi nội dung

Sửa file `assets/content.json` - toàn bộ nội dung được load từ file này.

### Thay đổi styles

Sửa file `assets/styles.css` - CSS variables ở đầu file định nghĩa colors, spacing, typography.

### Thay đổi logic

Sửa file `assets/app.js` - các functions render và event handlers.

## 📱 Responsive Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🌓 Dark Mode

Dark mode được implement theo cách sau:
1. Tự động detect system preference trên lần truy cập đầu
2. Lưu vào `localStorage` key `theme`
3. Toggle button trong navigation
4. CSS variables tự động switch theo `[data-theme="dark"]`

## 🎯 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Android)

## 📄 License

Nội dung dựa trên tài liệu "Từ Vibe Coder đến Kiến trúc sư AI".

Code được release dưới MIT License.

## 🙏 Credits

- Content: Từ tài liệu học thuật gốc
- Design: Inspired by modern education websites
- Icons: Inline SVG (open-source friendly)
- Fonts: System fonts (no external requests)

## 🐛 Known Issues

- File JSON loading có thể fail khi mở trực tiếp file:// (do CORS) - dùng local server
- Một số legacy browsers không hỗ trợ `backdrop-filter` (glass effect)

## 📞 Support

Nếu gặp issues, please check:
1. Đã chạy local server chưa?
2. Browser có support ES6 không?
3. Console có errors không?

---

**Built with ❤️ for the AI community**
