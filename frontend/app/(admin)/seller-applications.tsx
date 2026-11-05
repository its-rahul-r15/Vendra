import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  TextInput,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { adminService } from '../../services/admin.service';

const STATUS_FILTERS = ['pending', 'approved', 'rejected'] as const;
type StatusFilter = typeof STATUS_FILTERS[number];

const STATUS_COLOR: Record<string, string> = {
  pending: '#D97706',
  approved: '#16A34A',
  rejected: '#DC2626',
};

const STATUS_BG: Record<string, string> = {
  pending: '#FEF3C7',
  approved: '#D1FAE5',
  rejected: '#FEE2E2',
};

export default function AdminSellerApplicationsScreen() {
  const router = useRouter();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await adminService.listSellerApplications(statusFilter);
      setApplications(Array.isArray(data) ? data : []);
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Could not load applications');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, [statusFilter]);

  const handleApprove = (app: any) => {
    Alert.alert(
      'Approve Application',
      `Approve "${app.sellerApplication?.businessName || app.name}"? This will upgrade the user to Merchant Owner and grant seller dashboard access.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          style: 'default',
          onPress: async () => {
            setActionLoading(true);
            try {
              await adminService.approveSellerApplication(app._id);
              Alert.alert('Approved 🎉', 'Seller application approved successfully! User is now a Merchant Owner.');
              setSelectedApp(null);
              load(true);
            } catch (err: any) {
              Alert.alert('Error', err?.response?.data?.message || 'Failed to approve');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      Alert.alert('Required', 'Please enter a rejection reason to inform the seller.');
      return;
    }
    setActionLoading(true);
    try {
      await adminService.rejectSellerApplication(selectedApp._id, rejectReason);
      Alert.alert('Done', 'Application has been marked as rejected.');
      setRejectModalVisible(false);
      setSelectedApp(null);
      setRejectReason('');
      load(true);
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to reject');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Seller Verification</Text>
        <TouchableOpacity onPress={() => load(false)}>
          <Ionicons name="refresh" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {STATUS_FILTERS.map(s => (
          <TouchableOpacity
            key={s}
            style={[styles.filterTab, statusFilter === s && { backgroundColor: STATUS_COLOR[s] }]}
            onPress={() => setStatusFilter(s)}
          >
            <Text style={[styles.filterText, statusFilter === s && { color: '#fff' }]}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#4F46E5" />
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} />}
        >
          {applications.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>No {statusFilter} applications found</Text>
            </View>
          ) : (
            applications.map(app => (
              <TouchableOpacity
                key={app._id}
                style={styles.card}
                onPress={() => setSelectedApp(app)}
                activeOpacity={0.8}
              >
                <View style={styles.cardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardName}>
                      {app.sellerApplication?.businessName || app.name}
                    </Text>
                    <Text style={styles.cardSub}>
                      Type: {app.sellerApplication?.businessType || app.type} · Owner: {app.sellerApplication?.ownerName || app.ownerId?.name || '—'}
                    </Text>
                    <Text style={styles.cardSub}>
                      📞 {app.sellerApplication?.businessPhone || app.ownerId?.phone || '—'}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: STATUS_BG[app.approval?.status || 'pending'] }]}>
                    <Text style={[styles.statusText, { color: STATUS_COLOR[app.approval?.status || 'pending'] }]}>
                      {app.approval?.status || 'pending'}
                    </Text>
                  </View>
                </View>

                <Text style={styles.cardDate}>
                  Submitted: {app.sellerApplication?.submittedAt
                    ? new Date(app.sellerApplication.submittedAt).toLocaleDateString('en-IN')
                    : new Date(app.createdAt).toLocaleDateString('en-IN')}
                </Text>

                {app.approval?.adminNote && (
                  <View style={styles.noteBox}>
                    <Text style={styles.noteText}>Note: {app.approval.adminNote}</Text>
                  </View>
                )}

                {app.approval?.status === 'pending' && (
                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      style={styles.approveBtn}
                      onPress={() => handleApprove(app)}
                    >
                      <Ionicons name="checkmark-circle" size={16} color="#fff" />
                      <Text style={styles.approveBtnText}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.rejectBtn}
                      onPress={() => { setSelectedApp(app); setRejectModalVisible(true); }}
                    >
                      <Ionicons name="close-circle" size={16} color="#DC2626" />
                      <Text style={styles.rejectBtnText}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}

      {/* Detail Modal */}
      <Modal visible={!!selectedApp && !rejectModalVisible} transparent animationType="slide" onRequestClose={() => setSelectedApp(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.detailModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seller Application Details</Text>
              <TouchableOpacity onPress={() => setSelectedApp(null)}>
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 450 }}>
              {selectedApp && (
                <View style={{ padding: 4 }}>
                  <DetailRow label="Business Name" value={selectedApp.sellerApplication?.businessName || selectedApp.name} />
                  <DetailRow label="Business Type" value={selectedApp.sellerApplication?.businessType || selectedApp.type} />
                  <DetailRow label="Owner Name" value={selectedApp.sellerApplication?.ownerName || selectedApp.ownerId?.name} />
                  <DetailRow label="Business Phone" value={selectedApp.sellerApplication?.businessPhone || selectedApp.ownerId?.phone} />
                  <DetailRow label="Business Email" value={selectedApp.sellerApplication?.businessEmail || selectedApp.ownerId?.email} />
                  <DetailRow label="GST Number" value={selectedApp.sellerApplication?.gstNumber || 'Not provided'} />
                  <DetailRow label="FSSAI License" value={selectedApp.sellerApplication?.fssaiNumber || 'Not provided'} />
                  <DetailRow label="Address" value={
                    selectedApp.sellerApplication?.businessAddress
                      ? `${selectedApp.sellerApplication.businessAddress.line1}, ${selectedApp.sellerApplication.businessAddress.city}, ${selectedApp.sellerApplication.businessAddress.state} - ${selectedApp.sellerApplication.businessAddress.pincode}`
                      : `${selectedApp.address?.line1 || ''}, ${selectedApp.address?.city || ''}`
                  } />
                  {selectedApp.ownerId && (
                    <>
                      <Text style={styles.detailSection}>Linked User Profile</Text>
                      <DetailRow label="Account Name" value={selectedApp.ownerId.name} />
                      <DetailRow label="Account Phone" value={selectedApp.ownerId.phone} />
                      <DetailRow label="Account Email" value={selectedApp.ownerId.email} />
                    </>
                  )}
                </View>
              )}
            </ScrollView>
            {selectedApp?.approval?.status === 'pending' && (
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.approveBtn, { flex: 1 }]}
                  onPress={() => handleApprove(selectedApp)}
                  disabled={actionLoading}
                >
                  <Text style={styles.approveBtnText}>✓ Approve & Make Seller</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.rejectBtn, { flex: 1, justifyContent: 'center' }]}
                  onPress={() => setRejectModalVisible(true)}
                  disabled={actionLoading}
                >
                  <Text style={styles.rejectBtnText}>✕ Reject</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Reject Reason Modal */}
      <Modal visible={rejectModalVisible} transparent animationType="slide" onRequestClose={() => setRejectModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.detailModal, { maxHeight: 320 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Specify Rejection Reason</Text>
              <TouchableOpacity onPress={() => setRejectModalVisible(false)}>
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>
            <Text style={{ color: '#6B7280', marginBottom: 10, fontSize: 13 }}>
              This reason will be sent to the applicant so they can fix and re-apply.
            </Text>
            <TextInput
              style={[styles.input, { height: 90, textAlignVertical: 'top' }]}
              value={rejectReason}
              onChangeText={setRejectReason}
              placeholder="e.g. Invalid FSSAI license or unclear business address..."
              placeholderTextColor="#aaa"
              multiline
            />
            <TouchableOpacity
              style={[styles.approveBtn, { marginTop: 12, backgroundColor: '#DC2626', justifyContent: 'center' }]}
              onPress={handleReject}
              disabled={actionLoading}
            >
              {actionLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.approveBtnText}>Confirm Rejection</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function DetailRow({ label, value }: { label: string; value?: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value || '—'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#4F46E5' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  filterRow: { flexDirection: 'row', backgroundColor: '#fff', padding: 12, gap: 8, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  filterTab: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center', backgroundColor: '#F3F4F6' },
  filterText: { fontSize: 13, fontWeight: '600', color: '#374151' },
  emptyState: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15, color: '#9CA3AF' },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  cardName: { fontSize: 16, fontWeight: '700', color: '#111', marginBottom: 4 },
  cardSub: { fontSize: 13, color: '#6B7280', marginBottom: 2 },
  cardDate: { fontSize: 12, color: '#9CA3AF', marginBottom: 6 },
  noteBox: { backgroundColor: '#FEF2F2', padding: 8, borderRadius: 6, marginBottom: 8 },
  noteText: { fontSize: 12, color: '#991B1B' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: '700', textTransform: 'capitalize' },
  cardActions: { flexDirection: 'row', gap: 10, marginTop: 6 },
  approveBtn: { flex: 1, flexDirection: 'row', backgroundColor: '#16A34A', paddingVertical: 10, borderRadius: 10, alignItems: 'center', justifyContent: 'center', gap: 6 },
  approveBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  rejectBtn: { flex: 1, flexDirection: 'row', borderWidth: 1.5, borderColor: '#DC2626', paddingVertical: 10, borderRadius: 10, alignItems: 'center', justifyContent: 'center', gap: 6 },
  rejectBtnText: { color: '#DC2626', fontWeight: '700', fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  detailModal: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: 600 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#111' },
  detailRow: { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  detailLabel: { flex: 1, fontSize: 13, color: '#6B7280', fontWeight: '600' },
  detailValue: { flex: 2, fontSize: 13, color: '#111' },
  detailSection: { fontSize: 14, fontWeight: '700', color: '#374151', marginTop: 14, marginBottom: 4 },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 10, padding: 12, fontSize: 14, color: '#111' },
});

