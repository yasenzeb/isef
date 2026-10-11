export interface GovernorateData {
  id: string;
  nameEn: string;
  nameAr: string;
  region: string;
  administrations: {
    id: string;
    nameEn: string;
    nameAr: string;
  }[];
}

export const EGYPT_GOVERNORATES: GovernorateData[] = [
  {
    id: 'cairo',
    nameEn: 'Cairo',
    nameAr: 'القاهرة',
    region: 'Greater Cairo',
    administrations: [
      { id: 'cairo-east-nasr', nameEn: 'East Nasr City Administration', nameAr: 'إدارة شرق مدينة نصر التعليمية' },
      { id: 'cairo-west-nasr', nameEn: 'West Nasr City Administration', nameAr: 'إدارة غرب مدينة نصر التعليمية' },
      { id: 'cairo-heliopolis', nameEn: 'Heliopolis (Nozha) Administration', nameAr: 'إدارة مصر الجديدة التعليمية' },
      { id: 'cairo-maadi', nameEn: 'Maadi Administration', nameAr: 'إدارة المعادي التعليمية' },
      { id: 'cairo-shorouk', nameEn: 'Al-Shorouk Administration', nameAr: 'إدارة الشروق التعليمية' },
      { id: 'cairo-new-cairo', nameEn: 'New Cairo Administration', nameAr: 'إدارة القاهرة الجديدة التعليمية' },
      { id: 'cairo-waily', nameEn: 'Al-Wayli Administration', nameAr: 'إدارة الوايلي التعليمية' },
      { id: 'cairo-zeytoun', nameEn: 'Al-Zaytoun Administration', nameAr: 'إدارة الزيتون التعليمية' },
      { id: 'cairo-helwan', nameEn: 'Helwan Administration', nameAr: 'إدارة حلوان التعليمية' },
    ],
  },
  {
    id: 'giza',
    nameEn: 'Giza',
    nameAr: 'الجيزة',
    region: 'Greater Cairo',
    administrations: [
      { id: 'giza-dokki', nameEn: 'Dokki Administration', nameAr: 'إدارة الدقي التعليمية' },
      { id: 'giza-agouza', nameEn: 'Agouza Administration', nameAr: 'إدارة العجوزة التعليمية' },
      { id: 'giza-haram', nameEn: 'Al-Haram Administration', nameAr: 'إدارة الهرم التعليمية' },
      { id: 'giza-october', nameEn: '6th of October Administration', nameAr: 'إدارة 6 أكتوبر التعليمية' },
      { id: 'giza-sheikh-zayed', nameEn: 'Sheikh Zayed Administration', nameAr: 'إدارة الشيخ زايد التعليمية' },
      { id: 'giza-south', nameEn: 'South Giza Administration', nameAr: 'إدارة جنوب الجيزة التعليمية' },
      { id: 'giza-umraniya', nameEn: 'Al-Omraniya Administration', nameAr: 'إدارة العمرانية التعليمية' },
    ],
  },
  {
    id: 'alexandria',
    nameEn: 'Alexandria',
    nameAr: 'الإسكندرية',
    region: 'Alexandria & Northern Coast',
    administrations: [
      { id: 'alex-east', nameEn: 'East Alexandria Administration', nameAr: 'إدارة شرق الإسكندرية التعليمية' },
      { id: 'alex-center', nameEn: 'Central Alexandria Administration', nameAr: 'إدارة وسط الإسكندرية التعليمية' },
      { id: 'alex-west', nameEn: 'West Alexandria Administration', nameAr: 'إدارة غرب الإسكندرية التعليمية' },
      { id: 'alex-montazah-1', nameEn: 'Montazah First Administration', nameAr: 'إدارة المنتزه أول التعليمية' },
      { id: 'alex-montazah-2', nameEn: 'Montazah Second Administration', nameAr: 'إدارة المنتزه ثان التعليمية' },
      { id: 'alex-gomrok', nameEn: 'Al-Gomrok Administration', nameAr: 'إدارة الجمرك التعليمية' },
      { id: 'alex-borg-arab', nameEn: 'Borg El-Arab Administration', nameAr: 'إدارة برج العرب التعليمية' },
    ],
  },
  {
    id: 'dakahlia',
    nameEn: 'Dakahlia',
    nameAr: 'الدقهلية',
    region: 'Nile Delta',
    administrations: [
      { id: 'dak-east-mansoura', nameEn: 'East Mansoura Administration', nameAr: 'إدارة شرق المنصورة التعليمية' },
      { id: 'dak-west-mansoura', nameEn: 'West Mansoura Administration', nameAr: 'إدارة غرب المنصورة التعليمية' },
      { id: 'dak-talkha', nameEn: 'Talkha Administration', nameAr: 'إدارة طلخا التعليمية' },
      { id: 'dak-mit-ghamr', nameEn: 'Mit Ghamr Administration', nameAr: 'إدارة ميت غمر التعليمية' },
      { id: 'dak-sinbillawin', nameEn: 'Sinbillawin Administration', nameAr: 'إدارة السنبلاوين التعليمية' },
    ],
  },
  {
    id: 'qalyubia',
    nameEn: 'Qalyubia',
    nameAr: 'القليوبية',
    region: 'Greater Cairo / Delta',
    administrations: [
      { id: 'qal-banha', nameEn: 'Banha Administration', nameAr: 'إدارة بنها التعليمية' },
      { id: 'qal-shubra-west', nameEn: 'West Shubra El Kheima Administration', nameAr: 'إدارة غرب شبرا الخيمة التعليمية' },
      { id: 'qal-shubra-east', nameEn: 'East Shubra El Kheima Administration', nameAr: 'إدارة شرق شبرا الخيمة التعليمية' },
      { id: 'qal-obour', nameEn: 'Al-Obour Administration', nameAr: 'إدارة العبور التعليمية' },
      { id: 'qal-qalyub', nameEn: 'Qalyub Administration', nameAr: 'إدارة قليوب التعليمية' },
    ],
  },
  {
    id: 'gharbia',
    nameEn: 'Gharbia',
    nameAr: 'الغربية',
    region: 'Nile Delta',
    administrations: [
      { id: 'ghar-east-tanta', nameEn: 'East Tanta Administration', nameAr: 'إدارة شرق طنطا التعليمية' },
      { id: 'ghar-west-tanta', nameEn: 'West Tanta Administration', nameAr: 'إدارة غرب طنطا التعليمية' },
      { id: 'ghar-east-mahalla', nameEn: 'East Mahalla Administration', nameAr: 'إدارة شرق المحلة الكبرى التعليمية' },
      { id: 'ghar-west-mahalla', nameEn: 'West Mahalla Administration', nameAr: 'إدارة غرب المحلة الكبرى التعليمية' },
      { id: 'ghar-zefta', nameEn: 'Zefta Administration', nameAr: 'إدارة زفتى التعليمية' },
    ],
  },
  {
    id: 'sharqia',
    nameEn: 'Sharqia',
    nameAr: 'الشرقية',
    region: 'Nile Delta',
    administrations: [
      { id: 'shar-zagazig-1', nameEn: 'Zagazig First Administration', nameAr: 'إدارة الزقازيق شرق التعليمية' },
      { id: 'shar-zagazig-2', nameEn: 'Zagazig West Administration', nameAr: 'إدارة الزقازيق غرب التعليمية' },
      { id: 'shar-10th-ramadan', nameEn: '10th of Ramadan Administration', nameAr: 'إدارة العاشر من رمضان التعليمية' },
      { id: 'shar-belbeis', nameEn: 'Belbeis Administration', nameAr: 'إدارة بلبيس التعليمية' },
      { id: 'shar-minya-qamh', nameEn: 'Minya El Qamh Administration', nameAr: 'إدارة منيا القمح التعليمية' },
    ],
  },
  {
    id: 'asyut',
    nameEn: 'Asyut',
    nameAr: 'أسيوط',
    region: 'Upper Egypt',
    administrations: [
      { id: 'asyut-admin', nameEn: 'Asyut City Administration', nameAr: 'إدارة أسيوط التعليمية' },
      { id: 'asyut-fateh', nameEn: 'Al-Fateh Administration', nameAr: 'إدارة الفتح التعليمية' },
      { id: 'asyut-abnoub', nameEn: 'Abnoub Administration', nameAr: 'إدارة أبنوب التعليمية' },
      { id: 'asyut-manfalut', nameEn: 'Manfalut Administration', nameAr: 'إدارة منفلوط التعليمية' },
      { id: 'asyut-qusiya', nameEn: 'Al-Qusiya Administration', nameAr: 'إدارة القوصية التعليمية' },
    ],
  },
  {
    id: 'sohag',
    nameEn: 'Sohag',
    nameAr: 'سوهاج',
    region: 'Upper Egypt',
    administrations: [
      { id: 'sohag-admin', nameEn: 'Sohag Administration', nameAr: 'إدارة سوهاج التعليمية' },
      { id: 'sohag-akhmim', nameEn: 'Akhmim Administration', nameAr: 'إدارة أخميم التعليمية' },
      { id: 'sohag-girga', nameEn: 'Girga Administration', nameAr: 'إدارة جرجا التعليمية' },
      { id: 'sohag-tahta', nameEn: 'Tahta Administration', nameAr: 'إدارة طهطا التعليمية' },
    ],
  },
  {
    id: 'qena',
    nameEn: 'Qena',
    nameAr: 'قنا',
    region: 'Upper Egypt',
    administrations: [
      { id: 'qena-admin', nameEn: 'Qena Administration', nameAr: 'إدارة قنا التعليمية' },
      { id: 'qena-nag-hammadi', nameEn: 'Nag Hammadi Administration', nameAr: 'إدارة نجع حمادي التعليمية' },
      { id: 'qena-qous', nameEn: 'Qous Administration', nameAr: 'إدارة قوص التعليمية' },
    ],
  },
  {
    id: 'luxor',
    nameEn: 'Luxor',
    nameAr: 'الأقصر',
    region: 'Upper Egypt',
    administrations: [
      { id: 'luxor-admin', nameEn: 'Luxor Administration', nameAr: 'إدارة الأقصر التعليمية' },
      { id: 'luxor-isna', nameEn: 'Esna Administration', nameAr: 'إدارة إسنا التعليمية' },
      { id: 'luxor-armant', nameEn: 'Armant Administration', nameAr: 'إدارة أرمنت التعليمية' },
    ],
  },
  {
    id: 'aswan',
    nameEn: 'Aswan',
    nameAr: 'أسوان',
    region: 'Upper Egypt',
    administrations: [
      { id: 'aswan-admin', nameEn: 'Aswan Administration', nameAr: 'إدارة أسوان التعليمية' },
      { id: 'aswan-edfu', nameEn: 'Edfu Administration', nameAr: 'إدارة إدفو التعليمية' },
      { id: 'aswan-kom-ombo', nameEn: 'Kom Ombo Administration', nameAr: 'إدارة كوم أمبو التعليمية' },
    ],
  },
  {
    id: 'port-said',
    nameEn: 'Port Said',
    nameAr: 'بورسعيد',
    region: 'Suez Canal',
    administrations: [
      { id: 'port-said-east', nameEn: 'Sharq Port Said Administration', nameAr: 'إدارة شرق بورسعيد التعليمية' },
      { id: 'port-said-south', nameEn: 'South Port Said Administration', nameAr: 'إدارة جنوب بورسعيد التعليمية' },
      { id: 'port-said-dawahy', nameEn: 'Al-Dawahy Administration', nameAr: 'إدارة الضواحي التعليمية' },
    ],
  },
  {
    id: 'ismailia',
    nameEn: 'Ismailia',
    nameAr: 'الإسماعيلية',
    region: 'Suez Canal',
    administrations: [
      { id: 'ismailia-admin', nameEn: 'Ismailia Administration', nameAr: 'إدارة الإسماعيلية التعليمية' },
      { id: 'ismailia-fayed', nameEn: 'Fayed Administration', nameAr: 'إدارة فايد التعليمية' },
      { id: 'ismailia-qantara', nameEn: 'Qantara West Administration', nameAr: 'إدارة القنطرة غرب التعليمية' },
    ],
  },
  {
    id: 'suez',
    nameEn: 'Suez',
    nameAr: 'السويس',
    region: 'Suez Canal',
    administrations: [
      { id: 'suez-north', nameEn: 'North Suez Administration', nameAr: 'إدارة شمال السويس التعليمية' },
      { id: 'suez-south', nameEn: 'South Suez Administration', nameAr: 'إدارة جنوب السويس التعليمية' },
      { id: 'suez-ganayen', nameEn: 'Al-Ganayen Administration', nameAr: 'إدارة الجناين التعليمية' },
    ],
  },
];
