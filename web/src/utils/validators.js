/**
 * Comprehensive input validators for Vendra frontend.
 * Provides instant client-side feedback and clean error messages.
 */

export function normalizePhone(value) {
  const digits = String(value || '').replace(/\D/g, '')
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2)
  return digits
}

export function validatePhone(phone) {
  const cleaned = normalizePhone(phone)
  if (!cleaned) return 'Mobile number is required'
  // Indian standard 10 digit phone starting with 6-9, or 10-15 digits international
  if (/^[6-9]\d{9}$/.test(cleaned) || /^\d{10,13}$/.test(cleaned)) {
    return null
  }
  return 'Please enter a valid 10-digit mobile number'
}

export function validateEmail(email, isRequired = false) {
  if (!email || !email.trim()) {
    return isRequired ? 'Email address is required' : null
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.trim())) {
    return 'Please enter a valid email address'
  }
  return null
}

export function validatePassword(password, isRequired = true) {
  if (!password) {
    return isRequired ? 'Password is required' : null
  }
  if (password.length < 8) {
    return 'Password must be at least 8 characters long'
  }
  return null
}

export function validateRequired(value, fieldName = 'This field') {
  if (value === undefined || value === null || String(value).trim() === '') {
    return `${fieldName} is required`
  }
  return null
}

export function validatePincode(pincode) {
  if (!pincode || !pincode.trim()) {
    return 'Pincode is required'
  }
  const digits = pincode.replace(/\D/g, '')
  if (digits.length !== 6) {
    return 'Pincode must be exactly 6 digits'
  }
  return null
}

export function validateGst(gst) {
  if (!gst || !gst.trim()) return null
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
  if (!gstRegex.test(gst.trim().toUpperCase())) {
    return 'Invalid GST format (e.g. 22AAAAA0000A1Z5)'
  }
  return null
}

export function validateFssai(fssai) {
  if (!fssai || !fssai.trim()) return null
  const digits = fssai.replace(/\D/g, '')
  if (digits.length !== 14) {
    return 'FSSAI License number must be 14 digits'
  }
  return null
}

