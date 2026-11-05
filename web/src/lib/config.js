export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
  socketUrl: import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000',
  razorpayKeyId: import.meta.env.VITE_RAZORPAY_KEY_ID || '',
  defaultLocation: {
    lat: 28.6139,
    lng: 77.209,
    label: 'New Delhi',
  },
  tokenKey: 'ftafat_access_token',
  refreshKey: 'ftafat_refresh_token',
  locationKey: 'ftafat_location',
}
