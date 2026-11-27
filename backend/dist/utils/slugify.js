"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSlug = generateSlug;
const slugify_1 = __importDefault(require("slugify"));
/**
 * Creates an SEO-friendly slug from Gujarati or English title
 */
function generateSlug(title, suffix) {
    // Normalize whitespace and special characters
    let cleanTitle = title
        .trim()
        .replace(/[|&;$%@"<>()+,/\\#^*~`'":?!=]/g, '')
        .replace(/\s+/g, '-');
    // Slugify while maintaining unicode characters or latin characters
    let baseSlug = slugify_1.default(cleanTitle, {
        replacement: '-',
        lower: true,
        strict: false,
        trim: true,
    });
    if (!baseSlug || baseSlug.length < 3) {
        baseSlug = `samachar-${Date.now().toString(36)}`;
    }
    // Truncate to reasonable SEO length (max 100 chars)
    if (baseSlug.length > 100) {
        baseSlug = baseSlug.substring(0, 100).replace(/-+$/, '');
    }
    if (suffix) {
        return `${baseSlug}-${suffix}`;
    }
    const randomSalt = Math.random().toString(36).substring(2, 6);
    return `${baseSlug}-${randomSalt}`;
}
