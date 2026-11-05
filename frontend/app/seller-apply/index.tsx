import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { vendorService, SellerApplicationPayload } from '../../services/vendor.service';

const STEPS = ['Business Info', 'Address', 'Licenses', 'Review'];

const BUSINESS_TYPES = [
  { label: '🍔 Restaurant / Food', value: 'restaurant' },
  { label: '🛒 Grocery / Store', value: 'grocery' },
  { label: '🍔🛒 Both', value: 'both' },
];

export default function SellerApplyScreen() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Form state
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState<'restaurant' | 'grocery' | 'both'>('restaurant');
  const [ownerName, setOwnerName] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [line1, setLine1] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [fssaiNumber, setFssaiNumber] = useState('');

  const validateStep = () => {
    if (step === 0) {
      if (!businessName.trim()) return 'Please enter your business name';
      if (!ownerName.trim()) return 'Please enter owner name';
      if (!businessPhone.trim() || businessPhone.replace(/\D/g, '').length < 10)
        return 'Please enter a valid 10-digit phone number';
    }
    if (step === 1) {
      if (!line1.trim()) return 'Please enter address line 1';
      if (!city.trim()) return 'Please enter city';
      if (!state.trim()) return 'Please enter state';
      if (!pincode.trim() || pincode.length !== 6) return 'Please enter valid 6-digit pincode';
    }
    return null;
  };

  const goNext = () => {
    const err = validateStep();
    if (err) { Alert.alert('Validation', err); return; }
    setStep(s => s + 1);
  };

  const goBack = () => {
    if (step === 0) { router.back(); return; }
    setStep(s => s - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload: SellerApplicationPayload = {
        businessName,
        businessType,
        ownerName,
        businessPhone,
        businessEmail,
        gstNumber: gstNumber || undefined,
        fssaiNumber: fssaiNumber || undefined,
        businessAddress: { line1, city, state, pincode },
      };
      await vendorService.applyAsSeller(payload);
      router.replace('/seller-apply/status' as any);
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || err?.message || 'Failed to submit. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepRow}>
      {STEPS.map((label, i) => (
        <View key={i} style={styles.stepItem}>
          <View style={[styles.stepDot, i <= step ? styles.stepDotActive : {}]}>
            {i < step ? (
              <Ionicons name="checkmark" size={12} color="#fff" />
            ) : (
              <Text style={[styles.stepNum, i === step ? styles.stepNumActive : {}]}>{i + 1}</Text>
            )}
          </View>
          {i < STEPS.length - 1 && (
            <View style={[styles.stepLine, i < step ? styles.stepLineActive : {}]} />
          )}
        </View>
      ))}
    </View>
  );

  const renderStep0 = () => (
    <View>
      <Text style={styles.sectionTitle}>Business Information</Text>
      
      <Text style={styles.label}>Business Name *</Text>
      <TextInput
        style={styles.input}
        value={businessName}
        onChangeText={setBusinessName}
        placeholder="e.g. Sharma's Kitchen"
        placeholderTextColor="#aaa"
      />

      <Text style={styles.label}>Business Type *</Text>
      <View style={styles.typeRow}>
        {BUSINESS_TYPES.map(bt => (
          <TouchableOpacity
            key={bt.value}
            style={[styles.typeBtn, businessType === bt.value && styles.typeBtnActive]}
            onPress={() => setBusinessType(bt.value as any)}
          >
            <Text style={[styles.typeBtnText, businessType === bt.value && styles.typeBtnTextActive]}>
              {bt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Owner Name *</Text>
      <TextInput
        style={styles.input}
        value={ownerName}
        onChangeText={setOwnerName}
        placeholder="Your full name"
        placeholderTextColor="#aaa"
      />

      <Text style={styles.label}>Business Phone *</Text>
      <TextInput
        style={styles.input}
        value={businessPhone}
        onChangeText={setBusinessPhone}
        placeholder="10-digit mobile number"
        placeholderTextColor="#aaa"
        keyboardType="phone-pad"
        maxLength={10}
      />

      <Text style={styles.label}>Business Email (optional)</Text>
      <TextInput
        style={styles.input}
        value={businessEmail}
        onChangeText={setBusinessEmail}
        placeholder="business@email.com"
        placeholderTextColor="#aaa"
        keyboardType="email-address"
        autoCapitalize="none"
      />
    </View>
  );

  const renderStep1 = () => (
    <View>
      <Text style={styles.sectionTitle}>Business Address</Text>
      
      <Text style={styles.label}>Address Line 1 *</Text>
      <TextInput
        style={styles.input}
        value={line1}
        onChangeText={setLine1}
        placeholder="Shop No / Building / Street"
        placeholderTextColor="#aaa"
      />

      <Text style={styles.label}>City *</Text>
      <TextInput
        style={styles.input}
        value={city}
        onChangeText={setCity}
        placeholder="City"
        placeholderTextColor="#aaa"
      />

      <Text style={styles.label}>State *</Text>
      <TextInput
        style={styles.input}
        value={state}
        onChangeText={setState}
        placeholder="State"
        placeholderTextColor="#aaa"
      />

      <Text style={styles.label}>Pincode *</Text>
      <TextInput
        style={styles.input}
        value={pincode}
        onChangeText={setPincode}
        placeholder="6-digit pincode"
        placeholderTextColor="#aaa"
        keyboardType="number-pad"
        maxLength={6}
      />
    </View>
  );

  const renderStep2 = () => (
    <View>
      <Text style={styles.sectionTitle}>Licenses & Documents</Text>
      <Text style={styles.hint}>These are optional but help speed up verification.</Text>

      <Text style={styles.label}>GST Number (optional)</Text>
      <TextInput
        style={styles.input}
        value={gstNumber}
        onChangeText={setGstNumber}
        placeholder="e.g. 22AAAAA0000A1Z5"
        placeholderTextColor="#aaa"
        autoCapitalize="characters"
      />

      <Text style={styles.label}>FSSAI License Number (optional)</Text>
      <TextInput
        style={styles.input}
        value={fssaiNumber}
        onChangeText={setFssaiNumber}
        placeholder="14-digit FSSAI number"
        placeholderTextColor="#aaa"
        keyboardType="number-pad"
      />

      <View style={styles.infoBox}>
        <Ionicons name="information-circle-outline" size={18} color="#3B82F6" />
        <Text style={styles.infoText}>
          Our team will contact you for additional document verification after reviewing your application.
        </Text>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View>
      <Text style={styles.sectionTitle}>Review Your Application</Text>

      <View style={styles.reviewCard}>
        <Text style={styles.reviewHeading}>Business Details</Text>
        <ReviewRow label="Business Name" value={businessName} />
        <ReviewRow label="Type" value={businessType} />
        <ReviewRow label="Owner" value={ownerName} />
        <ReviewRow label="Phone" value={businessPhone} />
        {businessEmail ? <ReviewRow label="Email" value={businessEmail} /> : null}
      </View>

      <View style={styles.reviewCard}>
        <Text style={styles.reviewHeading}>Address</Text>
        <ReviewRow label="Line 1" value={line1} />
        <ReviewRow label="City" value={city} />
        <ReviewRow label="State" value={state} />
        <ReviewRow label="Pincode" value={pincode} />
      </View>

      {(gstNumber || fssaiNumber) ? (
        <View style={styles.reviewCard}>
          <Text style={styles.reviewHeading}>Licenses</Text>
          {gstNumber ? <ReviewRow label="GST" value={gstNumber} /> : null}
          {fssaiNumber ? <ReviewRow label="FSSAI" value={fssaiNumber} /> : null}
        </View>
      ) : null}

      <Text style={styles.termsText}>
        By submitting, you agree that the information provided is accurate. Our team will review your application within 2–3 business days.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Become a Seller</Text>
        <View style={{ width: 40 }} />
      </View>

      {renderStepIndicator()}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {step === 0 && renderStep0()}
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer Buttons */}
      <View style={styles.footer}>
        {step > 0 && (
          <TouchableOpacity style={styles.backFooterBtn} onPress={goBack}>
            <Text style={styles.backFooterText}>Back</Text>
          </TouchableOpacity>
        )}

        {step < 3 ? (
          <TouchableOpacity style={[styles.nextBtn, step > 0 && { flex: 1, marginLeft: 12 }]} onPress={goNext}>
            <Text style={styles.nextBtnText}>Next →</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.submitBtn, loading && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitBtnText}>Submit Application 🚀</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.reviewRow}>
      <Text style={styles.reviewLabel}>{label}</Text>
      <Text style={styles.reviewValue}>{value || '—'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111' },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  stepItem: { flexDirection: 'row', alignItems: 'center' },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: { backgroundColor: '#D41208' },
  stepNum: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  stepNumActive: { color: '#fff' },
  stepLine: { width: 32, height: 2, backgroundColor: '#E5E7EB', marginHorizontal: 4 },
  stepLineActive: { backgroundColor: '#D41208' },
  body: { padding: 20, paddingBottom: 40 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#111', marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 14 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111',
  },
  typeRow: { gap: 8 },
  typeBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    backgroundColor: '#fff',
    marginBottom: 4,
  },
  typeBtnActive: { borderColor: '#D41208', backgroundColor: '#FEF2F2' },
  typeBtnText: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  typeBtnTextActive: { color: '#D41208', fontWeight: '700' },
  hint: { fontSize: 13, color: '#6B7280', marginBottom: 8 },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    padding: 12,
    marginTop: 20,
    gap: 8,
  },
  infoText: { flex: 1, fontSize: 13, color: '#1D4ED8', lineHeight: 20 },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  reviewHeading: { fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: 10 },
  reviewRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  reviewLabel: { fontSize: 13, color: '#6B7280', flex: 1 },
  reviewValue: { fontSize: 13, color: '#111', fontWeight: '500', flex: 2, textAlign: 'right' },
  termsText: { fontSize: 12, color: '#9CA3AF', textAlign: 'center', marginTop: 8, lineHeight: 18 },
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  backFooterBtn: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  backFooterText: { fontSize: 15, color: '#374151', fontWeight: '600' },
  nextBtn: {
    flex: 1,
    backgroundColor: '#D41208',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextBtnText: { fontSize: 16, color: '#fff', fontWeight: '700' },
  submitBtn: {
    flex: 1,
    backgroundColor: '#16A34A',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginLeft: 12,
  },
  submitBtnText: { fontSize: 16, color: '#fff', fontWeight: '700' },
});
