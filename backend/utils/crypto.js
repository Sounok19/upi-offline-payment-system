const crypto = require('crypto');

/**
 * Generate a proper 32-byte AES key from any string
 * AES-256 requires exactly 32 bytes
 */
function getKey(key) {
  return crypto
    .createHash('sha256')
    .update(key)
    .digest();
}

/**
 * Encrypt data using AES-256-CBC
 * @param {Object} data - Data to encrypt
 * @param {String} key - Encryption key
 * @returns {String} Encrypted payload with IV
 */
function encryptPayload(data, key) {
  try {
    // Generate random IV (16 bytes for AES-CBC)
    const iv = crypto.randomBytes(16);

    // Create cipher
    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      getKey(key),
      iv
    );

    // Encrypt data
    let encrypted = cipher.update(
      JSON.stringify(data),
      'utf8',
      'hex'
    );

    encrypted += cipher.final('hex');

    // Return IV + encrypted data
    return iv.toString('hex') + ':' + encrypted;

  } catch (error) {
    throw new Error('Encryption failed: ' + error.message);
  }
}

/**
 * Decrypt AES-256-CBC payload
 * @param {String} encryptedData - Encrypted payload
 * @param {String} key - Encryption key
 * @returns {Object} Decrypted object
 */
function decryptPayload(encryptedData, key) {
  try {
    // Split IV and encrypted content
    const [ivHex, encrypted] = encryptedData.split(':');

    // Convert IV back to buffer
    const iv = Buffer.from(ivHex, 'hex');

    // Create decipher
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      getKey(key),
      iv
    );

    // Decrypt
    let decrypted = decipher.update(
      encrypted,
      'hex',
      'utf8'
    );

    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted);

  } catch (error) {
    throw new Error('Decryption failed: ' + error.message);
  }
}

/**
 * Create HMAC-SHA256 signature
 * @param {Object} data - Payload
 * @param {String} key - Secret key
 * @returns {String} Signature
 */
function signPayload(data, key) {
  const hmac = crypto.createHmac('sha256', key);
  hmac.update(JSON.stringify(data));
  return hmac.digest('hex');
}

/**
 * Verify HMAC signature
 * @param {Object} data
 * @param {String} signature
 * @param {String} key
 * @returns {Boolean}
 */
function verifySignature(data, signature, key) {
  const expectedSignature = signPayload(data, key);
  return expectedSignature === signature;
}

/**
 * Generate random packet ID
 * @returns {String}
 */
function generatePacketId() {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Generate random transaction ID
 * @returns {String}
 */
function generateTransactionId() {
  return crypto.randomBytes(12).toString('hex');
}

/**
 * Generate random nonce
 * @returns {String}
 */
function generateNonce() {
  return crypto.randomBytes(16).toString('hex');
}

module.exports = {
  encryptPayload,
  decryptPayload,
  signPayload,
  verifySignature,
  generatePacketId,
  generateTransactionId,
  generateNonce
};