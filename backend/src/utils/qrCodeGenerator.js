const QRCode = require('qrcode');

/**
 * Generate QR code as data URL
 * @param {string} url - URL to encode in QR code
 * @returns {Promise<string>} - Data URL of the QR code image
 */
const generateQRCode = async (url) => {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(url, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 300
    });
    return qrCodeDataUrl;
  } catch (error) {
    console.error('QR code generation error:', error);
    throw new Error('Failed to generate QR code');
  }
};

/**
 * Generate menu URL for a restaurant (no table number in URL)
 * @param {string} restaurantSlug - Restaurant slug
 * @param {string} baseUrl - Base URL of the application
 * @returns {string} - Menu URL
 */
/**
 * Generate restaurant menu URL
 * @param {string} restaurantSlug - Restaurant slug
 * @param {string} baseUrl - Base URL of the application (optional)
 * @returns {string} - Menu URL
 */
const generateRestaurantUrl = (restaurantSlug, baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000') => {
  if (!restaurantSlug) {
    throw new Error('Restaurant slug is required');
  }
  return `${baseUrl.replace(/\/$/, '')}/r/${restaurantSlug}`;
};

module.exports = {
  generateQRCode,
  generateRestaurantUrl
};


