/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const Astronomy = require('astronomy-engine');
const { OFFICIAL_SOURCE, PUBLIC_HOLIDAYS, names } = require('./official-holidays');

const IST_OFFSET_MINUTES = 330;
const REFERENCE = {
  code: 'RPI-NATIONAL',
  name: {
    en: 'Rashtriya Panchang National Reference Point',
    mr: 'राष्ट्रीय पंचांग राष्ट्रीय संदर्भ बिंदू',
    hi: 'राष्ट्रीय पंचांग राष्ट्रीय संदर्भ बिंदु'
  },
  latitude: 23 + (11 / 60),
  longitude: 82 + (30 / 60),
  elevationMeters: 0,
  timezone: 'Asia/Kolkata',
  timezoneLabel: 'IST (UTC+05:30)',
  note: {
    en: 'Panchang and timing values are stock reference values for 82°30′ E, 23°11′ N. Local timings vary by longitude, latitude, and elevation.',
    mr: 'पंचांग व वेळा ८२°३०′ पू., २३°११′ उ. या संदर्भ बिंदूसाठी आहेत. स्थानिक रेखांश, अक्षांश व उंचीनुसार वेळा बदलतात.',
    hi: 'पंचांग और समय 82°30′ पू., 23°11′ उ. संदर्भ बिंदु के लिए हैं। स्थानीय देशांतर, अक्षांश और ऊंचाई के अनुसार समय बदलता है।'
  }
};

const SOURCES = [
  {
    id: 'rashtriya-panchang',
    title: 'Rashtriya Panchang',
    publisher: 'Positional Astronomy Centre, India Meteorological Department',
    url: 'https://mausam.imd.gov.in/responsive/rashtriyPanchang.php',
    purpose: 'Official reference for Indian calendar conventions, IST, national reference coordinates, and Panchang validation.'
  },
  {
    id: 'indian-astronomical-ephemeris',
    title: 'Indian Astronomical Ephemeris',
    publisher: 'Positional Astronomy Centre, India Meteorological Department',
    url: 'https://mausam.imd.gov.in/imd_latest/contents/indian_astronomical_ephemeris.php',
    purpose: 'Official astronomical reference for solar, lunar, and planetary ephemerides.'
  },
  {
    id: 'astronomy-engine',
    title: 'Astronomy Engine 2.1.19',
    publisher: 'CosineKitty',
    url: 'https://github.com/cosinekitty/astronomy',
    license: 'MIT',
    purpose: 'Offline numerical generation of solar/lunar positions and rise/set times.'
  }
];

const LANGUAGE_NAMES = {
  weekdays: [
    names('Sunday', 'रविवार', 'रविवार'),
    names('Monday', 'सोमवार', 'सोमवार'),
    names('Tuesday', 'मंगळवार', 'मंगलवार'),
    names('Wednesday', 'बुधवार', 'बुधवार'),
    names('Thursday', 'गुरुवार', 'गुरुवार'),
    names('Friday', 'शुक्रवार', 'शुक्रवार'),
    names('Saturday', 'शनिवार', 'शनिवार')
  ],
  sakaMonths: [
    names('Chaitra', 'चैत्र', 'चैत्र'),
    names('Vaishakha', 'वैशाख', 'वैशाख'),
    names('Jyeshtha', 'ज्येष्ठ', 'ज्येष्ठ'),
    names('Ashadha', 'आषाढ', 'आषाढ़'),
    names('Shravana', 'श्रावण', 'श्रावण'),
    names('Bhadrapada', 'भाद्रपद', 'भाद्रपद'),
    names('Ashwin', 'आश्विन', 'आश्विन'),
    names('Kartik', 'कार्तिक', 'कार्तिक'),
    names('Margashirsha', 'मार्गशीर्ष', 'मार्गशीर्ष'),
    names('Pausha', 'पौष', 'पौष'),
    names('Magha', 'माघ', 'माघ'),
    names('Phalguna', 'फाल्गुन', 'फाल्गुन')
  ],
  lunarMonthsBySunSign: [
    names('Vaishakha', 'वैशाख', 'वैशाख'),
    names('Jyeshtha', 'ज्येष्ठ', 'ज्येष्ठ'),
    names('Ashadha', 'आषाढ', 'आषाढ़'),
    names('Shravana', 'श्रावण', 'श्रावण'),
    names('Bhadrapada', 'भाद्रपद', 'भाद्रपद'),
    names('Ashwin', 'आश्विन', 'आश्विन'),
    names('Kartik', 'कार्तिक', 'कार्तिक'),
    names('Margashirsha', 'मार्गशीर्ष', 'मार्गशीर्ष'),
    names('Pausha', 'पौष', 'पौष'),
    names('Magha', 'माघ', 'माघ'),
    names('Phalguna', 'फाल्गुन', 'फाल्गुन'),
    names('Chaitra', 'चैत्र', 'चैत्र')
  ],
  paksha: {
    shukla: names('Shukla Paksha', 'शुक्ल पक्ष', 'शुक्ल पक्ष'),
    krishna: names('Krishna Paksha', 'कृष्ण पक्ष', 'कृष्ण पक्ष')
  },
  tithis: [
    names('Pratipada', 'प्रतिपदा', 'प्रतिपदा'),
    names('Dwitiya', 'द्वितीया', 'द्वितीया'),
    names('Tritiya', 'तृतीया', 'तृतीया'),
    names('Chaturthi', 'चतुर्थी', 'चतुर्थी'),
    names('Panchami', 'पंचमी', 'पंचमी'),
    names('Shashthi', 'षष्ठी', 'षष्ठी'),
    names('Saptami', 'सप्तमी', 'सप्तमी'),
    names('Ashtami', 'अष्टमी', 'अष्टमी'),
    names('Navami', 'नवमी', 'नवमी'),
    names('Dashami', 'दशमी', 'दशमी'),
    names('Ekadashi', 'एकादशी', 'एकादशी'),
    names('Dwadashi', 'द्वादशी', 'द्वादशी'),
    names('Trayodashi', 'त्रयोदशी', 'त्रयोदशी'),
    names('Chaturdashi', 'चतुर्दशी', 'चतुर्दशी'),
    names('Purnima', 'पौर्णिमा', 'पूर्णिमा'),
    names('Pratipada', 'प्रतिपदा', 'प्रतिपदा'),
    names('Dwitiya', 'द्वितीया', 'द्वितीया'),
    names('Tritiya', 'तृतीया', 'तृतीया'),
    names('Chaturthi', 'चतुर्थी', 'चतुर्थी'),
    names('Panchami', 'पंचमी', 'पंचमी'),
    names('Shashthi', 'षष्ठी', 'षष्ठी'),
    names('Saptami', 'सप्तमी', 'सप्तमी'),
    names('Ashtami', 'अष्टमी', 'अष्टमी'),
    names('Navami', 'नवमी', 'नवमी'),
    names('Dashami', 'दशमी', 'दशमी'),
    names('Ekadashi', 'एकादशी', 'एकादशी'),
    names('Dwadashi', 'द्वादशी', 'द्वादशी'),
    names('Trayodashi', 'त्रयोदशी', 'त्रयोदशी'),
    names('Chaturdashi', 'चतुर्दशी', 'चतुर्दशी'),
    names('Amavasya', 'अमावस्या', 'अमावस्या')
  ],
  nakshatras: [
    'Ashwini|अश्विनी|अश्विनी',
    'Bharani|भरणी|भरणी',
    'Krittika|कृत्तिका|कृत्तिका',
    'Rohini|रोहिणी|रोहिणी',
    'Mrigashirsha|मृगशीर्ष|मृगशिरा',
    'Ardra|आर्द्रा|आर्द्रा',
    'Punarvasu|पुनर्वसू|पुनर्वसु',
    'Pushya|पुष्य|पुष्य',
    'Ashlesha|आश्लेषा|आश्लेषा',
    'Magha|मघा|मघा',
    'Purva Phalguni|पूर्वा फाल्गुनी|पूर्व फाल्गुनी',
    'Uttara Phalguni|उत्तरा फाल्गुनी|उत्तर फाल्गुनी',
    'Hasta|हस्त|हस्त',
    'Chitra|चित्रा|चित्रा',
    'Swati|स्वाती|स्वाती',
    'Vishakha|विशाखा|विशाखा',
    'Anuradha|अनुराधा|अनुराधा',
    'Jyeshtha|ज्येष्ठा|ज्येष्ठा',
    'Mula|मूळ|मूल',
    'Purva Ashadha|पूर्वाषाढा|पूर्वाषाढ़ा',
    'Uttara Ashadha|उत्तराषाढा|उत्तराषाढ़ा',
    'Shravana|श्रवण|श्रवण',
    'Dhanishtha|धनिष्ठा|धनिष्ठा',
    'Shatabhisha|शततारका|शतभिषा',
    'Purva Bhadrapada|पूर्वाभाद्रपदा|पूर्व भाद्रपद',
    'Uttara Bhadrapada|उत्तराभाद्रपदा|उत्तर भाद्रपद',
    'Revati|रेवती|रेवती'
  ].map((value) => {
    const [en, mr, hi] = value.split('|');
    return names(en, mr, hi);
  }),
  yogas: [
    'Vishkambha|विष्कंभ|विष्कंभ',
    'Priti|प्रीति|प्रीति',
    'Ayushman|आयुष्मान|आयुष्मान',
    'Saubhagya|सौभाग्य|सौभाग्य',
    'Shobhana|शोभन|शोभन',
    'Atiganda|अतिगंड|अतिगण्ड',
    'Sukarma|सुकर्मा|सुकर्मा',
    'Dhriti|धृति|धृति',
    'Shula|शूल|शूल',
    'Ganda|गंड|गण्ड',
    'Vriddhi|वृद्धी|वृद्धि',
    'Dhruva|ध्रुव|ध्रुव',
    'Vyaghata|व्याघात|व्याघात',
    'Harshana|हर्षण|हर्षण',
    'Vajra|वज्र|वज्र',
    'Siddhi|सिद्धी|सिद्धि',
    'Vyatipata|व्यतीपात|व्यतीपात',
    'Variyana|वरीयान|वरीयान',
    'Parigha|परिघ|परिघ',
    'Shiva|शिव|शिव',
    'Siddha|सिद्ध|सिद्ध',
    'Sadhya|साध्य|साध्य',
    'Shubha|शुभ|शुभ',
    'Shukla|शुक्ल|शुक्ल',
    'Brahma|ब्रह्म|ब्रह्म',
    'Indra|इंद्र|इन्द्र',
    'Vaidhriti|वैधृति|वैधृति'
  ].map((value) => {
    const [en, mr, hi] = value.split('|');
    return names(en, mr, hi);
  }),
  karanas: {
    kimstughna: names('Kimstughna', 'किंस्तुघ्न', 'किंस्तुघ्न'),
    bava: names('Bava', 'बव', 'बव'),
    balava: names('Balava', 'बालव', 'बालव'),
    kaulava: names('Kaulava', 'कौलव', 'कौलव'),
    taitila: names('Taitila', 'तैतिल', 'तैतिल'),
    garaja: names('Garaja', 'गरज', 'गर'),
    vanija: names('Vanija', 'वणिज', 'वणिज'),
    vishti: names('Vishti', 'विष्टि', 'विष्टि'),
    shakuni: names('Shakuni', 'शकुनि', 'शकुनि'),
    chatushpada: names('Chatushpada', 'चतुष्पाद', 'चतुष्पाद'),
    naga: names('Naga', 'नाग', 'नाग')
  },
  rashis: [
    'Aries|मेष|मेष',
    'Taurus|वृषभ|वृषभ',
    'Gemini|मिथुन|मिथुन',
    'Cancer|कर्क|कर्क',
    'Leo|सिंह|सिंह',
    'Virgo|कन्या|कन्या',
    'Libra|तुळ|तुला',
    'Scorpio|वृश्चिक|वृश्चिक',
    'Sagittarius|धनु|धनु',
    'Capricorn|मकर|मकर',
    'Aquarius|कुंभ|कुंभ',
    'Pisces|मीन|मीन'
  ].map((value) => {
    const [en, mr, hi] = value.split('|');
    return names(en, mr, hi);
  })
};

const OBSERVANCE_NAMES = {
  ekadashi: names('Ekadashi Vrat', 'एकादशी व्रत', 'एकादशी व्रत'),
  purnima: names('Purnima', 'पौर्णिमा', 'पूर्णिमा'),
  amavasya: names('Amavasya', 'अमावस्या', 'अमावस्या'),
  sankashti: names('Sankashti Chaturthi', 'संकष्टी चतुर्थी', 'संकष्टी चतुर्थी'),
  pradosh: names('Pradosh Vrat', 'प्रदोष व्रत', 'प्रदोष व्रत'),
  vinayaka: names('Vinayaka Chaturthi', 'विनायक चतुर्थी', 'विनायक चतुर्थी')
};

const PROVISIONAL_FIXED_2027 = [
  ['2027-01-26', names('Republic Day', 'प्रजासत्ताक दिन', 'गणतंत्र दिवस')],
  ['2027-02-19', names('Chhatrapati Shivaji Maharaj Jayanti', 'छत्रपती शिवाजी महाराज जयंती', 'छत्रपति शिवाजी महाराज जयंती')],
  ['2027-04-01', names('Annual Closing of Bank Accounts', 'बँक खात्यांची वार्षिक बंदी', 'बैंक खातों की वार्षिक बंदी'), 'bank-holiday'],
  ['2027-03-26', names('Good Friday', 'गुड फ्रायडे', 'गुड फ्राइडे')],
  ['2027-04-14', names('Dr. Babasaheb Ambedkar Jayanti', 'डॉ. बाबासाहेब आंबेडकर जयंती', 'डॉ. बाबासाहेब आंबेडकर जयंती')],
  ['2027-05-01', names('Maharashtra Day', 'महाराष्ट्र दिन', 'महाराष्ट्र दिवस')],
  ['2027-08-15', names('Independence Day', 'स्वातंत्र्य दिन', 'स्वतंत्रता दिवस')],
  ['2027-08-15', names('Parsi New Year', 'पारशी नववर्ष', 'पारसी नववर्ष')],
  ['2027-10-02', names('Mahatma Gandhi Jayanti', 'महात्मा गांधी जयंती', 'महात्मा गांधी जयंती')],
  ['2027-12-25', names('Christmas', 'नाताळ', 'क्रिसमस')]
];

const PROVISIONAL_LUNAR_RULES_2027 = [
  { key: 'mahashivratri', month: 'Magha', paksha: 'krishna', tithi: 29, evaluationHour: 24, names: names('Mahashivratri', 'महाशिवरात्री', 'महाशिवरात्रि') },
  { key: 'holi', month: 'Phalguna', paksha: 'shukla', tithi: 15, evaluationHour: 0, names: names('Holi - Second Day', 'धुलिवंदन', 'होली - दूसरा दिन') },
  { key: 'gudi-padwa', month: 'Chaitra', paksha: 'shukla', tithi: 1, evaluationHour: 6, names: names('Gudi Padwa', 'गुढीपाडवा', 'गुड़ी पड़वा') },
  { key: 'ram-navami', month: 'Chaitra', paksha: 'shukla', tithi: 9, evaluationHour: 12, names: names('Ram Navami', 'राम नवमी', 'राम नवमी') },
  { key: 'mahavir-jayanti', month: 'Chaitra', paksha: 'shukla', tithi: 13, evaluationHour: 6, names: names('Mahavir Janmakalyanak', 'महावीर जन्मकल्याणक', 'महावीर जन्म कल्याणक') },
  { key: 'buddha-purnima', month: 'Vaishakha', paksha: 'shukla', tithi: 15, evaluationHour: 6, names: names('Buddha Purnima', 'बुद्ध पौर्णिमा', 'बुद्ध पूर्णिमा') },
  { key: 'ganesh-chaturthi', month: 'Bhadrapada', paksha: 'shukla', tithi: 4, evaluationHour: 12, names: names('Ganesh Chaturthi', 'गणेश चतुर्थी', 'गणेश चतुर्थी') },
  { key: 'dussehra', month: 'Ashwin', paksha: 'shukla', tithi: 10, evaluationHour: 15, names: names('Dussehra', 'दसरा', 'दशहरा') },
  { key: 'diwali', month: 'Ashwin', paksha: 'krishna', tithi: 30, evaluationHour: 19, names: names('Diwali - Laxmi Pujan', 'दिवाळी - लक्ष्मीपूजन', 'दिवाली - लक्ष्मी पूजन') },
  { key: 'bali-pratipada', month: 'Kartik', paksha: 'shukla', tithi: 1, evaluationHour: 6, names: names('Diwali - Bali Pratipada', 'दिवाळी - बलिप्रतिपदा', 'दिवाली - बलि प्रतिपदा') },
  { key: 'guru-nanak', month: 'Kartik', paksha: 'shukla', tithi: 15, evaluationHour: 6, names: names('Guru Nanak Jayanti', 'गुरुनानक जयंती', 'गुरु नानक जयंती') }
];

const PROVISIONAL_ISLAMIC_RULES = [
  { key: 'ramzan-eid', month: 10, day: 1, names: names('Ramzan Eid', 'रमजान ईद', 'रमज़ान ईद') },
  { key: 'bakri-eid', month: 12, day: 10, names: names('Bakri Eid', 'बकरी ईद', 'बकरीद') },
  { key: 'muharram', month: 1, day: 10, names: names('Muharram', 'मोहरम', 'मुहर्रम') },
  { key: 'eid-e-milad', month: 3, day: 12, names: names('Eid-e-Milad', 'ईद-ए-मिलाद', 'ईद-ए-मिलाद') }
];

const normalizeDegrees = (value) => ((value % 360) + 360) % 360;
const pad = (value) => String(value).padStart(2, '0');
const dateKey = (year, month, day) => `${year}-${pad(month)}-${pad(day)}`;
const isLeapYear = (year) => (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
const addDays = (date, days) => new Date(date.getTime() + (days * 86400000));

const localMidnightUtc = (dateString) => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day, 0, -IST_OFFSET_MINUTES));
};

const localDateParts = (date) => {
  const shifted = new Date(date.getTime() + (IST_OFFSET_MINUTES * 60000));
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
    hour: shifted.getUTCHours(),
    minute: shifted.getUTCMinutes()
  };
};

const formatTime = (date) => {
  if (!date) return null;
  const parts = localDateParts(date);
  return `${pad(parts.hour)}:${pad(parts.minute)}`;
};

const formatEnd = (date, baseDateString) => {
  if (!date) return null;
  const parts = localDateParts(date);
  const resultDate = dateKey(parts.year, parts.month, parts.day);
  const base = localMidnightUtc(baseDateString);
  const result = localMidnightUtc(resultDate);
  return {
    time: formatTime(date),
    dayOffset: Math.round((result - base) / 86400000),
    iso: date.toISOString()
  };
};

Astronomy.DefineStar(
  Astronomy.Body.Star1,
  13 + (25 / 60) + (11.579 / 3600),
  -(11 + (9 / 60) + (40.75 / 3600)),
  250
);

const ayanamsha = (date) => normalizeDegrees(
  Astronomy.EclipticLongitude(Astronomy.Body.Star1, date) - 180
);

const astronomicalState = (date) => {
  const sunTropical = normalizeDegrees(Astronomy.SunPosition(date).elon);
  const moonTropical = normalizeDegrees(Astronomy.EclipticGeoMoon(date).lon);
  const lahiri = ayanamsha(date);
  const sunSidereal = normalizeDegrees(sunTropical - lahiri);
  const moonSidereal = normalizeDegrees(moonTropical - lahiri);
  const phase = normalizeDegrees(moonTropical - sunTropical);
  const yogaAngle = normalizeDegrees(sunSidereal + moonSidereal);

  return {
    ayanamsha: lahiri,
    sunTropical,
    moonTropical,
    sunSidereal,
    moonSidereal,
    phase,
    tithiIndex: Math.floor(phase / 12),
    karanaIndex: Math.floor(phase / 6),
    nakshatraIndex: Math.floor(moonSidereal / (360 / 27)),
    yogaIndex: Math.floor(yogaAngle / (360 / 27)),
    sunRashiIndex: Math.floor(sunSidereal / 30),
    moonRashiIndex: Math.floor(moonSidereal / 30)
  };
};

const findIndexTransition = (start, selector, currentIndex, maxHours = 48) => {
  let left = start;
  let right = null;

  for (let minutes = 30; minutes <= maxHours * 60; minutes += 30) {
    const candidate = new Date(start.getTime() + (minutes * 60000));
    if (selector(astronomicalState(candidate)) !== currentIndex) {
      right = candidate;
      break;
    }
    left = candidate;
  }

  if (!right) return null;

  for (let iteration = 0; iteration < 18; iteration += 1) {
    const midpoint = new Date((left.getTime() + right.getTime()) / 2);
    if (selector(astronomicalState(midpoint)) === currentIndex) {
      left = midpoint;
    } else {
      right = midpoint;
    }
  }

  return right;
};

const karanaName = (index) => {
  if (index === 0) return LANGUAGE_NAMES.karanas.kimstughna;
  if (index === 57) return LANGUAGE_NAMES.karanas.shakuni;
  if (index === 58) return LANGUAGE_NAMES.karanas.chatushpada;
  if (index === 59) return LANGUAGE_NAMES.karanas.naga;
  const recurring = ['bava', 'balava', 'kaulava', 'taitila', 'garaja', 'vanija', 'vishti'];
  return LANGUAGE_NAMES.karanas[recurring[(index - 1) % recurring.length]];
};

const riseSet = (body, direction, start, observer) => {
  const result = Astronomy.SearchRiseSet(body, observer, direction, start, 1.1);
  return result ? result.date : null;
};

const rangeFromSegment = (sunrise, sunset, segment) => {
  if (!sunrise || !sunset) return null;
  const segmentDuration = (sunset.getTime() - sunrise.getTime()) / 8;
  const start = new Date(sunrise.getTime() + ((segment - 1) * segmentDuration));
  const end = new Date(start.getTime() + segmentDuration);
  return { start: formatTime(start), end: formatTime(end) };
};

const abhijitRange = (sunrise, sunset) => {
  if (!sunrise || !sunset) return null;
  const daylight = sunset.getTime() - sunrise.getTime();
  const noon = sunrise.getTime() + (daylight / 2);
  const duration = daylight / 15;
  return {
    start: formatTime(new Date(noon - (duration / 2))),
    end: formatTime(new Date(noon + (duration / 2)))
  };
};

const getSakaDate = (year, month, day) => {
  const leap = isLeapYear(year);
  const startDay = leap ? 21 : 22;
  const sakaStart = new Date(Date.UTC(year, 2, startDay));
  const current = new Date(Date.UTC(year, month - 1, day));
  let sakaYear = year - 78;
  let dayOffset;

  if (current < sakaStart) {
    const previousYear = year - 1;
    const previousStart = new Date(Date.UTC(previousYear, 2, isLeapYear(previousYear) ? 21 : 22));
    sakaYear = year - 79;
    dayOffset = Math.floor((current - previousStart) / 86400000);
  } else {
    dayOffset = Math.floor((current - sakaStart) / 86400000);
  }

  const chaitraLength = isLeapYear(sakaYear + 78) ? 31 : 30;
  const monthLengths = [chaitraLength, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 30];
  let monthIndex = 0;
  while (monthIndex < monthLengths.length && dayOffset >= monthLengths[monthIndex]) {
    dayOffset -= monthLengths[monthIndex];
    monthIndex += 1;
  }

  return {
    year: sakaYear,
    month: monthIndex + 1,
    monthName: LANGUAGE_NAMES.sakaMonths[monthIndex],
    day: dayOffset + 1
  };
};

const generateNewMoons = (year) => {
  const start = new Date(Date.UTC(year - 1, 10, 1));
  const end = new Date(Date.UTC(year + 1, 1, 1));
  const values = [];
  let cursor = start;

  while (cursor < end) {
    const result = Astronomy.SearchMoonPhase(0, cursor, 40);
    if (!result || result.date >= end) break;
    if (!values.length || result.date.getTime() - values[values.length - 1].getTime() > 60000) {
      values.push(result.date);
    }
    cursor = new Date(result.date.getTime() + 3600000);
  }

  return values;
};

const getLunarMonth = (date, newMoons) => {
  let index = newMoons.findIndex((item) => item > date) - 1;
  if (index < 0) index = 0;
  const current = newMoons[index];
  const next = newMoons[index + 1];
  const currentSign = astronomicalState(current).sunRashiIndex;
  const nextSign = next ? astronomicalState(next).sunRashiIndex : null;
  return {
    code: LANGUAGE_NAMES.lunarMonthsBySunSign[currentSign].en,
    name: LANGUAGE_NAMES.lunarMonthsBySunSign[currentSign],
    adhik: nextSign === currentSign
  };
};

const makeEvent = (key, eventNames, options = {}) => ({
  key,
  names: eventNames,
  category: options.category || 'observance',
  festival: options.festival !== false,
  vrat: Boolean(options.vrat),
  governmentHoliday: Boolean(options.governmentHoliday),
  bankHoliday: Boolean(options.bankHoliday),
  provisional: Boolean(options.provisional),
  sourceId: options.sourceId || 'astronomical-rule',
  note: options.note || null
});

const buildObservances = (record) => {
  const events = [];
  const tithi = record.panchang.tithi.number;
  if (tithi === 11 || tithi === 26) {
    events.push(makeEvent('ekadashi', OBSERVANCE_NAMES.ekadashi, { vrat: true }));
  }
  if (tithi === 15) {
    events.push(makeEvent('purnima', OBSERVANCE_NAMES.purnima, { vrat: true }));
  }
  if (tithi === 30) {
    events.push(makeEvent('amavasya', OBSERVANCE_NAMES.amavasya, { vrat: true }));
  }
  if (tithi === 19) {
    events.push(makeEvent('sankashti', OBSERVANCE_NAMES.sankashti, { vrat: true }));
  }
  if (tithi === 13 || tithi === 28) {
    events.push(makeEvent('pradosh', OBSERVANCE_NAMES.pradosh, { vrat: true }));
  }
  if (tithi === 4) {
    events.push(makeEvent('vinayaka-chaturthi', OBSERVANCE_NAMES.vinayaka, { vrat: true }));
  }
  return events;
};

const provisionalHoliday = (date, eventNames, category = 'government-holiday') => ({
  date,
  names: eventNames,
  category,
  governmentHoliday: category !== 'bank-holiday',
  bankHoliday: true,
  provisional: true,
  sourceId: 'provisional-2027',
  note: 'Provisional until the Government of Maharashtra publishes the official 2027 holiday notification.'
});

const getProvisionalIslamicDates = (year) => {
  const formatter = new Intl.DateTimeFormat('en-u-ca-islamic-civil', {
    timeZone: REFERENCE.timezone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  });
  const matches = [];
  const start = new Date(Date.UTC(year, 0, 1));
  const end = new Date(Date.UTC(year + 1, 0, 1));

  for (let cursor = start; cursor < end; cursor = addDays(cursor, 1)) {
    const parts = Object.fromEntries(
      formatter.formatToParts(cursor)
        .filter((part) => ['month', 'day'].includes(part.type))
        .map((part) => [part.type, Number(part.value)])
    );

    PROVISIONAL_ISLAMIC_RULES.forEach((rule) => {
      if (parts.month === rule.month && parts.day === rule.day) {
        matches.push({
          date: cursor.toISOString().slice(0, 10),
          ...rule
        });
      }
    });
  }

  return matches;
};

const generateYear = (year) => {
  console.log(`Generating ${year}...`);
  const observer = new Astronomy.Observer(
    REFERENCE.latitude,
    REFERENCE.longitude,
    REFERENCE.elevationMeters
  );
  const newMoons = generateNewMoons(year);
  const records = {};
  const dateList = [];
  const start = new Date(Date.UTC(year, 0, 1));
  const end = new Date(Date.UTC(year + 1, 0, 1));
  const rahuSegments = [8, 2, 7, 5, 6, 4, 3];
  const yamagandaSegments = [5, 4, 3, 2, 1, 7, 6];
  const gulikaSegments = [7, 6, 5, 4, 3, 2, 1];

  for (let cursor = start; cursor < end; cursor = addDays(cursor, 1)) {
    const yearPart = cursor.getUTCFullYear();
    const monthPart = cursor.getUTCMonth() + 1;
    const dayPart = cursor.getUTCDate();
    const key = dateKey(yearPart, monthPart, dayPart);
    const localStart = localMidnightUtc(key);
    const sunrise = riseSet(Astronomy.Body.Sun, 1, localStart, observer);
    const sunset = riseSet(Astronomy.Body.Sun, -1, localStart, observer);
    const moonrise = riseSet(Astronomy.Body.Moon, 1, localStart, observer);
    const moonset = riseSet(Astronomy.Body.Moon, -1, localStart, observer);
    const evaluationTime = sunrise || new Date(localStart.getTime() + (6 * 3600000));
    const state = astronomicalState(evaluationTime);
    const lunarMonth = getLunarMonth(evaluationTime, newMoons);
    const weekdayIndex = cursor.getUTCDay();
    const tithiNumber = state.tithiIndex + 1;
    const pakshaCode = tithiNumber <= 15 ? 'shukla' : 'krishna';
    const tithiEnd = findIndexTransition(evaluationTime, (item) => item.tithiIndex, state.tithiIndex);
    const nakshatraEnd = findIndexTransition(evaluationTime, (item) => item.nakshatraIndex, state.nakshatraIndex);
    const yogaEnd = findIndexTransition(evaluationTime, (item) => item.yogaIndex, state.yogaIndex);
    const karanaEnd = findIndexTransition(evaluationTime, (item) => item.karanaIndex, state.karanaIndex);
    const saka = getSakaDate(yearPart, monthPart, dayPart);

    const record = {
      date: key,
      year: yearPart,
      month: monthPart,
      day: dayPart,
      weekday: {
        index: weekdayIndex,
        name: LANGUAGE_NAMES.weekdays[weekdayIndex]
      },
      saka,
      vikramSamvat: null,
      lunar: {
        month: lunarMonth,
        paksha: {
          code: pakshaCode,
          name: LANGUAGE_NAMES.paksha[pakshaCode]
        }
      },
      panchang: {
        tithi: {
          number: tithiNumber,
          pakshaNumber: ((tithiNumber - 1) % 15) + 1,
          name: LANGUAGE_NAMES.tithis[state.tithiIndex],
          endsAt: formatEnd(tithiEnd, key)
        },
        nakshatra: {
          number: state.nakshatraIndex + 1,
          name: LANGUAGE_NAMES.nakshatras[state.nakshatraIndex],
          endsAt: formatEnd(nakshatraEnd, key)
        },
        yoga: {
          number: state.yogaIndex + 1,
          name: LANGUAGE_NAMES.yogas[state.yogaIndex],
          endsAt: formatEnd(yogaEnd, key)
        },
        karana: {
          number: state.karanaIndex + 1,
          name: karanaName(state.karanaIndex),
          endsAt: formatEnd(karanaEnd, key)
        },
        moonRashi: LANGUAGE_NAMES.rashis[state.moonRashiIndex],
        sunRashi: LANGUAGE_NAMES.rashis[state.sunRashiIndex]
      },
      astronomy: {
        sunrise: formatTime(sunrise),
        sunset: formatTime(sunset),
        moonrise: formatTime(moonrise),
        moonset: formatTime(moonset),
        ayanamsha: Number(state.ayanamsha.toFixed(6))
      },
      timings: {
        rahuKaal: rangeFromSegment(sunrise, sunset, rahuSegments[weekdayIndex]),
        yamaganda: rangeFromSegment(sunrise, sunset, yamagandaSegments[weekdayIndex]),
        gulikaKaal: rangeFromSegment(sunrise, sunset, gulikaSegments[weekdayIndex]),
        abhijitMuhurat: abhijitRange(sunrise, sunset)
      },
      events: [],
      quality: {
        calculation: 'astronomy-engine-2.1.19',
        ayanamsha: 'Chitrapaksha/Lahiri derived from true ecliptic longitude of Spica',
        referenceCode: REFERENCE.code
      }
    };

    record.events.push(...buildObservances(record));
    records[key] = record;
    dateList.push(key);
  }

  let lunarNewYearDate = dateList.find((key) => {
    const evaluationTime = new Date(localMidnightUtc(key).getTime() + (12 * 3600000));
    const state = astronomicalState(evaluationTime);
    const lunarMonth = getLunarMonth(evaluationTime, newMoons);
    return lunarMonth.code === 'Chaitra' && state.tithiIndex === 0;
  });
  if (!lunarNewYearDate) lunarNewYearDate = `${year}-03-22`;

  dateList.forEach((key) => {
    records[key].vikramSamvat = Number(key >= lunarNewYearDate ? year + 57 : year + 56);
  });

  (PUBLIC_HOLIDAYS[year] || []).forEach((item, index) => {
    if (!records[item.date]) return;
    records[item.date].events.push(makeEvent(
      `official-${year}-${index + 1}`,
      item.names,
      {
        category: item.category,
        governmentHoliday: item.governmentHoliday,
        bankHoliday: item.bankHoliday,
        sourceId: item.sourceId,
        note: item.note
      }
    ));
  });

  if (year === 2027) {
    PROVISIONAL_FIXED_2027.forEach(([date, eventNames, category]) => {
      const item = provisionalHoliday(date, eventNames, category);
      records[date].events.push(makeEvent(`provisional-${date}-${item.category}`, item.names, item));
    });

    PROVISIONAL_LUNAR_RULES_2027.forEach((rule) => {
      const matchingDate = dateList.find((key) => {
        const evaluationTime = new Date(
          localMidnightUtc(key).getTime() + (rule.evaluationHour * 3600000)
        );
        const state = astronomicalState(evaluationTime);
        const lunarMonth = getLunarMonth(evaluationTime, newMoons);
        const tithi = state.tithiIndex + 1;
        const paksha = tithi <= 15 ? 'shukla' : 'krishna';
        return lunarMonth.code === rule.month
          && paksha === rule.paksha
          && tithi === rule.tithi;
      });
      if (!matchingDate) return;
      const resultDate = new Date(
        localMidnightUtc(matchingDate).getTime() + ((rule.resultOffsetDays || 0) * 86400000)
      );
      const parts = localDateParts(resultDate);
      const holidayDate = dateKey(parts.year, parts.month, parts.day);
      const item = provisionalHoliday(holidayDate, rule.names);
      records[holidayDate].events.push(makeEvent(`provisional-${rule.key}`, item.names, item));
    });

    getProvisionalIslamicDates(year).forEach((rule) => {
      const item = provisionalHoliday(rule.date, rule.names);
      item.note = 'Provisional civil-calendar estimate. The observed holiday is subject to moon sighting and the official notification.';
      records[rule.date].events.push(makeEvent(`provisional-${rule.key}`, item.names, item));
    });
  }

  return {
    metadata: {
      schemaVersion: 1,
      year,
      generatedAt: new Date().toISOString(),
      reference: REFERENCE,
      sources: [
        ...SOURCES,
        ...(OFFICIAL_SOURCE[year] ? [OFFICIAL_SOURCE[year]] : []),
        ...(year === 2027 ? [{
          id: 'provisional-2027',
          title: 'Calculated 2027 holiday candidates',
          status: 'provisional',
          purpose: 'Planning data only until official Government of Maharashtra and bank notifications are published.'
        }] : [])
      ],
      conventions: {
        timezone: 'IST',
        lunarMonthSystem: 'Amanta',
        ayanamsha: 'Chitrapaksha/Lahiri',
        panchangEvaluation: 'At reference sunrise',
        timings: 'Reference-location timings, rounded to the nearest minute'
      },
      recordCount: dateList.length,
      provisionalGovernmentHolidays: year === 2027
    },
    records
  };
};

const parseArgs = () => {
  const values = {};
  process.argv.slice(2).forEach((argument) => {
    const [key, value] = argument.replace(/^--/, '').split('=');
    values[key] = value === undefined ? true : value;
  });
  return values;
};

const writeJson = (target, value) => {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(value)}\n`, 'utf8');
  console.log(`Wrote ${target}`);
};

const main = () => {
  const args = parseArgs();
  const years = String(args.years || '2025,2026,2027')
    .split(',')
    .map(Number)
    .filter((year) => Number.isInteger(year) && year >= 1900 && year <= 2200);

  if (!years.length) {
    throw new Error('Provide at least one valid year with --years=2028');
  }

  const outputDir = path.resolve(__dirname, '../../src/data/calendar');
  const backendDir = args['backend-dir']
    ? path.resolve(process.cwd(), args['backend-dir'])
    : path.resolve(__dirname, '../../../backend/data/calendar');

  const manifest = {
    schemaVersion: 1,
    supportedYears: years,
    reference: REFERENCE,
    sources: SOURCES,
    files: {}
  };

  years.forEach((year) => {
    const data = generateYear(year);
    const filename = `stock-calendar-${year}.json`;
    writeJson(path.join(outputDir, filename), data);
    if (fs.existsSync(path.dirname(backendDir))) {
      writeJson(path.join(backendDir, filename), data);
    }
    manifest.files[year] = filename;
  });

  writeJson(path.join(outputDir, 'manifest.json'), manifest);
  if (fs.existsSync(path.dirname(backendDir))) {
    writeJson(path.join(backendDir, 'manifest.json'), manifest);
  }
};

main();
