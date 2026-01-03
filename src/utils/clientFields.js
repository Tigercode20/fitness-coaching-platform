// =========================================================================
// src/utils/clientFields.js
// تعريف خريطة الحقول (Field Mapping) لاستخدامها في صفحات متعددة
// =========================================================================

export const DATA_MAPPING = {
    // == Basic Info ==
    ClientCode: ['الكود', 'Code', 'Client Code'],
    FullName: ['الاسم', 'Name', 'Full Name', 'اسم العميل'],
    Email: ['Email', 'البريد', 'الإلكتروني'],
    PhoneNumber: ['التليفون', 'Phone', 'Mobile', 'الهاتف', 'رقم'],
    Country: ['الدولة', 'Country'],
    Age: ['السن', 'Age'],
    DOB: ['تاريخ الميلاد', 'Birth', 'DOB'],
    Gender: ['النوع', 'Gender', 'Sex'],
    Job: ['الوظيفة', 'Job', 'Occupation', 'المهنة', 'عملك'],
    Religion: ['الديانة', 'Religion'],

    // == Health & Stats ==
    Weight: ['الوزن', 'Weight'],
    Height: ['الطول', 'Height'],
    Goal: ['هدفك', 'Goal', 'Target', 'الاشتراك'],
    HealthIssues: ['مشاكل صحية', 'Health Issues', 'Medical', 'تعاني'],
    Medications: ['أدوية', 'Medications', 'Drugs', 'تستخدم'],
    Injuries: ['إصابات', 'Injuries'],
    Smoker: ['مدخن', 'Smoker', 'Smoking', 'تدخين'],
    Surgeries: ['عمليات', 'Surgeries'],
    DidTests: ['تحاليل', 'Tests', 'Blood Tests'],

    // == Nutrition ==
    DietHistory: ['نظام غذائي من قبل', 'Diet History', 'تجارب سابقة', 'التزمت'],
    DailyActivity: ['طبيعة يومك', 'Activity', 'Effort', 'مجهود'],
    ComplianceIssues: ['أسباب', 'Commitment', 'obstacles', 'الالتزام'],
    Caffeine: ['منبهات', 'Caffeine', 'Coffee', 'Tea', 'مشروبات'],
    FoodAllergies: ['حساسية', 'Allergies', 'Allergy'],
    DislikedFood: ['لا تحبه', 'Disliked', 'Hated', 'يحب'],
    WantVitamins: ['فيتامينات', 'Vitamins', 'Supplements'],
    MealsCount: ['عدد الوجبات', 'Meals', 'Count'],
    DietType: ['مرن', 'Flexibility', 'Flexible', 'قاسي'],
    Budget: ['الميزانية', 'Budget'],
    FavProtein: ['البروتين', 'Protein'],
    FavCarbs: ['الكربوهيدرات', 'Carb'],
    FavFats: ['الدهون', 'Fat'],
    LastDietFile: ['آخر نظام', 'Last Diet', 'Previous Diet'],

    // == Training ==
    TrainingExp: ['تجربتك', 'Training Experience', 'History', 'خبرة'],
    LiftingDuration: ['مدة ممارسة', 'Duration', 'How long'],
    OtherSports: ['رياضة أخرى', 'Other Sports'],
    GymLocation: ['مكان التمرين', 'Location', 'Gym'],
    AvailableTools: ['الأدوات', 'Tools', 'Equipment'],
    TrainingDays: ['عدد الأيام', 'Days Count'],
    AvailableDays: ['الأيام المتاحة', 'Available Days'],
    PainfulExercises: ['تمارين تسبب', 'Painful', 'Injurious'],
    FavCardio: ['الكارديو', 'Cardio'],
    StepsCount: ['خطوات', 'Steps'],

    // == Files & Images ==
    PhotoFront: ['أمام', 'Front', 'صورة 1', 'Image 1', 'Photo 1'],
    PhotoSide: ['جانب', 'Side', 'صورة 2', 'Image 2', 'Photo 2'],
    PhotoBack: ['خلف', 'Back', 'صورة 3', 'Image 3', 'Photo 3'],
    TestsFile: ['صور التحاليل', 'Tests File', 'Lab Results', 'تحليل'],
    XrayFile: ['صور الأشعة', 'X-Ray', 'Scan', 'أشعة'],

    // == Other ==
    OnlineExp: ['الأونلاين', 'Online', 'Coaching'],
    JoinReason: ['سبب الاشتراك', 'Why subscribe'],
    Notes: ['ملاحظة', 'Notes', 'Additional'],
    Timestamp: ['Timestamp', 'Time', 'الوقت']
}
