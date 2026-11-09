import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import EmptyState from '../../components/common/EmptyState';
import FriendlyErrorScreen from '../../components/common/FriendlyErrorScreen';
import { InlineSkeletonList } from '../../components/common/AppSkeletonScreen';
import OptimizedImage from '../../components/common/OptimizedImage';
import { ApiService } from '../../services/api';
import { getFriendlyErrorMessage } from '../../utils/errors';
import { localizeCommunityText } from '../../utils/communityModules';

const PAGE_SIZE = 8;
const COPY = {
  en: { title: 'Calendar Events', all: 'All', nearby: 'Near Me', empty: 'No approved calendar events found.', add: 'Add calendar event', selected: 'Selected date' },
  mr: { title: 'दिनदर्शिका कार्यक्रम', all: 'सर्व', nearby: 'माझ्या जवळ', empty: 'मंजूर दिनदर्शिका कार्यक्रम सापडले नाहीत.', add: 'दिनदर्शिका कार्यक्रम जोडा', selected: 'निवडलेली तारीख' },
  hi: { title: 'कैलेंडर कार्यक्रम', all: 'सभी', nearby: 'मेरे पास', empty: 'कोई स्वीकृत कैलेंडर कार्यक्रम नहीं मिला।', add: 'कैलेंडर कार्यक्रम जोड़ें', selected: 'चुनी हुई तारीख' }
};

const CalendarEventsScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const copy = COPY[language] || COPY.en;
  const selectedDate = String(route?.params?.selectedDate || '').trim();
  const [view, setView] = useState('all');
  const [events, setEvents] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const requestRef = useRef(0);

  const load = useCallback(async ({ nextPage = 1, refresh = false } = {}) => {
    const requestId = requestRef.current + 1;
    requestRef.current = requestId;
    try {
      if (nextPage > 1) setLoadingMore(true);
      else if (refresh) setRefreshing(true);
      else setLoading(true);
      setError('');
      const response = await ApiService.getCommunityRecords('calendarEvents', {
        calendarEventsView: view,
        ...(selectedDate ? { date: selectedDate } : {}),
        page: nextPage,
        limit: PAGE_SIZE
      });
      if (requestRef.current !== requestId) return;
      const rows = response.data?.records || [];
      setEvents((current) => nextPage === 1
        ? rows
        : [...current, ...rows.filter((row) => !current.some((item) => item._id === row._id))]);
      const pagination = response.data?.pagination || {};
      setPage(Number(pagination.page || nextPage));
      setHasMore(Number(pagination.page || nextPage) < Number(pagination.pages || 0));
    } catch (loadError) {
      if (requestRef.current === requestId) {
        setError(getFriendlyErrorMessage(loadError, 'Calendar events could not be loaded. Please try again.'));
      }
    } finally {
      if (requestRef.current === requestId) {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    }
  }, [selectedDate, view]);

  useEffect(() => {
    setEvents([]);
    load();
    const unsubscribe = navigation.addListener('focus', () => load({ refresh: true }));
    return () => {
      requestRef.current += 1;
      unsubscribe?.();
    };
  }, [load, navigation]);

  const renderEvent = ({ item }) => {
    const photo = item.media?.find((media) => media.type === 'image' && media.url)?.url;
    const place = [item.location?.village, item.location?.taluka, item.location?.district].filter(Boolean).join(', ');
    const eventDate = new Date(item.eventStartAt || item.dateValue);
    return (
      <TouchableOpacity
        activeOpacity={0.84}
        onPress={() => navigation.navigate('CommunityRecordDetail', { moduleKey: 'calendarEvents', recordId: item._id })}
        style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, shadowColor: theme.shadow }]}
      >
        {photo ? (
          <OptimizedImage source={{ uri: photo }} variant="feed" style={styles.photo} resizeMode="cover" />
        ) : (
          <View style={[styles.photoFallback, { backgroundColor: theme.primarySoft || theme.surfaceMuted }]}>
            <Ionicons name="calendar-number-outline" size={30} color={theme.primary} />
          </View>
        )}
        <View style={styles.cardCopy}>
          <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={2}>{localizeCommunityText(item.title, language)}</Text>
          <Text style={[styles.cardDescription, { color: theme.textSecondary }]} numberOfLines={2}>{localizeCommunityText(item.description, language)}</Text>
          <View style={styles.metaRow}>
            <Ionicons name="time-outline" size={14} color={theme.primary} />
            <Text style={[styles.meta, { color: theme.textSecondary }]}>
              {Number.isNaN(eventDate.getTime()) ? '' : eventDate.toLocaleString(language === 'mr' ? 'mr-IN' : language === 'hi' ? 'hi-IN' : 'en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
            </Text>
          </View>
          {Boolean(place) && (
            <View style={styles.metaRow}>
              <Ionicons name="location-outline" size={14} color={theme.primary} />
              <Text style={[styles.meta, { color: theme.textSecondary }]} numberOfLines={1}>{place}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['left', 'right', 'bottom']}>
      {Boolean(selectedDate) && (
        <View style={[styles.selectedDate, { backgroundColor: theme.primarySoft || theme.surfaceMuted, borderColor: theme.primary }]}>
          <Ionicons name="calendar-outline" size={17} color={theme.primary} />
          <Text style={[styles.selectedDateText, { color: theme.text }]}>{copy.selected}: {selectedDate}</Text>
        </View>
      )}
      <View style={[styles.switcher, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        {[{ key: 'all', label: copy.all }, { key: 'nearby', label: copy.nearby }].map((item) => (
          <TouchableOpacity
            key={item.key}
            onPress={() => setView(item.key)}
            style={[styles.switchButton, view === item.key && { backgroundColor: theme.primary }]}
          >
            <Text style={[styles.switchText, { color: view === item.key ? '#FFFFFF' : theme.text }]}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {loading && !events.length ? (
        <View style={styles.skeleton}><InlineSkeletonList variant="card" rows={4} /></View>
      ) : error && !events.length ? (
        <FriendlyErrorScreen message={error} onRetry={() => load()} />
      ) : (
        <FlatList
          data={events}
          renderItem={renderEvent}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load({ refresh: true })} tintColor={theme.primary} colors={[theme.primary]} />}
          onEndReached={() => hasMore && !loadingMore && load({ nextPage: page + 1 })}
          onEndReachedThreshold={0.45}
          ListFooterComponent={loadingMore ? <InlineSkeletonList variant="card" rows={1} /> : null}
          ListEmptyComponent={<EmptyState icon="calendar-clear-outline" title={copy.empty} />}
        />
      )}
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={copy.add}
        activeOpacity={0.86}
        onPress={() => navigation.navigate('CalendarEventForm', { selectedDate })}
        style={[styles.fab, { backgroundColor: theme.primary, shadowColor: theme.primary }]}
      >
        <Ionicons name="add" size={29} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  selectedDate: { marginHorizontal: 16, marginTop: 12, borderWidth: 1, borderRadius: 13, paddingHorizontal: 13, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 8 },
  selectedDateText: { fontSize: 13, fontWeight: '700' },
  switcher: { margin: 16, padding: 4, borderWidth: 1, borderRadius: 15, flexDirection: 'row' },
  switchButton: { flex: 1, minHeight: 40, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  switchText: { fontSize: 14, fontWeight: '800' },
  list: { paddingHorizontal: 16, paddingBottom: 104, flexGrow: 1 },
  skeleton: { paddingHorizontal: 16 },
  card: { borderWidth: 1, borderRadius: 18, marginBottom: 14, overflow: 'hidden', elevation: 2, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.06, shadowRadius: 14 },
  photo: { width: '100%', height: 180 },
  photoFallback: { width: '100%', height: 100, alignItems: 'center', justifyContent: 'center' },
  cardCopy: { padding: 14 },
  cardTitle: { fontSize: 17, fontWeight: '800', marginBottom: 5 },
  cardDescription: { fontSize: 13, lineHeight: 19, marginBottom: 9 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  meta: { flex: 1, fontSize: 12, fontWeight: '600' },
  fab: { position: 'absolute', right: 20, bottom: 22, width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center', elevation: 7, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.24, shadowRadius: 14 }
});

export default CalendarEventsScreen;
