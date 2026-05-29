import { NextRequest, NextResponse } from 'next/server';
import { z, ZodSchema, ZodError } from 'zod';

/**
 * Sanitizes an individual string by trimming whitespace and stripping HTML angle brackets
 */
export const sanitizeString = (str: string): string => {
    return str.trim().replace(/[<>]/g, '');
};

/**
 * Recursively scans and sanitizes all string fields within an object/array payload
 */
export const sanitizeData = (data: any): any => {
    if (typeof data === 'string') {
        return sanitizeString(data);
    }
    if (Array.isArray(data)) {
        return data.map(sanitizeData);
    }
    if (typeof data === 'object' && data !== null) {
        const sanitized: any = {};
        for (const key in data) {
            sanitized[key] = sanitizeData(data[key]);
        }
        return sanitized;
    }
    return data;
};

// 1. Signup Schema
export const signupSchema = z.object({
    email: z.string()
        .trim()
        .toLowerCase()
        .email()
        .regex(/^[a-zA-Z0-9._%+-]+@college\.edu$/),
    password: z.string()
        .min(8)
        .regex(/[A-Z]/)
        .regex(/[0-9]/)
        .regex(/[^a-zA-Z0-9]/),
    fullName: z.string()
        .trim()
        .min(1)
        .max(60)
        // Reject manual HTML tag insertion attempts
        .refine(val => !/<[^>]*>/.test(val))
});

// 2. Feedback Schema
export const feedbackSchema = z.object({
    text: z.string()
        .trim()
        .min(1)
        .max(500)
        .refine(val => !/<[^>]*>/.test(val)),
    category: z.enum(['academic', 'hostel', 'administration'])
});

// 3. File Upload Schema
export const fileUploadSchema = z.object({
    filename: z.string()
        .trim()
        .min(1)
        .regex(/^[a-zA-Z0-9._\-\s]+$/), // Allows only safe letters, numbers, spaces, underscores, dots, hyphens
    fileType: z.enum(['pdf', 'docx', 'png', 'jpg'])
});

/**
 * Next.js 14 App Router API Handler Wrapper for Zod Validation.
 * Validates, sanitizes, and forwards clean inputs to route handlers, hiding raw schema structure on error.
 */
export function validateBody<T>(
    schema: ZodSchema<T>,
    handler: (req: NextRequest, validatedBody: T) => Promise<NextResponse>
) {
    return async (request: NextRequest): Promise<NextResponse> => {
        try {
            const rawBody = await request.json();
            
            // Perform deep sanitization
            const sanitizedBody = sanitizeData(rawBody);

            // Enforce schema
            const validatedData = schema.parse(sanitizedBody);

            // Execute the original handler with validated data
            return await handler(request, validatedData);
        } catch (error) {
            if (error instanceof ZodError) {
                // Retrieve only key names that failed validation to prevent internal leaks
                const invalidFields = error.issues.map(err => err.path.join('.'));
                return NextResponse.json({
                    message: "Invalid input",
                    invalidFields: invalidFields
                }, { status: 400 });
            }
            return NextResponse.json({ message: "Invalid request payload" }, { status: 400 });
        }
    };
}
export type SignupInput = z.infer<typeof signupSchema>;
export type FeedbackInput = z.infer<typeof feedbackSchema>;
export type FileUploadInput = z.infer<typeof fileUploadSchema>;
