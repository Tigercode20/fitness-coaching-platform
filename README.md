# 🏋️ Fitness Coaching Platform

منصة إدارة كاملة للمدربين الأونلاين لإدارة العملاء والاشتراكات والخطط الغذائية والبرامج التمرينية.

## ✨ المميزات

- ✅ إدارة العملاء (إضافة، تعديل، حذف، بحث)
- ✅ نظام الاشتراكات والباقات
- ✅ خطط غذائية وبرامج تمرينية
- ✅ متابعة العملاء ودعم التحديثات
- ✅ لوحة تحكم قوية مع الإحصائيات
- ✅ تحميل الصور والملفات
- ✅ نظام مصادقة آمن
- ✅ تقارير شاملة
- ✅ دعم العربية (RTL)

## 🛠️ التكنولوجيا

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Backend**: Firebase
- **Database**: Firestore
- **Storage**: Firebase Cloud Storage
- **Hosting**: Vercel

## 📋 المتطلبات

- Node.js 16+
- npm أو yarn
- حساب Firebase
- حساب GitHub
- حساب Vercel

## 🚀 البدء السريع

### 1. إنشاء المشروع

```bash
npm create vite@latest fitness-coaching-platform -- --template react
cd fitness-coaching-platform
npm install
```

### 2. تثبيت المكتبات

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install firebase react-router-dom axios react-icons
```

### 3. إعداد Firebase

1. اذهب إلى https://console.firebase.google.com/
2. أنشئ مشروع جديد
3. فعّل Firestore Database
4. فعّل Authentication (Email/Password + Google)
5. فعّل Cloud Storage
6. انسخ Firebase Config

### 4. إنشاء ملف .env.local

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 5. تشغيل المشروع محلياً

```bash
npm run dev
```

الموقع سيفتح على: `http://localhost:5173`

## ❓ حل المشاكل الشائعة

### مشكلة: npm error code ENOENT
هذا الخطأ يعني أنك تحاول تشغيل الأوامر من المكان الخطأ.
**الحل:** تأكد من أنك داخل مجلد المشروع الصحيح:
```bash
d:
cd "d:\tiger\Nutrition Manager\wep app\fitness-coaching-platform"
```
ثم جرب الأوامر مرة أخرى.

## 📁 هيكل المشروع

```
src/
├── components/
│   ├── Layout/
│   ├── Forms/
│   ├── Dashboard/
│   ├── Clients/
│   └── Common/
├── pages/
├── services/
├── utils/
└── styles/
```

## 🔐 الملفات المهمة

- `src/services/firebase.js` - تكوين Firebase
- `src/services/authService.js` - خدمات المصادقة
- `src/services/clientService.js` - خدمات العملاء
- `src/services/subscriptionService.js` - خدمات الاشتراكات

## 📚 الموارد

- [Firebase Documentation](https://firebase.google.com/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Vite Documentation](https://vitejs.dev)

## 🚢 النشر على Vercel

1. ارفع المشروع على GitHub
2. اذهب إلى https://vercel.com
3. اربط مستودع GitHub
4. أضف متغيرات البيئة
5. اضغط Deploy

## 📝 الترخيص

هذا المشروع مرخص تحت MIT License

## 👨‍💻 المساهمة

نرحب بالمساهمات! تفضل بفتح Issue أو Pull Request

---

**صُنع بـ ❤️ لمساعدة المدربين الأونلاين**
