const OFFICIAL_SOURCE = {
  2025: {
    id: 'maharashtra-gazette-2025',
    title: 'Maharashtra Government Public Holidays 2025',
    url: 'https://www.maharashtra.gov.in/site/Upload/pdf/Maharashtra_Holiday_2025.pdf',
    status: 'official'
  },
  2026: {
    id: 'maharashtra-gazette-2026',
    title: 'Maharashtra Government Public Holidays 2026',
    url: 'https://maharashtra.gov.in/site/Upload/pdf/Public-Holiday-2026.pdf',
    status: 'official'
  }
};

const names = (en, mr, hi) => ({ en, mr, hi });

const holiday = (date, name, options = {}) => ({
  date,
  names: name,
  category: options.category || 'government-holiday',
  governmentHoliday: options.governmentHoliday !== false,
  bankHoliday: options.bankHoliday !== false,
  provisional: false,
  sourceId: OFFICIAL_SOURCE[Number(date.slice(0, 4))].id,
  note: options.note || null
});

const PUBLIC_HOLIDAYS = {
  2025: [
    holiday('2025-01-26', names('Republic Day', 'प्रजासत्ताक दिन', 'गणतंत्र दिवस')),
    holiday('2025-02-19', names('Chhatrapati Shivaji Maharaj Jayanti', 'छत्रपती शिवाजी महाराज जयंती', 'छत्रपति शिवाजी महाराज जयंती')),
    holiday('2025-02-26', names('Mahashivratri', 'महाशिवरात्री', 'महाशिवरात्रि')),
    holiday('2025-03-14', names('Holi - Second Day', 'धुलिवंदन', 'होली - दूसरा दिन')),
    holiday('2025-03-30', names('Gudi Padwa', 'गुढीपाडवा', 'गुड़ी पड़वा')),
    holiday('2025-03-31', names('Ramzan Eid', 'रमजान ईद', 'रमज़ान ईद'), { note: 'Subject to moon sighting.' }),
    holiday('2025-04-06', names('Ram Navami', 'राम नवमी', 'राम नवमी')),
    holiday('2025-04-10', names('Mahavir Janmakalyanak', 'महावीर जन्मकल्याणक', 'महावीर जन्म कल्याणक')),
    holiday('2025-04-14', names('Dr. Babasaheb Ambedkar Jayanti', 'डॉ. बाबासाहेब आंबेडकर जयंती', 'डॉ. बाबासाहेब आंबेडकर जयंती')),
    holiday('2025-04-18', names('Good Friday', 'गुड फ्रायडे', 'गुड फ्राइडे')),
    holiday('2025-05-01', names('Maharashtra Day', 'महाराष्ट्र दिन', 'महाराष्ट्र दिवस')),
    holiday('2025-05-12', names('Buddha Purnima', 'बुद्ध पौर्णिमा', 'बुद्ध पूर्णिमा')),
    holiday('2025-06-07', names('Bakri Eid', 'बकरी ईद', 'बकरीद'), { note: 'Subject to moon sighting.' }),
    holiday('2025-07-06', names('Muharram', 'मोहरम', 'मुहर्रम'), { note: 'Subject to moon sighting.' }),
    holiday('2025-08-15', names('Independence Day', 'स्वातंत्र्य दिन', 'स्वतंत्रता दिवस')),
    holiday('2025-08-15', names('Parsi New Year', 'पारशी नववर्ष', 'पारसी नववर्ष')),
    holiday('2025-08-27', names('Ganesh Chaturthi', 'गणेश चतुर्थी', 'गणेश चतुर्थी')),
    holiday('2025-09-05', names('Eid-e-Milad', 'ईद-ए-मिलाद', 'ईद-ए-मिलाद'), { note: 'Subject to moon sighting.' }),
    holiday('2025-10-02', names('Mahatma Gandhi Jayanti', 'महात्मा गांधी जयंती', 'महात्मा गांधी जयंती')),
    holiday('2025-10-02', names('Dussehra', 'दसरा', 'दशहरा')),
    holiday('2025-10-21', names('Diwali - Laxmi Pujan', 'दिवाळी - लक्ष्मीपूजन', 'दिवाली - लक्ष्मी पूजन')),
    holiday('2025-10-22', names('Diwali - Bali Pratipada', 'दिवाळी - बलिप्रतिपदा', 'दिवाली - बलि प्रतिपदा')),
    holiday('2025-11-05', names('Guru Nanak Jayanti', 'गुरुनानक जयंती', 'गुरु नानक जयंती')),
    holiday('2025-12-25', names('Christmas', 'नाताळ', 'क्रिसमस')),
    holiday('2025-04-01', names('Annual Closing of Bank Accounts', 'बँक खात्यांची वार्षिक बंदी', 'बैंक खातों की वार्षिक बंदी'), {
      category: 'bank-holiday',
      governmentHoliday: false
    })
  ],
  2026: [
    holiday('2026-01-26', names('Republic Day', 'प्रजासत्ताक दिन', 'गणतंत्र दिवस')),
    holiday('2026-02-15', names('Mahashivratri', 'महाशिवरात्री', 'महाशिवरात्रि')),
    holiday('2026-02-19', names('Chhatrapati Shivaji Maharaj Jayanti', 'छत्रपती शिवाजी महाराज जयंती', 'छत्रपति शिवाजी महाराज जयंती')),
    holiday('2026-03-03', names('Holi - Second Day', 'धुलिवंदन', 'होली - दूसरा दिन')),
    holiday('2026-03-19', names('Gudi Padwa', 'गुढीपाडवा', 'गुड़ी पड़वा')),
    holiday('2026-03-21', names('Ramzan Eid', 'रमजान ईद', 'रमज़ान ईद'), { note: 'Subject to moon sighting.' }),
    holiday('2026-03-26', names('Ram Navami', 'राम नवमी', 'राम नवमी')),
    holiday('2026-03-31', names('Mahavir Janmakalyanak', 'महावीर जन्मकल्याणक', 'महावीर जन्म कल्याणक')),
    holiday('2026-04-03', names('Good Friday', 'गुड फ्रायडे', 'गुड फ्राइडे')),
    holiday('2026-04-14', names('Dr. Babasaheb Ambedkar Jayanti', 'डॉ. बाबासाहेब आंबेडकर जयंती', 'डॉ. बाबासाहेब आंबेडकर जयंती')),
    holiday('2026-05-01', names('Maharashtra Day', 'महाराष्ट्र दिन', 'महाराष्ट्र दिवस')),
    holiday('2026-05-01', names('Buddha Purnima', 'बुद्ध पौर्णिमा', 'बुद्ध पूर्णिमा')),
    holiday('2026-05-28', names('Bakri Eid', 'बकरी ईद', 'बकरीद'), { note: 'Subject to moon sighting.' }),
    holiday('2026-06-26', names('Muharram', 'मोहरम', 'मुहर्रम'), { note: 'Subject to moon sighting.' }),
    holiday('2026-08-15', names('Independence Day', 'स्वातंत्र्य दिन', 'स्वतंत्रता दिवस')),
    holiday('2026-08-15', names('Parsi New Year', 'पारशी नववर्ष', 'पारसी नववर्ष')),
    holiday('2026-08-26', names('Eid-e-Milad', 'ईद-ए-मिलाद', 'ईद-ए-मिलाद'), { note: 'Subject to moon sighting.' }),
    holiday('2026-09-14', names('Ganesh Chaturthi', 'गणेश चतुर्थी', 'गणेश चतुर्थी')),
    holiday('2026-10-02', names('Mahatma Gandhi Jayanti', 'महात्मा गांधी जयंती', 'महात्मा गांधी जयंती')),
    holiday('2026-10-20', names('Dussehra', 'दसरा', 'दशहरा')),
    holiday('2026-11-08', names('Diwali - Laxmi Pujan', 'दिवाळी - लक्ष्मीपूजन', 'दिवाली - लक्ष्मी पूजन')),
    holiday('2026-11-10', names('Diwali - Bali Pratipada', 'दिवाळी - बलिप्रतिपदा', 'दिवाली - बलि प्रतिपदा')),
    holiday('2026-11-24', names('Guru Nanak Jayanti', 'गुरुनानक जयंती', 'गुरु नानक जयंती')),
    holiday('2026-12-25', names('Christmas', 'नाताळ', 'क्रिसमस')),
    holiday('2026-04-01', names('Annual Closing of Bank Accounts', 'बँक खात्यांची वार्षिक बंदी', 'बैंक खातों की वार्षिक बंदी'), {
      category: 'bank-holiday',
      governmentHoliday: false
    })
  ]
};

module.exports = {
  OFFICIAL_SOURCE,
  PUBLIC_HOLIDAYS,
  names
};
