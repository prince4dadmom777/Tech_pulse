import { z } from 'zod';
export declare function extractJsonString(raw: string): string;
export declare function validateAiResponse<T extends z.ZodTypeAny>(raw: string, schema: T): {
    success: true;
    data: z.output<T>;
} | {
    success: false;
    error: string;
};
//# sourceMappingURL=response-validator.d.ts.map