# Psixologiya Admin Panel

Modern va professional admin panel psixologik test tizimi uchun.

## Xususiyatlar

### 🎨 Dizayn
- Zamonaviy va tushunarli UI/UX
- Gradient ranglar va smooth animatsiyalar
- Responsive dizayn (mobile, tablet, desktop)
- TailwindCSS va custom styling

### 📊 Dashboard
- Real-time statistikalar
- Test topshirganlar soni
- E'tibor talab qiluvchi natijalar
- Oxirgi natijalar jadvali
- Vizual grafiklar (Bar chart, Pie chart)

### 📈 Statistika sahifasi
- Test bo'yicha batafsil statistika
- Har bir test uchun:
  - Topshirgan talabalar soni
  - E'tibor talab qiluvchilar
  - Fakultet bo'yicha taqsimot
  - Og'irlik darajasi (severity) grafiklar
- Test natijalarini modal oynada ko'rish
- Student ma'lumotlarini batafsil ko'rish

### 🏫 Fakultetlar sahifasi
- Fakultetlar ro'yxati va statistikasi
- Guruhlar hierarchiyasi
- Har bir guruh uchun:
  - Talabalar soni
  - Test topshirganlar foizi
  - Talabalar ro'yxati
- Statistika iconlari bilan tezkor kirish

### 📝 Testlar sahifasi
- CRUD operatsiyalari (Create, Read, Update, Delete)
- Test yaratish/tahrirlash modal
- Test holati (faol/nofaol) toggle
- Maxfiy testlarni belgilash
- Test hisoblash usulini tanlash (sum, category, custom)

## Texnologiyalar

- **React 18** - UI library
- **Vite** - Build tool
- **React Router v6** - Routing
- **TailwindCSS** - Styling
- **Framer Motion** - Animations
- **Recharts** - Data visualization
- **Lucide React** - Icons
- **TanStack React Query** - Data fetching
- **Axios** - HTTP client
- **date-fns** - Date formatting

## O'rnatish

```bash
# Dependencies o'rnatish
npm install

# Development rejimida ishga tushirish
npm run dev

# Production build
npm run build
```

## Environment Variables

`.env` faylini yarating:

```env
VITE_API_URL=https://psixologiya-server.vercel.app/api
```

## Sahifalar

- `/login` - Admin login sahifasi
- `/dashboard` - Asosiy dashboard
- `/statistics` - Test statistikalari
- `/faculties` - Fakultetlar va guruhlar
- `/tests` - Testlar boshqaruvi

## Deployment

Vercel uchun sozlangan.

## Muallif

2024 - Psixologiya tizimi Admin Panel
