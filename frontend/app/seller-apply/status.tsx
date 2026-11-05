import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { vendorService, VendorApplication } from '../../services/vendor.service';

export default function SellerApplyStatusScreen() {
  const [application, setApplication] = useState<VendorApplication | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    vendorService.getMyApplication().then(app => {
      setApplication(app);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#D41208" />
      </SafeAreaView>
    );
  }

  const status = application?.approval?.status;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Application Status</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.body}>
        {!application ? (
          <View style={styles.card}>
            <Ionicons name="document-outline" size={56} color="#D1D5DB" />
            <Text style={styles.cardTitle}>No Application Found</Text>
            <Text style={styles.cardSubtitle}>You haven't submitted a seller application yet.</Text>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => router.replace('/seller-apply' as any)}>
              <Text style={styles.primaryBtnText}>Apply Now</Text>
            </TouchableOpacity>
          </View>
        ) : status === 'pending' ? (
          <View style={styles.card}>
            <View style={[styles.iconCircle, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="time-outline" size={48} color="#D97706" />
            </View>
            <Text style={styles.cardTitle}>Under Review</Text>
            <Text style={styles.cardSubtitle}>
              Your application for "{application.sellerApplication?.businessName || application.name}" is being reviewed by our team.
            </Text>
            <Text style={styles.cardHint}>⏱ Usually takes 2–3 business days</Text>
            <Text style={styles.cardHint}>📱 You'll get a notification once approved</Text>
          </View>
        ) : status === 'approved' ? (
          <View style={styles.card}>
            <View style={[styles.iconCircle, { backgroundColor: '#D1FAE5' }]}>
              <Ionicons name="checkmark-circle" size={48} color="#16A34A" />
            </View>
            <Text style={styles.cardTitle}>Approved! 🎉</Text>
            <Text style={styles.cardSubtitle}>
              Congratulations! Your seller account is ready. Access your dashboard to start managing your business.
            </Text>
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: '#16A34A' }]}
              onPress={() => router.replace('/(owner)/dashboard')}
            >
              <Text style={styles.primaryBtnText}>Go to Seller Dashboard →</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.card}>
            <View style={[styles.iconCircle, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="close-circle" size={48} color="#DC2626" />
            </View>
            <Text style={styles.cardTitle}>Not Approved</Text>
            <Text style={styles.cardSubtitle}>
              Unfortunately your application was not approved at this time.
            </Text>
            {application.approval?.adminNote ? (
              <View style={styles.reasonBox}>
                <Text style={styles.reasonLabel}>Reason:</Text>
                <Text style={styles.reasonText}>{application.approval.adminNote}</Text>
              </View>
            ) : null}
            <TouchableOpacity style={styles.primaryBtn} onPress={() => router.replace('/seller-apply' as any)}>
              <Text style={styles.primaryBtnText}>Re-apply with Updated Info</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
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
  body: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 28, alignItems: 'center', width: '100%', borderWidth: 1, borderColor: '#E5E7EB' },
  iconCircle: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  cardTitle: { fontSize: 22, fontWeight: '800', color: '#111', marginBottom: 10, textAlign: 'center' },
  cardSubtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 22, marginBottom: 16 },
  cardHint: { fontSize: 13, color: '#374151', marginBottom: 6 },
  primaryBtn: { backgroundColor: '#D41208', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12, marginTop: 20, width: '100%', alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  reasonBox: { backgroundColor: '#FEF2F2', borderRadius: 10, padding: 12, width: '100%', marginBottom: 4 },
  reasonLabel: { fontSize: 12, fontWeight: '700', color: '#DC2626', marginBottom: 4 },
  reasonText: { fontSize: 13, color: '#7F1D1D', lineHeight: 20 },
});
