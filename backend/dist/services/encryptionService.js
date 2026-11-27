"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.encryptToken = encryptToken;
exports.decryptToken = decryptToken;
exports.generateOAuthState = generateOAuthState;
exports.verifyOAuthState = verifyOAuthState;
const crypto_1 = __importDefault(require("crypto"));
const index_js_1 = require("../config/index.js");
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // Standard 96-bit IV for GCM
// Generate 32-byte key from JWT_SECRET or custom secret
function getKey() {
    const secret = process.env.TOKEN_ENCRYPTION_KEY || index_js_1.config.jwtSecret || 'bnnews_secret_default_encryption_key_2026';
    return crypto_1.default.createHash('sha256').update(secret).digest();
}
/**
 * Encrypt access or refresh tokens before storing at rest in PostgreSQL
 */
function encryptToken(plainText) {
    if (!plainText)
        return '';
    try {
        const iv = crypto_1.default.randomBytes(IV_LENGTH);
        const key = getKey();
        const cipher = crypto_1.default.createCipheriv(ALGORITHM, key, iv);
        let encrypted = cipher.update(plainText, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const authTag = cipher.getAuthTag().toString('hex');
        // Format: iv:authTag:encrypted
        return `${iv.toString('hex')}:${authTag}:${encrypted}`;
    }
    catch (err) {
        console.error('Token encryption failed:', err);
        return plainText;
    }
}
/**
 * Decrypt access or refresh token for outgoing API calls
 */
function decryptToken(cipherText) {
    if (!cipherText)
        return '';
    try {
        const parts = cipherText.split(':');
        if (parts.length !== 3) {
            // Return as-is if not formatted as iv:authTag:encrypted (legacy or plain)
            return cipherText;
        }
        const [ivHex, authTagHex, encryptedHex] = parts;
        const iv = Buffer.from(ivHex, 'hex');
        const authTag = Buffer.from(authTagHex, 'hex');
        const key = getKey();
        const decipher = crypto_1.default.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(authTag);
        let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
    catch (err) {
        console.error('Token decryption failed, returning raw string:', err);
        return cipherText;
    }
}
/**
 * Generate CSRF state token with HMAC signature for OAuth handshakes
 */
function generateOAuthState(platform, extraData = {}) {
    const payload = {
        platform,
        timestamp: Date.now(),
        nonce: crypto_1.default.randomBytes(8).toString('hex'),
        ...extraData,
    };
    const json = JSON.stringify(payload);
    const hmac = crypto_1.default.createHmac('sha256', index_js_1.config.jwtSecret).update(json).digest('hex');
    const base64 = Buffer.from(json).toString('base64url');
    return `${base64}.${hmac}`;
}
/**
 * Verify CSRF state token
 */
function verifyOAuthState(stateString) {
    try {
        if (!stateString || !stateString.includes('.'))
            return { valid: false };
        const [base64, signature] = stateString.split('.');
        const json = Buffer.from(base64, 'base64url').toString('utf8');
        const expectedHmac = crypto_1.default.createHmac('sha256', index_js_1.config.jwtSecret).update(json).digest('hex');
        if (crypto_1.default.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedHmac))) {
            const data = JSON.parse(json);
            // Ensure state is not older than 15 minutes
            if (Date.now() - data.timestamp > 15 * 60 * 1000) {
                return { valid: false };
            }
            return { valid: true, data };
        }
        return { valid: false };
    }
    catch {
        return { valid: false };
    }
}
