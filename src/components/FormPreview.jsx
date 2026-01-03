// ============================================
// src/components/FormPreview.jsx
// Reusable Form Data Preview Component - Enhanced
// ============================================

// ============================================
// src/components/FormPreview.jsx
// Reusable Form Data Preview Component - Enhanced
// ============================================

export default function FormPreview({ form }) {
    const { type, data } = form;

    // Show ALL data dynamically
    const renderAllFields = () => {
        if (!data) return <p className="text-gray-500">لا توجد بيانات</p>;

        const entries = Object.entries(data);
        if (entries.length === 0) return <p className="text-gray-500">لا توجد بيانات</p>;

        return (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {entries.map(([key, value]) => {
                    // Hide system fields
                    if (['clientPointer', 'objectId', 'updatedAt', 'type'].includes(key)) return null;
                    return <Item key={key} label={translateKey(key)} value={value} fieldKey={key} />
                })}
            </div>
        );
    };

    // Translate field keys to Arabic
    const translateKey = (key) => {
        const translations = {
            // == Basic Info ==
            fullName: 'الاسم الكامل',
            FullName: 'الاسم الكامل',
            email: 'البريد الإلكتروني',
            Email: 'البريد الإلكتروني',
            phone: 'رقم الهاتف',
            PhoneNumber: 'رقم الهاتف',
            country: 'الدولة',
            Country: 'الدولة',
            religion: 'الديانة',
            Religion: 'الديانة',
            gender: 'الجنس',
            Gender: 'الجنس',
            dob: 'تاريخ الميلاد',
            DOB: 'تاريخ الميلاد',
            job: 'الوظيفة',
            Job: 'الوظيفة',
            age: 'العمر',
            Age: 'العمر',
            ClientCode: 'كود العميل',

            // == Health & Stats ==
            weight: 'الوزن (كجم)',
            Weight: 'الوزن (كجم)',
            height: 'الطول (سم)',
            Height: 'الطول (سم)',
            goal: 'الهدف',
            Goal: 'الهدف',
            subscriptionReason: 'سبب الاشتراك',
            JoinReason: 'سبب الاشتراك',
            healthIssues: 'حالات صحية',
            HealthIssues: 'حالات صحية',
            medications: 'أدوية',
            Medications: 'أدوية',
            injuries: 'إصابات',
            Injuries: 'إصابات',
            smoker: 'تدخين',
            Smoker: 'مدخن',
            labTest: 'هل قمت بتحاليل؟',
            DidTests: 'هل قمت بتحاليل؟',

            // == Files & Images ==
            frontImageUrl: 'صورة أمامية',
            PhotoFront: 'صورة أمامية',
            sideImageUrl: 'صورة جانبية',
            PhotoSide: 'صورة جانبية',
            backImageUrl: 'صورة خلفية',
            PhotoBack: 'صورة خلفية',
            labFileUrl: 'ملف التحاليل',
            TestsFile: 'ملف التحاليل',
            xrayFileUrl: 'ملف الأشعة',
            XrayFile: 'ملف الأشعة',
            previousDietFileUrl: 'ملف النظام السابق',

            // == Nutrition ==
            previousDiet: 'نظام غذائي سابق',
            DietHistory: 'نظام غذائي سابق',
            dayNature: 'طبيعة اليوم',
            DailyActivity: 'طبيعة اليوم',
            nonAdherenceReasons: 'أسباب عدم الالتزام',
            ComplianceIssues: 'أسباب عدم الالتزام',
            stimulants: 'منبهات',
            Caffeine: 'منبهات',
            foodAllergies: 'حساسية طعام',
            FoodAllergies: 'حساسية طعام',
            dislikedFood: 'طعام مكروه',
            DislikedFood: 'طعام مكروه',
            vitamins: 'فيتامينات',
            WantVitamins: 'فيتامينات',
            mealsCount: 'عدد الوجبات',
            MealsCount: 'عدد الوجبات',
            dietType: 'نوع النظام',
            DietType: 'نوع النظام',
            budget: 'الميزانية',
            Budget: 'الميزانية',
            favoriteProtein: 'بروتين مفضل',
            FavProtein: 'بروتين مفضل',
            favoriteCarbs: 'كارب مفضل',
            FavCarbs: 'كارب مفضل',
            favoriteFats: 'دهون مفضلة',
            FavFats: 'دهون مفضلة',

            // == Training ==
            exerciseExperience: 'خبرة التمرين',
            TrainingExp: 'خبرة التمرين',
            weightTrainingDuration: 'مدة التمارين',
            LiftingDuration: 'مدة التمارين',
            otherSports: 'رياضات أخرى',
            OtherSports: 'رياضات أخرى',
            gymLocation: 'مكان الجيم',
            GymLocation: 'مكان الجيم',
            availableTools: 'أدوات متاحة',
            AvailableTools: 'أدوات متاحة',
            trainingDays: 'أيام التمرين',
            TrainingDays: 'أيام التمرين',
            availableDays: 'الأيام المتاحة',
            AvailableDays: 'الأيام المتاحة',
            painExercises: 'تمارين مؤلمة',
            PainfulExercises: 'تمارين مؤلمة',
            cardioType: 'نوع الكارديو',
            FavCardio: 'نوع الكارديو',
            dailySteps: 'خطوات يومية',
            StepsCount: 'خطوات يومية',

            // == Other ==
            onlineExperience: 'خبرة أونلاين',
            OnlineExp: 'خبرة أونلاين',
            additionalNotes: 'ملاحظات إضافية',
            Notes: 'ملاحظات إضافية',

            // == System ==
            status: 'الحالة',
            Status: 'الحالة',
            createdAt: 'تاريخ الإنشاء',
            approvedAt: 'تاريخ الموافقة',

            // == Update Form Keys ==
            clientName: 'اسم العميل',
            clientCode: 'كود العميل',
            renewTraining: 'تجديد التدريب',
            renewNutrition: 'تجديد التغذية',
            currentWeight: 'الوزن الحالي',
            workoutDays: 'أيام التمرين',
            workoutLocation: 'مكان التمرين',
            weakPoints: 'نقاط الضعف',
            frontImage: 'صورة أمامية',
            sideImage: 'صورة جانبية',
            backImage: 'صورة خلفية',
            dietAdherence: 'الالتزام بالدايت',
            isHungry: 'هل تشعر بالجوع؟',
            dietNotes: 'ملاحظات وتغييرات',
            changeFoodTypes: 'تغيير أصناف الطعام',
            scalePhoto: 'صورة الميزان',
            physiquePhoto: 'صورة الجسم',
            activityLevel: 'مستوى النشاط'
        };
        return translations[key] || key;
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            {/* Type Badge */}
            <div className="mb-4 flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${type === 'client' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                    type === 'subscription' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                    {type === 'client' && '👤 عميل'}
                    {type === 'subscription' && '💳 اشتراك'}
                    {type !== 'client' && type !== 'subscription' && `📝 ${type}`}
                </span>
            </div>

            {/* All Fields */}
            {renderAllFields()}
        </div>
    );
}

function Item({ label, value, fieldKey }) {
    if (!value || value === '—') return null;

    // Determine content based on value type or field key
    let content;

    // 1. Image URL (check logical names or extensions)
    const isImage = (
        typeof value === 'string' &&
        (fieldKey.toLowerCase().includes('image') ||
            fieldKey.toLowerCase().includes('photo')) &&
        value.startsWith('http')
    );

    // 2. File URL (check logical names)
    const isFile = (
        typeof value === 'string' &&
        fieldKey.toLowerCase().includes('file') &&
        value.startsWith('http')
    );

    if (isImage) {
        content = (
            <div className="mt-2">
                <img
                    src={value}
                    alt={label}
                    className="w-full max-w-[200px] h-32 object-cover rounded border border-gray-300 dark:border-gray-600 hover:scale-105 transition-transform cursor-pointer"
                    onClick={() => window.open(value, '_blank')}
                />
            </div>
        );
    } else if (isFile) {
        content = (
            <a
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 flex items-center gap-2 mt-1"
            >
                📄 فتح الملف
            </a>
        );
    } else if (typeof value === 'object' && value?.toDate) {
        // Firestore Timestamp
        content = value.toDate().toLocaleString('ar-EG');
    } else if (typeof value === 'boolean') {
        content = value ? 'نعم' : 'لا';
    } else {
        content = String(value);
    }

    return (
        <div className="flex flex-col sm:flex-row sm:justify-between text-sm border-b border-gray-200 dark:border-gray-700 pb-2 last:border-0 last:pb-0 gap-1 sm:gap-4">
            <span className="font-medium text-gray-700 dark:text-gray-300 shrink-0">{label}:</span>
            <span className="text-gray-600 dark:text-gray-400 text-left break-words">{content}</span>
        </div>
    );
}
