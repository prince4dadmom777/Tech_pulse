import { logger } from '../logging/logger.js';
export function extractJsonString(raw) {
    let cleaned = raw.trim();
    // Strip markdown code fences if present
    if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/^```json\s*/i, '');
    }
    else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```\s*/, '');
    }
    if (cleaned.endsWith('```')) {
        cleaned = cleaned.replace(/```$/, '');
    }
    cleaned = cleaned.trim();
    // If there's extra text before the first '{' or after the last '}', find the outermost JSON object/array
    const firstBrace = cleaned.indexOf('{');
    const firstBracket = cleaned.indexOf('[');
    let startIdx = 0;
    if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
        startIdx = firstBrace;
        const lastBrace = cleaned.lastIndexOf('}');
        if (lastBrace !== -1) {
            cleaned = cleaned.slice(startIdx, lastBrace + 1);
        }
    }
    else if (firstBracket !== -1) {
        startIdx = firstBracket;
        const lastBracket = cleaned.lastIndexOf(']');
        if (lastBracket !== -1) {
            cleaned = cleaned.slice(startIdx, lastBracket + 1);
        }
    }
    return cleaned;
}
export function validateAiResponse(raw, schema) {
    try {
        const jsonStr = extractJsonString(raw);
        const parsed = JSON.parse(jsonStr);
        const result = schema.safeParse(parsed);
        if (!result.success) {
            const issueDetails = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ');
            logger.warn(`AI response schema validation failed: ${issueDetails}`);
            return { success: false, error: `Validation error: ${issueDetails}` };
        }
        return { success: true, data: result.data };
    }
    catch (err) {
        logger.warn(`Failed to parse AI response as JSON: ${err.message}`);
        return { success: false, error: `Invalid JSON format: ${err.message}` };
    }
}
//# sourceMappingURL=response-validator.js.map