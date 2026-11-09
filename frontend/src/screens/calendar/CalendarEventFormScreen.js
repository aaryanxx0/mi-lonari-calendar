import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import DatePickerField from '../../components/common/DatePickerField';
import TimePickerField from '../../components/common/TimePickerField';
import ImageSourceButtons from '../../components/common/ImageSourceButtons';
import OptimizedImage from '../../components/common/OptimizedImage';
import { ApiService } from '../../services/api';
import { pickAndOptimizeImages } from '../../utils/mediaPicker';
import { assetToFormDataFile } from '../../utils/upload';
import { getFriendlyErrorMessage } from '../../utils/errors';

const COPY = {
  en: { title: 'New Calendar Event', eventTitle: 'Title', description: 'Short description', date: 'Event date', time: 'Start time', venue: 'Venue / address', photos: 'Event photos (maximum 5)', camera: 'Camera', gallery: 'Gallery', submit: 'Send for approval', sent: 'Calendar event sent for approval.', required: 'Complete the title, description, date, time, and venue.' },
  mr: { title: 'नवीन दिनदर्शिका कार्यक्रम', eventTitle: 'शीर्षक', description: 'लहान वर्णन', date: 'कार्यक्रमाची तारीख', time: 'सुरुवातीची वेळ', venue: 'स्थळ / पत्ता', photos: 'कार्यक्रमाचे फोटो (कमाल ५)', camera: 'कॅमेरा', gallery: 'गॅलरी', submit: 'मंजुरीसाठी पाठवा', sent: 'दिनदर्शिका कार्यक्रम मंजुरीसाठी पाठवला.', required: 'शीर्षक, वर्णन, तारीख, वेळ आणि स्थळ पूर्ण करा.' },
  hi: { title: 'नया कैलेंडर कार्यक्रम', eventTitle: 'शीर्षक', description: 'संक्षिप्त विवरण', date: 'कार्यक्रम की तारीख', time: 'शुरू होने का समय', venue: 'स्थान / पता', photos: 'कार्यक्रम की तस्वीरें (अधिकतम 5)', camera: 'कैमरा', gallery: 'गैलरी', submit: 'स्वीकृति के लिए भेजें', sent: 'कैलेंडर कार्यक्रम स्वीकृति के लिए भेजा गया।', required: 'शीर्षक, विवरण, तारीख, समय और स्थान पूरा करें।' }
};

const toDisplayDate = (isoDate) => {
  const match = String(isoDate || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : '';
};

const toIsoDate = (displayDate) => {
  const match = String(displayDate || '').match(/^(\d{2})[/-](\d{2})[/-](\d{4})$/);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : '';
};

const to24Hour = (value, period) => {
  const match = String(value || '').match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return '';
  let hour = Number(match[1]);
  if (period === 'AM' && hour === 12) hour = 0;
  if (period === 'PM' && hour !== 12) hour += 12;
  return `${String(hour).padStart(2, '0')}:${match[2]}`;
};

const CalendarEventFormScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const { user } = useAuth();
  const copy = COPY[language] || COPY.en;
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: toDisplayDate(route?.params?.selectedDate),
    time: '10:00',
    period: 'AM',
    address: user?.residentialAddress || ''
  });
  const [photos, setPhotos] = useState([]);
  const [busy, setBusy] = useState(false);
  const maximumDate = useMemo(() => `${new Date().getFullYear() + 5}-12-31`, []);

  const addPhotos = async (source) => {
    try {
      const remaining = 5 - photos.length;
      if (remaining <= 0) return Alert.alert(copy.photos, copy.photos);
      const picked = await pickAndOptimizeImages({ source, selectionLimit: remaining });
      setPhotos((current) => [...current, ...picked].slice(0, 5));
    } catch (error) {
      Alert.alert(copy.title, getFriendlyErrorMessage(error, 'The photo could not be added.'));
    }
  };

  const submit = async () => {
    const isoDate = toIsoDate(form.date);
    const time24 = to24Hour(form.time, form.period);
    if (!form.title.trim() || !form.description.trim() || !isoDate || !time24 || !form.address.trim()) {
      Alert.alert(copy.title, copy.required);
      return;
    }
    try {
      setBusy(true);
      const startsAt = new Date(`${isoDate}T${time24}:00+05:30`);
      const endsAt = new Date(startsAt.getTime() + (60 * 60 * 1000));
      const body = new FormData();
      body.append('title', form.title.trim());
      body.append('description', form.description.trim());
      body.append('eventStartAt', startsAt.toISOString());
      body.append('eventEndAt', endsAt.toISOString());
      body.append('dateValue', startsAt.toISOString());
      body.append('location', JSON.stringify({
        state: user?.state || '',
        district: user?.district || user?.city || '',
        taluka: user?.taluka || '',
        village: user?.village || '',
        address: form.address.trim()
      }));
      for (let index = 0; index < photos.length; index += 1) {
        body.append('files', await assetToFormDataFile(photos[index], photos[index].fileName || `calendar-event-${index + 1}.webp`, 'image/webp'));
      }
      await ApiService.createCommunityRecord('calendarEvents', body);
      Alert.alert(copy.title, copy.sent, [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (error) {
      Alert.alert(copy.title, getFriendlyErrorMessage(error, 'The calendar event could not be submitted.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={[styles.intro, { backgroundColor: theme.primarySoft || theme.surfaceMuted, borderColor: theme.primary }]}>
          <Ionicons name="calendar-number-outline" size={24} color={theme.primary} />
          <Text style={[styles.introTitle, { color: theme.text }]}>{copy.title}</Text>
        </View>
        <Input label={copy.eventTitle} value={form.title} maxLength={140} onChangeText={(title) => setForm((current) => ({ ...current, title }))} />
        <Input label={copy.description} value={form.description} maxLength={1200} multiline numberOfLines={4} onChangeText={(description) => setForm((current) => ({ ...current, description }))} />
        <DatePickerField label={copy.date} value={form.date} maxDate={maximumDate} defaultDate={route?.params?.selectedDate || undefined} onChange={(date) => setForm((current) => ({ ...current, date }))} />
        <TimePickerField label={copy.time} value={form.time} period={form.period} onChange={(time, period) => setForm((current) => ({ ...current, time, period }))} />
        <Input label={copy.venue} value={form.address} maxLength={500} multiline numberOfLines={3} onChangeText={(address) => setForm((current) => ({ ...current, address }))} />
        <Text style={[styles.photoLabel, { color: theme.textSecondary }]}>{copy.photos}</Text>
        <ImageSourceButtons theme={theme} cameraLabel={copy.camera} galleryLabel={copy.gallery} disabled={busy || photos.length >= 5} onCamera={() => addPhotos('camera')} onGallery={() => addPhotos('library')} />
        {Boolean(photos.length) && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photoList}>
            {photos.map((photo, index) => (
              <View key={`${photo.uri}-${index}`} style={styles.photoWrap}>
                <OptimizedImage source={{ uri: photo.uri }} style={styles.photo} resizeMode="cover" transition={0} />
                <TouchableOpacity onPress={() => setPhotos((current) => current.filter((_, itemIndex) => itemIndex !== index))} style={styles.removePhoto}>
                  <Ionicons name="close" size={17} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}
        <Button title={copy.submit} loading={busy} disabled={busy} onPress={submit} style={styles.submit} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 36 },
  intro: { borderWidth: 1, borderRadius: 17, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 18 },
  introTitle: { flex: 1, fontSize: 18, fontWeight: '800' },
  photoLabel: { fontSize: 13, fontWeight: '800', textTransform: 'uppercase', marginLeft: 4, marginBottom: 8 },
  photoList: { gap: 10, paddingVertical: 12 },
  photoWrap: { position: 'relative' },
  photo: { width: 104, height: 104, borderRadius: 14 },
  removePhoto: { position: 'absolute', top: 5, right: 5, width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center' },
  submit: { marginTop: 14 }
});

export default CalendarEventFormScreen;
