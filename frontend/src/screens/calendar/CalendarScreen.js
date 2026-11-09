import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import {
  STOCK_CALENDAR_MAX_DATE,
  STOCK_CALENDAR_MIN_DATE,
  getLocalizedCalendarName,
  getReferenceMetadata,
  getStockCalendarDay,
  getStockCalendarMonth
} from '../../utils/stockCalendar';

const COPY = {
  en: {
    calendar: 'Shri Lonari Samaj Pratishthan Calendar',
    stockCalendar: 'Community Panchang Calendar',
    back: 'Back',
    today: 'Today',
    todayPanchang: "Today's Panchang",
    detailedPanchang: 'Full Details',
    tithi: 'Tithi',
    nakshatra: 'Nakshatra',
    yoga: 'Yoga',
    karana: 'Karana',
    sunriseSunset: 'Sunrise - Sunset',
    rahuKaal: 'Rahu Kaal',
    englishDate: 'English Date',
    weekday: 'Weekday',
    sakaDate: 'Shaka Date',
    vikramSamvat: 'Vikram Samvat',
    lunarDate: 'Hindu Date',
    paksha: 'Paksha',
    moonRashi: 'Moon Rashi',
    sunRashi: 'Sun Rashi',
    sunrise: 'Sunrise',
    sunset: 'Sunset',
    moonrise: 'Moonrise',
    moonset: 'Moonset',
    yamaganda: 'Yamaganda',
    gulikaKaal: 'Gulika Kaal',
    abhijitMuhurat: 'Abhijit Muhurat',
    basic: 'Basic',
    panchang: 'Panchang',
    timings: 'Timings',
    events: 'Events',
    calendarEvents: 'Calendar Events',
    browseCalendarEvents: 'View approved events or submit a short event for this date.',
    festivalHoliday: 'Festival / Holiday',
    communityEvent: 'Community event',
    personalDate: 'Birthday',
    noEvents: 'No listed observances or events for this date.',
    provisional: 'Provisional',
    official: 'Official',
    vrat: 'Vrat',
    ends: 'Ends',
    nextDay: 'next day',
    referenceTiming: 'Reference timings',
    timingNotice: 'All Panchang and timing values use the Rashtriya Panchang national reference point and IST. Local timings may vary.',
    sourceNotice: 'Official reference: Rashtriya Panchang and Indian Astronomical Ephemeris, Positional Astronomy Centre, IMD.',
    unavailable: 'Calendar data is available from 2025 through 2027.',
    birthday: 'Birthday',
    birthdayMessage: 'Your birthday',
    loadingEvents: 'Loading community events',
    monthData: 'Month view',
    selectDate: 'Select a date to view full details',
    refreshEvents: 'Refresh events',
    governmentHoliday: 'Government / bank holiday',
    calculatedObservance: 'Panchang observance',
    activeEvent: 'Active',
    upcomingEvent: 'Upcoming',
    expiredEvent: 'Expired'
  },
  mr: {
    calendar: 'श्री लोनारी समाज प्रतिष्ठान दिनदर्शिका',
    stockCalendar: 'समाज पंचांग दिनदर्शिका',
    back: 'मागे',
    today: 'आज',
    todayPanchang: 'आजचे पंचांग',
    detailedPanchang: 'संपूर्ण तपशील',
    tithi: 'तिथी',
    nakshatra: 'नक्षत्र',
    yoga: 'योग',
    karana: 'करण',
    sunriseSunset: 'सूर्योदय - सूर्यास्त',
    rahuKaal: 'राहुकाळ',
    englishDate: 'इंग्रजी दिनांक',
    weekday: 'वार',
    sakaDate: 'शालिवाहन शक दिनांक',
    vikramSamvat: 'विक्रम संवत',
    lunarDate: 'हिंदू दिनांक',
    paksha: 'पक्ष',
    moonRashi: 'चंद्र राशी',
    sunRashi: 'सूर्य राशी',
    sunrise: 'सूर्योदय',
    sunset: 'सूर्यास्त',
    moonrise: 'चंद्रोदय',
    moonset: 'चंद्रास्त',
    yamaganda: 'यमगंड',
    gulikaKaal: 'गुलिक काळ',
    abhijitMuhurat: 'अभिजित मुहूर्त',
    basic: 'मूलभूत माहिती',
    panchang: 'पंचांग',
    timings: 'वेळा',
    events: 'उत्सव व कार्यक्रम',
    calendarEvents: 'दिनदर्शिका कार्यक्रम',
    browseCalendarEvents: 'या तारखेसाठी मंजूर कार्यक्रम पहा किंवा लहान कार्यक्रम पाठवा.',
    festivalHoliday: 'सण / सुट्टी',
    communityEvent: 'समाज कार्यक्रम',
    personalDate: 'वाढदिवस',
    noEvents: 'या तारखेसाठी कोणताही नोंदवलेला उत्सव किंवा कार्यक्रम नाही.',
    provisional: 'तात्पुरते',
    official: 'अधिकृत',
    vrat: 'व्रत',
    ends: 'समाप्ती',
    nextDay: 'पुढील दिवस',
    referenceTiming: 'संदर्भ वेळा',
    timingNotice: 'सर्व पंचांग व वेळा राष्ट्रीय पंचांगाच्या राष्ट्रीय संदर्भ बिंदू आणि भारतीय प्रमाणवेळेनुसार आहेत. स्थानिक वेळांमध्ये फरक असू शकतो.',
    sourceNotice: 'अधिकृत संदर्भ: राष्ट्रीय पंचांग व इंडियन अॅस्ट्रॉनॉमिकल इफेमेरिस, पोझिशनल अॅस्ट्रॉनॉमी सेंटर, आयएमडी.',
    unavailable: 'दिनदर्शिका माहिती २०२५ ते २०२७ या वर्षांसाठी उपलब्ध आहे.',
    birthday: 'वाढदिवस',
    birthdayMessage: 'तुमचा वाढदिवस',
    loadingEvents: 'समाज कार्यक्रम लोड होत आहेत',
    monthData: 'महिना दृश्य',
    selectDate: 'संपूर्ण तपशीलासाठी तारीख निवडा',
    refreshEvents: 'कार्यक्रम पुन्हा लोड करा',
    governmentHoliday: 'शासकीय / बँक सुट्टी',
    calculatedObservance: 'पंचांग व्रत / उत्सव',
    activeEvent: 'सुरू आहे',
    upcomingEvent: 'आगामी',
    expiredEvent: 'समाप्त'
  },
  hi: {
    calendar: 'श्री लोनारी समाज प्रतिष्ठान दिनदर्शिका',
    stockCalendar: 'समाज पंचांग कैलेंडर',
    back: 'वापस',
    today: 'आज',
    todayPanchang: 'आज का पंचांग',
    detailedPanchang: 'संपूर्ण विवरण',
    tithi: 'तिथि',
    nakshatra: 'नक्षत्र',
    yoga: 'योग',
    karana: 'करण',
    sunriseSunset: 'सूर्योदय - सूर्यास्त',
    rahuKaal: 'राहु काल',
    englishDate: 'अंग्रेजी तारीख',
    weekday: 'वार',
    sakaDate: 'शक तारीख',
    vikramSamvat: 'विक्रम संवत',
    lunarDate: 'हिंदू तारीख',
    paksha: 'पक्ष',
    moonRashi: 'चंद्र राशि',
    sunRashi: 'सूर्य राशि',
    sunrise: 'सूर्योदय',
    sunset: 'सूर्यास्त',
    moonrise: 'चंद्रोदय',
    moonset: 'चंद्रास्त',
    yamaganda: 'यमगंड',
    gulikaKaal: 'गुलिक काल',
    abhijitMuhurat: 'अभिजित मुहूर्त',
    basic: 'मूल जानकारी',
    panchang: 'पंचांग',
    timings: 'समय',
    events: 'त्योहार और कार्यक्रम',
    calendarEvents: 'कैलेंडर कार्यक्रम',
    browseCalendarEvents: 'इस तारीख के स्वीकृत कार्यक्रम देखें या छोटा कार्यक्रम भेजें।',
    festivalHoliday: 'त्योहार / अवकाश',
    communityEvent: 'समाज कार्यक्रम',
    personalDate: 'जन्मदिन',
    noEvents: 'इस तारीख के लिए कोई सूचीबद्ध त्योहार या कार्यक्रम नहीं है।',
    provisional: 'अस्थायी',
    official: 'आधिकारिक',
    vrat: 'व्रत',
    ends: 'समाप्ति',
    nextDay: 'अगला दिन',
    referenceTiming: 'संदर्भ समय',
    timingNotice: 'सभी पंचांग और समय राष्ट्रीय पंचांग के राष्ट्रीय संदर्भ बिंदु तथा भारतीय मानक समय पर आधारित हैं। स्थानीय समय अलग हो सकता है।',
    sourceNotice: 'आधिकारिक संदर्भ: राष्ट्रीय पंचांग और इंडियन एस्ट्रोनॉमिकल इफेमेरिस, पोजिशनल एस्ट्रोनॉमी सेंटर, आईएमडी।',
    unavailable: 'कैलेंडर डेटा 2025 से 2027 तक उपलब्ध है।',
    birthday: 'जन्मदिन',
    birthdayMessage: 'आपका जन्मदिन',
    loadingEvents: 'समाज कार्यक्रम लोड हो रहे हैं',
    monthData: 'माह दृश्य',
    selectDate: 'पूरा विवरण देखने के लिए तारीख चुनें',
    refreshEvents: 'कार्यक्रम फिर लोड करें',
    governmentHoliday: 'सरकारी / बैंक अवकाश',
    calculatedObservance: 'पंचांग व्रत / पर्व',
    activeEvent: 'सक्रिय',
    upcomingEvent: 'आगामी',
    expiredEvent: 'समाप्त'
  }
};

const CALENDAR_LOCALES = {
  en: {
    monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    today: 'Today'
  },
  mr: {
    monthNames: ['जानेवारी', 'फेब्रुवारी', 'मार्च', 'एप्रिल', 'मे', 'जून', 'जुलै', 'ऑगस्ट', 'सप्टेंबर', 'ऑक्टोबर', 'नोव्हेंबर', 'डिसेंबर'],
    monthNamesShort: ['जाने', 'फेब्रु', 'मार्च', 'एप्रि', 'मे', 'जून', 'जुलै', 'ऑग', 'सप्टें', 'ऑक्टो', 'नोव्हें', 'डिसें'],
    dayNames: ['रविवार', 'सोमवार', 'मंगळवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'],
    dayNamesShort: ['रवि', 'सोम', 'मंगळ', 'बुध', 'गुरु', 'शुक्र', 'शनि'],
    today: 'आज'
  },
  hi: {
    monthNames: ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'],
    monthNamesShort: ['जन', 'फ़र', 'मार्च', 'अप्रै', 'मई', 'जून', 'जुल', 'अग', 'सितं', 'अक्टू', 'नवं', 'दिसं'],
    dayNames: ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'],
    dayNamesShort: ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'],
    today: 'आज'
  }
};

Object.entries(CALENDAR_LOCALES).forEach(([key, value]) => {
  LocaleConfig.locales[key] = value;
});

const DATE_LOCALES = {
  en: 'en-IN',
  mr: 'mr-IN',
  hi: 'hi-IN'
};

const getToday = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const key = `${year}-${month}-${day}`;
  if (getStockCalendarDay(key)) return key;
  return STOCK_CALENDAR_MAX_DATE;
};

const formatDate = (dateString, language, options = {}) => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Intl.DateTimeFormat(DATE_LOCALES[language] || DATE_LOCALES.en, {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: options.short ? 'short' : 'long',
    year: 'numeric',
    weekday: options.weekday ? 'long' : undefined
  }).format(new Date(Date.UTC(year, month - 1, day, 6)));
};

const formatRange = (value) => (
  value?.start && value?.end ? `${value.start} - ${value.end}` : '-'
);

const formatEndTime = (value, copy) => {
  if (!value?.time) return '-';
  return value.dayOffset > 0
    ? `${value.time} (${copy.nextDay})`
    : value.time;
};

const shortLunarLabel = (record, language) => {
  if (!record) return '';
  const month = getLocalizedCalendarName(record.lunar.month.name, language);
  return `${month.slice(0, 4)} ${record.panchang.tithi.pakshaNumber}`;
};

const getCalendarPalette = (theme, isDark) => ({
  headerGradient: isDark ? ['#29221E', '#211C19'] : ['#FFF8F1', '#FFE7D6'],
  headerChip: theme.headerActionSurface || theme.primarySoft || theme.surfaceMuted,
  monthSurface: isDark ? '#181D26' : '#FFFDF8',
  monthHeader: isDark ? '#181D26' : '#FFFDF8',
  daySurface: isDark ? '#1E2530' : '#FFF8EE',
  dayDisabledSurface: isDark ? '#151A22' : '#F1ECE5',
  todaySurface: isDark ? '#342A14' : '#FFF2C7',
  selectedSurface: isDark ? '#E85D2A' : '#B94716',
  todayPanel: isDark ? '#201B19' : '#FFF9F4',
  todayBorder: isDark ? '#493127' : '#F0D0BA',
  selectedPanel: isDark ? '#211C19' : '#FFF8F1',
  selectedBorder: isDark ? '#493127' : '#F0D0BA',
  basicPanel: isDark ? '#241D19' : '#FFF8F1',
  basicBorder: isDark ? '#4A3126' : '#F0D0BA',
  panchangPanel: isDark ? '#1C2030' : '#F6F5FF',
  panchangBorder: isDark ? '#34405A' : '#DADCF5',
  timingsPanel: isDark ? '#292310' : '#FFF9E8',
  timingsBorder: isDark ? '#51451B' : '#F0D99A',
  moon: isDark ? '#93C5FD' : '#2563A8',
  nakshatra: isDark ? '#C4B5FD' : '#6D28D9',
  sun: isDark ? '#FBBF24' : '#D97904',
  timing: isDark ? '#5EEAD4' : '#0F8B8D',
  festival: isDark ? '#FBBF24' : '#B7791F',
  personal: isDark ? '#F9A8D4' : '#B83280',
  holiday: isDark ? '#FB7185' : '#B42318',
  vrat: isDark ? '#A5B4FC' : '#4F46E5',
  neutralBorder: isDark ? '#31404B' : '#E7D8C7',
  softShadow: isDark ? theme.shadow : '#7F1D1D'
});

const getCalendarEventColor = (event, theme, palette) => {
  if (event.kind === 'birthday') return palette?.personal || theme.rose;
  if (event.governmentHoliday || event.bankHoliday) return palette?.holiday || theme.primary;
  if (event.vrat) return palette?.vrat || theme.tertiary;
  return palette?.festival || theme.accent;
};

const CalendarScreen = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const { language } = useLanguage();
  const { user } = useAuth();
  const copy = COPY[language] || COPY.en;
  const today = useMemo(getToday, []);
  const [selectedDate, setSelectedDate] = useState(today);
  const [visibleMonth, setVisibleMonth] = useState(() => ({
    year: Number(today.slice(0, 4)),
    month: Number(today.slice(5, 7))
  }));

  LocaleConfig.defaultLocale = CALENDAR_LOCALES[language] ? language : 'en';

  const reference = getReferenceMetadata();
  const todayRecord = getStockCalendarDay(today);
  const selectedRecord = getStockCalendarDay(selectedDate);
  const calendarPalette = useMemo(() => getCalendarPalette(theme, isDark), [theme, isDark]);
  const headerForeground = theme.headerText || theme.text;
  const headerMuted = isDark ? 'rgba(248, 250, 252, 0.72)' : 'rgba(41, 30, 24, 0.64)';
  const calendarTheme = useMemo(() => ({
    backgroundColor: calendarPalette.monthSurface,
    calendarBackground: calendarPalette.monthSurface,
    textSectionTitleColor: theme.textSecondary,
    selectedDayBackgroundColor: calendarPalette.selectedSurface,
    selectedDayTextColor: '#FFFFFF',
    todayTextColor: calendarPalette.selectedSurface,
    dayTextColor: theme.text,
    textDisabledColor: theme.textMuted,
    dotColor: calendarPalette.festival,
    selectedDotColor: '#FFFFFF',
    arrowColor: calendarPalette.selectedSurface,
    monthTextColor: theme.text,
    indicatorColor: calendarPalette.selectedSurface,
    textMonthFontWeight: '800',
    textDayHeaderFontWeight: '700',
    textMonthFontSize: 17,
    textDayHeaderFontSize: 11,
    'stylesheet.calendar.main': {
      container: {
        backgroundColor: calendarPalette.monthSurface
      },
      monthView: {
        backgroundColor: calendarPalette.monthSurface
      },
      week: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: calendarPalette.monthSurface,
        marginVertical: 0
      }
    },
    'stylesheet.calendar.header': {
      header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingLeft: 8,
        paddingRight: 8,
        marginTop: 6,
        backgroundColor: calendarPalette.monthHeader
      },
      monthText: {
        color: theme.text,
        fontSize: 17,
        fontWeight: '800'
      },
      dayHeader: {
        color: theme.textSecondary,
        fontSize: 11,
        fontWeight: '700'
      }
    }
  }), [theme, calendarPalette]);
  const monthRecords = useMemo(
    () => getStockCalendarMonth(visibleMonth.year, visibleMonth.month),
    [visibleMonth]
  );

  const handleBack = () => {
    const parentNavigation = navigation?.getParent?.();
    if (navigation?.canGoBack?.()) {
      navigation.goBack();
      return;
    }
    if (parentNavigation?.canGoBack?.()) {
      parentNavigation.goBack();
      return;
    }
    navigation?.navigate?.('Home');
  };

  const birthdayDate = useMemo(() => {
    if (!user?.dateOfBirth) return null;
    const date = new Date(user.dateOfBirth);
    if (Number.isNaN(date.getTime())) return null;
    return `${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
  }, [user?.dateOfBirth]);

  const getPersonalEvents = (dateString) => {
    if (!birthdayDate || dateString.slice(5) !== birthdayDate) return [];
    return [{
      key: 'my-birthday',
      kind: 'birthday',
      names: {
        en: copy.birthdayMessage,
        mr: copy.birthdayMessage,
        hi: copy.birthdayMessage
      }
    }];
  };

  const getEventsForDate = (dateString) => {
    const record = getStockCalendarDay(dateString);
    return [
      ...(record?.events || []),
      ...getPersonalEvents(dateString)
    ];
  };

  const todayEvents = todayRecord ? getEventsForDate(today) : [];

  const markedDates = useMemo(() => {
    const marks = {};
    monthRecords.forEach((record) => {
      const events = [
        ...record.events,
        ...getPersonalEvents(record.date)
      ];
      if (events.length) {
        marks[record.date] = { hasEvents: true };
      }
    });
    return marks;
  }, [monthRecords, birthdayDate]);

  const renderCalendarDay = ({ date, state }) => {
    const record = getStockCalendarDay(date.dateString);
    const events = record ? getEventsForDate(date.dateString) : [];
    const selected = selectedDate === date.dateString;
    const isToday = today === date.dateString;
    const disabled = state === 'disabled' || !record;
    const stockEvent = events.some((event) => event.kind !== 'community' && event.kind !== 'birthday');
    const personalEvent = events.some((event) => event.kind === 'birthday');

    return (
      <TouchableOpacity
        activeOpacity={0.75}
        disabled={disabled}
        onPress={() => setSelectedDate(date.dateString)}
        style={[
          styles.dayCell,
          { backgroundColor: 'transparent', borderColor: 'transparent' },
          selected && { backgroundColor: calendarPalette.selectedSurface, borderColor: calendarPalette.selectedSurface },
          isToday && !selected && {
            backgroundColor: 'transparent',
            borderColor: calendarPalette.selectedSurface,
            borderWidth: 1
          },
          disabled && [styles.dayCellDisabled, { backgroundColor: 'transparent' }]
        ]}
      >
        <Text
          style={[
            styles.dayNumber,
            { color: disabled ? theme.textMuted : theme.text },
            selected && styles.selectedDayText
          ]}
        >
          {date.day}
        </Text>
        {Boolean(record) && (
          <>
            <Text
              style={[
                styles.lunarDay,
                { color: selected ? '#FFFFFF' : theme.textSecondary }
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {shortLunarLabel(record, language)}
            </Text>
          </>
        )}
        <View style={styles.dayDots}>
          {Boolean(stockEvent) && <View style={[styles.dayDot, { backgroundColor: selected ? '#FFFFFF' : calendarPalette.festival }]} />}
          {Boolean(personalEvent) && <View style={[styles.dayDot, { backgroundColor: selected ? '#FFFFFF' : calendarPalette.personal }]} />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <LinearGradient
          colors={calendarPalette.headerGradient}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerTitleRow}>
            <TouchableOpacity
              activeOpacity={0.82}
              accessibilityRole="button"
              accessibilityLabel={copy.back}
              onPress={handleBack}
              style={[styles.backButton, { backgroundColor: calendarPalette.headerChip }]}
            >
              <Ionicons name="chevron-back" size={18} color={theme.headerIcon || theme.primary} />
            </TouchableOpacity>
            <View style={styles.headerCopy}>
              <Text style={[styles.headerEyebrow, { color: headerMuted }]} numberOfLines={1}>{copy.stockCalendar}</Text>
              <Text style={[styles.headerTitle, { color: headerForeground }]} numberOfLines={1} adjustsFontSizeToFit>{copy.calendar}</Text>
            </View>
            <View style={[styles.headerIcon, { backgroundColor: calendarPalette.headerChip }]}>
              <Ionicons name="calendar" size={21} color={theme.headerIcon || theme.primary} />
            </View>
          </View>
          <View style={[styles.referenceChip, { backgroundColor: calendarPalette.headerChip }]}>
            <Ionicons name="location-outline" size={12} color={theme.headerIcon || theme.primary} />
            <Text style={[styles.referenceChipText, { color: headerForeground }]}>
              {reference.code} · {reference.timezoneLabel}
            </Text>
          </View>
        </LinearGradient>

        {Boolean(todayRecord) && (
          <View style={[styles.todayBand, { backgroundColor: calendarPalette.todayPanel, borderColor: calendarPalette.todayBorder }]}>
            <View style={styles.sectionHeading}>
              <View>
                <Text style={[styles.sectionEyebrow, { color: theme.primary }]}>{copy.today}</Text>
                <Text style={[styles.todayDate, { color: theme.text }]}>
                  {formatDate(today, language, { weekday: true })}
                </Text>
                <Text style={[styles.todayLunar, { color: theme.textSecondary }]}>
                  {getLocalizedCalendarName(todayRecord.saka.monthName, language)} {todayRecord.saka.day}, {todayRecord.saka.year}
                  {' · '}
                  {[getLocalizedCalendarName(todayRecord.lunar.month.name, language), getLocalizedCalendarName(todayRecord.lunar.paksha.name, language)].filter(Boolean).join(' ')}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.todayButton, { backgroundColor: calendarPalette.todaySurface }]}
                onPress={() => {
                  setSelectedDate(today);
                  setVisibleMonth({ year: todayRecord.year, month: todayRecord.month });
                }}
              >
                <Ionicons name="locate" size={18} color={calendarPalette.selectedSurface} />
              </TouchableOpacity>
            </View>

            <View style={styles.todayMetrics}>
              <SummaryMetric
                icon="moon-outline"
                label={copy.tithi}
                value={getLocalizedCalendarName(todayRecord.panchang.tithi.name, language)}
                theme={theme}
                accent={calendarPalette.moon}
              />
              <SummaryMetric
                icon="sparkles-outline"
                label={copy.nakshatra}
                value={getLocalizedCalendarName(todayRecord.panchang.nakshatra.name, language)}
                theme={theme}
                accent={calendarPalette.nakshatra}
              />
              <SummaryMetric
                icon="sunny-outline"
                label={copy.sunriseSunset}
                value={`${todayRecord.astronomy.sunrise} - ${todayRecord.astronomy.sunset}`}
                theme={theme}
                accent={calendarPalette.sun}
              />
              <SummaryMetric
                icon="timer-outline"
                label={copy.rahuKaal}
                value={formatRange(todayRecord.timings.rahuKaal)}
                theme={theme}
                accent={calendarPalette.timing}
              />
            </View>

            <View style={[styles.languageDates, { backgroundColor: theme.surfaceRaised, borderColor: theme.border }]}>
              <LanguageDate code="EN" value={formatDate(today, 'en')} theme={theme} />
              <LanguageDate code="मराठी" value={formatDate(today, 'mr')} theme={theme} />
              <LanguageDate code="हिंदी" value={formatDate(today, 'hi')} theme={theme} />
            </View>

            {Boolean(todayEvents.length > 0) && (
              <View style={[styles.todayEvents, { backgroundColor: theme.surfaceRaised, borderColor: calendarPalette.todayBorder }]}>
                {todayEvents.slice(0, 3).map((event, index) => (
                  <View key={`${event.key || event._id || 'today'}-${index}`} style={styles.todayEventRow}>
                    <View style={[styles.eventMarker, { backgroundColor: getCalendarEventColor(event, theme, calendarPalette) }]} />
                    <Text style={[styles.todayEventText, { color: theme.text }]} numberOfLines={1}>
                      {getLocalizedCalendarName(event.names, language)}
                    </Text>
                    {Boolean(event.provisional) && (
                      <Text style={[styles.provisionalText, { color: theme.warning }]}>{copy.provisional}</Text>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        <View style={styles.calendarSection}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.sectionTitleCopyRow}>
              <View style={[styles.sectionTitleIcon, { backgroundColor: theme.primarySoft }]}>
                <Ionicons name="calendar-outline" size={17} color={theme.primary} />
              </View>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>{copy.monthData}</Text>
            </View>
          </View>

          <View
            style={[
              styles.calendarContainer,
              {
                backgroundColor: calendarPalette.monthSurface,
                borderColor: calendarPalette.neutralBorder,
                shadowColor: calendarPalette.softShadow
              }
            ]}
          >
            <Calendar
              key={`${language}-${isDark ? 'dark' : 'light'}`}
              style={[styles.calendarView, { backgroundColor: calendarPalette.monthSurface }]}
              current={selectedDate}
              minDate={STOCK_CALENDAR_MIN_DATE}
              maxDate={STOCK_CALENDAR_MAX_DATE}
              onDayPress={(day) => setSelectedDate(day.dateString)}
              onMonthChange={(month) => setVisibleMonth({ year: month.year, month: month.month })}
              markedDates={markedDates}
              dayComponent={renderCalendarDay}
              theme={calendarTheme}
              enableSwipeMonths
              hideExtraDays={false}
              renderArrow={(direction) => (
                <Ionicons
                  name={direction === 'left' ? 'chevron-back' : 'chevron-forward'}
                  size={22}
                  color={calendarPalette.selectedSurface}
                />
              )}
            />
          </View>

          <View style={styles.legend}>
            <LegendItem color={calendarPalette.festival} label={copy.festivalHoliday} theme={theme} />
            <LegendItem color={calendarPalette.personal} label={copy.personalDate} theme={theme} />
          </View>
        </View>

        {selectedRecord ? (
          <View style={styles.detailsSection}>
            <View
              style={[
                styles.selectedHeader,
                { backgroundColor: calendarPalette.selectedPanel, borderColor: calendarPalette.selectedBorder }
              ]}
            >
              <View style={[styles.selectedDateIcon, { backgroundColor: calendarPalette.selectedSurface }]}>
                <Text style={styles.selectedDateDay}>{selectedRecord.day}</Text>
                <Text style={styles.selectedDateMonth}>
                  {CALENDAR_LOCALES[language]?.monthNamesShort[selectedRecord.month - 1]
                    || CALENDAR_LOCALES.en.monthNamesShort[selectedRecord.month - 1]}
                </Text>
              </View>
              <View style={styles.selectedHeaderCopy}>
                <Text style={[styles.sectionEyebrow, { color: theme.primary }]}>{copy.detailedPanchang}</Text>
                <Text style={[styles.selectedTitle, { color: theme.text }]}>
                  {formatDate(selectedDate, language, { weekday: true })}
                </Text>
                <Text style={[styles.selectedSubtitle, { color: theme.textSecondary }]}>
                  {getLocalizedCalendarName(selectedRecord.lunar.month.name, language)}
                  {' · '}
                  {getLocalizedCalendarName(selectedRecord.lunar.paksha.name, language)}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              activeOpacity={0.84}
              onPress={() => navigation.navigate('CalendarEvents', { selectedDate })}
              style={[styles.calendarEventsCard, { backgroundColor: theme.primarySoft || theme.surfaceMuted, borderColor: theme.primary }]}
            >
              <View style={[styles.calendarEventsIcon, { backgroundColor: theme.primary }]}>
                <Ionicons name="calendar-number-outline" size={21} color="#FFFFFF" />
              </View>
              <View style={styles.calendarEventsCopy}>
                <Text style={[styles.calendarEventsTitle, { color: theme.text }]}>{copy.calendarEvents}</Text>
                <Text style={[styles.calendarEventsHint, { color: theme.textSecondary }]}>{copy.browseCalendarEvents}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.primary} />
            </TouchableOpacity>


            <DetailSection
              title={copy.basic}
              icon="information-circle-outline"
              theme={theme}
              accent={theme.primary}
              surface={calendarPalette.basicPanel}
              borderColor={calendarPalette.basicBorder}
            >
              <DetailGrid>
                <DetailItem label={copy.englishDate} value={formatDate(selectedDate, 'en')} theme={theme} />
                <DetailItem label={copy.weekday} value={getLocalizedCalendarName(selectedRecord.weekday.name, language)} theme={theme} />
                <DetailItem
                  label={copy.sakaDate}
                  value={`${getLocalizedCalendarName(selectedRecord.saka.monthName, language)} ${selectedRecord.saka.day}, ${selectedRecord.saka.year}`}
                  theme={theme}
                />
                <DetailItem label={copy.vikramSamvat} value={String(selectedRecord.vikramSamvat)} theme={theme} />
                <DetailItem
                  label={copy.lunarDate}
                  value={`${getLocalizedCalendarName(selectedRecord.lunar.month.name, language)} ${selectedRecord.panchang.tithi.pakshaNumber}`}
                  theme={theme}
                />
                <DetailItem label={copy.paksha} value={getLocalizedCalendarName(selectedRecord.lunar.paksha.name, language)} theme={theme} />
              </DetailGrid>
            </DetailSection>

            <DetailSection
              title={copy.panchang}
              icon="moon-outline"
              theme={theme}
              accent={calendarPalette.moon}
              surface={calendarPalette.panchangPanel}
              borderColor={calendarPalette.panchangBorder}
            >
              <DetailRow
                label={copy.tithi}
                value={getLocalizedCalendarName(selectedRecord.panchang.tithi.name, language)}
                meta={`${copy.ends}: ${formatEndTime(selectedRecord.panchang.tithi.endsAt, copy)}`}
                theme={theme}
              />
              <DetailRow
                label={copy.nakshatra}
                value={getLocalizedCalendarName(selectedRecord.panchang.nakshatra.name, language)}
                meta={`${copy.ends}: ${formatEndTime(selectedRecord.panchang.nakshatra.endsAt, copy)}`}
                theme={theme}
              />
              <DetailRow
                label={copy.yoga}
                value={getLocalizedCalendarName(selectedRecord.panchang.yoga.name, language)}
                meta={`${copy.ends}: ${formatEndTime(selectedRecord.panchang.yoga.endsAt, copy)}`}
                theme={theme}
              />
              <DetailRow
                label={copy.karana}
                value={getLocalizedCalendarName(selectedRecord.panchang.karana.name, language)}
                meta={`${copy.ends}: ${formatEndTime(selectedRecord.panchang.karana.endsAt, copy)}`}
                theme={theme}
              />
              <DetailRow label={copy.moonRashi} value={getLocalizedCalendarName(selectedRecord.panchang.moonRashi, language)} theme={theme} />
              <DetailRow label={copy.sunRashi} value={getLocalizedCalendarName(selectedRecord.panchang.sunRashi, language)} theme={theme} last />
            </DetailSection>

            <DetailSection
              title={copy.timings}
              icon="time-outline"
              theme={theme}
              accent={calendarPalette.sun}
              surface={calendarPalette.timingsPanel}
              borderColor={calendarPalette.timingsBorder}
            >
              <DetailGrid>
                <DetailItem label={copy.sunrise} value={selectedRecord.astronomy.sunrise || '-'} theme={theme} />
                <DetailItem label={copy.sunset} value={selectedRecord.astronomy.sunset || '-'} theme={theme} />
                <DetailItem label={copy.moonrise} value={selectedRecord.astronomy.moonrise || '-'} theme={theme} />
                <DetailItem label={copy.moonset} value={selectedRecord.astronomy.moonset || '-'} theme={theme} />
                <DetailItem label={copy.rahuKaal} value={formatRange(selectedRecord.timings.rahuKaal)} theme={theme} />
                <DetailItem label={copy.yamaganda} value={formatRange(selectedRecord.timings.yamaganda)} theme={theme} />
                <DetailItem label={copy.gulikaKaal} value={formatRange(selectedRecord.timings.gulikaKaal)} theme={theme} />
                <DetailItem label={copy.abhijitMuhurat} value={formatRange(selectedRecord.timings.abhijitMuhurat)} theme={theme} />
              </DetailGrid>
            </DetailSection>

            <View style={[styles.referencePanel, { backgroundColor: theme.secondarySoft, borderColor: theme.secondary }]}>
              <View style={styles.referenceTitleRow}>
                <Ionicons name="navigate-circle-outline" size={21} color={theme.secondary} />
                <Text style={[styles.referenceTitle, { color: theme.text }]}>{copy.referenceTiming}</Text>
              </View>
              <Text style={[styles.referenceText, { color: theme.textSecondary }]}>{copy.timingNotice}</Text>
              <Text style={[styles.referenceCoordinates, { color: theme.secondary }]}>
                82°30′ E · 23°11′ N · {reference.timezoneLabel}
              </Text>
              <Text style={[styles.sourceText, { color: theme.textMuted }]}>{copy.sourceNotice}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.unavailable}>
            <Ionicons name="calendar-clear-outline" size={36} color={theme.textMuted} />
            <Text style={[styles.unavailableText, { color: theme.textSecondary }]}>{copy.unavailable}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const SummaryMetric = ({ icon, label, value, theme, accent }) => (
  <View
    style={[
      styles.summaryMetric,
      {
        backgroundColor: `${accent || theme.primary}12`,
        borderColor: `${accent || theme.primary}55`
      }
    ]}
  >
    <View style={[styles.metricIcon, { backgroundColor: `${accent || theme.primary}18` }]}>
      <Ionicons name={icon} size={17} color={accent || theme.primary} />
    </View>
    <View style={styles.summaryMetricCopy}>
      <Text style={[styles.metricLabel, { color: theme.textMuted }]}>{label}</Text>
      <Text style={[styles.metricValue, { color: theme.text }]} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
    </View>
  </View>
);

const LegendItem = ({ color, label, theme }) => (
  <View
    style={[
      styles.legendItem,
      { backgroundColor: `${color}12`, borderColor: `${color}3D` }
    ]}
  >
    <View style={[styles.legendDot, { backgroundColor: color }]} />
    <Text style={[styles.legendText, { color: theme.textSecondary }]}>{label}</Text>
  </View>
);

const LanguageDate = ({ code, value, theme }) => (
  <View style={styles.languageDateRow}>
    <View style={[styles.languageDateBadge, { backgroundColor: theme.primarySoft }]}>
      <Text style={[styles.languageDateCode, { color: theme.primary }]}>{code}</Text>
    </View>
    <Text style={[styles.languageDateValue, { color: theme.text }]}>{value}</Text>
  </View>
);

const DetailSection = ({ title, icon, theme, accent, surface, borderColor, children }) => (
  <View
    style={[
      styles.detailSection,
      { backgroundColor: surface || theme.surfaceRaised, borderColor: borderColor || theme.border }
    ]}
  >
    <View style={styles.detailSectionTitleRow}>
      <View style={[styles.detailSectionIcon, { backgroundColor: `${accent || theme.primary}18` }]}>
        <Ionicons name={icon} size={18} color={accent || theme.primary} />
      </View>
      <Text style={[styles.detailSectionTitle, { color: theme.text }]}>{title}</Text>
    </View>
    {children}
  </View>
);

const DetailGrid = ({ children }) => (
  <View style={styles.detailGrid}>{children}</View>
);

const DetailItem = ({ label, value, theme }) => (
  <View style={[styles.detailItem, { backgroundColor: theme.surfaceRaised, borderColor: theme.border }]}>
    <Text style={[styles.detailLabel, { color: theme.textMuted }]} numberOfLines={1}>{label}</Text>
    <Text style={[styles.detailValue, { color: theme.text }]} numberOfLines={2} adjustsFontSizeToFit>{value}</Text>
  </View>
);

const DetailRow = ({ label, value, meta, theme, last = false }) => (
  <View style={[styles.detailRow, { borderBottomColor: theme.border }, last && styles.detailRowLast]}>
    <Text style={[styles.detailRowLabel, { color: theme.textSecondary }]}>{label}</Text>
    <View style={styles.detailRowValueWrap}>
      <Text style={[styles.detailRowValue, { color: theme.text }]}>{value}</Text>
      {Boolean(meta) && <Text style={[styles.detailRowMeta, { color: theme.textMuted }]}>{meta}</Text>}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  content: {
    paddingBottom: 32
  },
  header: {
    paddingHorizontal: 12,
    paddingTop: 7,
    paddingBottom: 8
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.12)'
  },
  headerTitleRow: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center'
  },
  headerEyebrow: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0,
    textTransform: 'uppercase'
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    lineHeight: 21,
    fontWeight: '900',
    marginTop: 0,
    textAlign: 'center'
  },
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)'
  },
  referenceChip: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.14)',
    gap: 4
  },
  referenceChipText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '700'
  },
  todayBand: {
    marginTop: 0,
    paddingHorizontal: 16,
    paddingTop: 17,
    paddingBottom: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between'
  },
  sectionEyebrow: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase'
  },
  todayDate: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '900',
    marginTop: 3
  },
  todayLunar: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
    marginTop: 3
  },
  todayButton: {
    width: 38,
    height: 38,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center'
  },
  todayMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 14,
    gap: 8
  },
  summaryMetric: {
    width: '48.5%',
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 7,
    paddingHorizontal: 9,
    paddingVertical: 7
  },
  metricIcon: {
    width: 30,
    height: 30,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center'
  },
  summaryMetricCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 7
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '700'
  },
  metricValue: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2
  },
  todayEvents: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  languageDates: {
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 13,
    paddingHorizontal: 9,
    paddingVertical: 5
  },
  languageDateRow: {
    minHeight: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9
  },
  languageDateBadge: {
    width: 52,
    height: 21,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center'
  },
  languageDateCode: {
    fontSize: 9,
    fontWeight: '900',
    textAlign: 'center'
  },
  languageDateValue: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700'
  },
  todayEventRow: {
    minHeight: 28,
    flexDirection: 'row',
    alignItems: 'center'
  },
  eventMarker: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 8
  },
  todayEventText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700'
  },
  provisionalText: {
    fontSize: 9,
    fontWeight: '800',
    marginLeft: 8,
    textTransform: 'uppercase'
  },
  calendarSection: {
    paddingHorizontal: 12,
    paddingTop: 18
  },
  sectionTitleRow: {
    minHeight: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4
  },
  sectionTitleCopyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  sectionTitleIcon: {
    width: 31,
    height: 31,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '900'
  },
  loadingText: {
    fontSize: 10,
    fontWeight: '600'
  },
  calendarContainer: {
    borderWidth: 1,
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 8,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3
  },
  calendarView: {
    width: '100%',
    paddingHorizontal: 4,
    paddingBottom: 6
  },
  dayCell: {
    width: 43,
    height: 54,
    borderWidth: 1,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
    paddingVertical: 5
  },
  dayCellDisabled: {
    opacity: 0.34
  },
  dayNumber: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '900'
  },
  selectedDayText: {
    color: '#FFFFFF'
  },
  lunarDay: {
    width: '100%',
    fontSize: 8,
    lineHeight: 11,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 3
  },
  dayDots: {
    height: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    gap: 3
  },
  dayDot: {
    width: 5,
    height: 5,
    borderRadius: 3
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 4,
    paddingTop: 11,
    gap: 7
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 5
  },
  legendDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 5
  },
  legendText: {
    fontSize: 10,
    fontWeight: '600'
  },
  detailsSection: {
    paddingHorizontal: 12,
    paddingTop: 22
  },
  calendarEventsCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 15, padding: 13, marginBottom: 12 },
  calendarEventsIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 11 },
  calendarEventsCopy: { flex: 1, minWidth: 0 },
  calendarEventsTitle: { fontSize: 15, fontWeight: '800', marginBottom: 3 },
  calendarEventsHint: { fontSize: 12, lineHeight: 17, paddingRight: 8 },
  selectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 13,
    padding: 12,
    marginBottom: 12
  },
  selectedDateIcon: {
    width: 58,
    height: 62,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  selectedDateDay: {
    color: '#FFFFFF',
    fontSize: 25,
    lineHeight: 28,
    fontWeight: '900'
  },
  selectedDateMonth: {
    color: 'rgba(255,255,255,0.86)',
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase'
  },
  selectedHeaderCopy: {
    flex: 1,
    minWidth: 0
  },
  selectedTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '900',
    marginTop: 3
  },
  selectedSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2
  },
  detailSection: {
    borderWidth: 1,
    borderRadius: 13,
    padding: 12,
    marginBottom: 12
  },
  detailSectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 9
  },
  detailSectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  detailSectionTitle: {
    fontSize: 15,
    fontWeight: '900'
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  detailItem: {
    width: '48.5%',
    minHeight: 58,
    borderWidth: 1,
    borderRadius: 9,
    paddingHorizontal: 10,
    paddingVertical: 8,
    justifyContent: 'center'
  },
  detailLabel: {
    fontSize: 9,
    fontWeight: '700'
  },
  detailValue: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    marginTop: 3
  },
  detailRow: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingVertical: 8
  },
  detailRowLast: {
    borderBottomWidth: 0
  },
  detailRowLabel: {
    width: '34%',
    fontSize: 11,
    fontWeight: '700'
  },
  detailRowValueWrap: {
    flex: 1,
    alignItems: 'flex-end'
  },
  detailRowValue: {
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'right'
  },
  detailRowMeta: {
    fontSize: 9,
    fontWeight: '600',
    marginTop: 3,
    textAlign: 'right'
  },
  referencePanel: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginTop: 0
  },
  referenceTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7
  },
  referenceTitle: {
    fontSize: 13,
    fontWeight: '900'
  },
  referenceText: {
    fontSize: 11,
    lineHeight: 17,
    marginTop: 7
  },
  referenceCoordinates: {
    fontSize: 11,
    fontWeight: '900',
    marginTop: 8
  },
  sourceText: {
    fontSize: 9,
    lineHeight: 14,
    marginTop: 6
  },
  unavailable: {
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 40
  },
  unavailableText: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 10
  }
});

export default CalendarScreen;
