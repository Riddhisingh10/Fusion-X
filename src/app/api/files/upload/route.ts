import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';
import { createClient, getSecureUser } from '../../../../utils/supabase/server';
import { withCors } from '../../../../utils/cors';

export const dynamic = 'force-dynamic';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = [
    'application/pdf',
    'image/png',
    'image/jpeg',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // DOCX
];

/**
 * Detects the MIME type of a file by reading its initial magic bytes.
 * This prevents extensions spoofing attacks.
 */
function detectMimeType(buffer: Buffer): string | null {
    if (buffer.length < 4) return null;
    const hex = buffer.toString('hex', 0, 4).toUpperCase();

    if (hex === '25504446') return 'application/pdf'; // %PDF
    if (hex === '89504E47') return 'image/png'; // .PNG
    if (hex.startsWith('FFD8FF')) return 'image/jpeg'; // .JPG/.JPEG
    if (hex === '504B0304') return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'; // PK.. (ZIP/DOCX)

    return null;
}

/**
 * Strips EXIF metadata from PNG and JPEG images using sharp
 */
async function stripImageMetadata(buffer: Buffer): Promise<Buffer> {
    // Sharp automatically strips metadata unless .withMetadata() is specified
    return await sharp(buffer)
        .rotate() // Retain correct orientation
        .toBuffer();
}

/**
 * Strips metadata, author, and modification dates from PDFs using pdf-lib
 */
async function stripPdfMetadata(buffer: Buffer): Promise<Buffer> {
    const pdfDoc = await PDFDocument.load(buffer);
    
    // Wipe metadata properties
    pdfDoc.setTitle('');
    pdfDoc.setAuthor('');
    pdfDoc.setSubject('');
    pdfDoc.setCreator('');
    pdfDoc.setProducer('');
    pdfDoc.setCreationDate(new Date(0));
    pdfDoc.setModificationDate(new Date(0));

    const cleanBytes = await pdfDoc.save();
    return Buffer.from(cleanBytes);
}

export const POST = withCors(async (request: NextRequest) => {
    try {
        // 1. Authenticate user session (Secure getUser pattern)
        const user = await getSecureUser();
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        // 2. Parse form data
        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ message: 'No file provided' }, { status: 400 });
        }

        // 3. File size check
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ message: 'File size exceeds 10MB limit' }, { status: 400 });
        }

        const originalName = file.name;
        const arrayBuffer = await file.arrayBuffer();
        const fileBuffer: Buffer = Buffer.from(arrayBuffer);

        // 4. Magic bytes MIME type validation
        const detectedMime = detectMimeType(fileBuffer);
        if (!detectedMime || !ALLOWED_MIME_TYPES.includes(detectedMime)) {
            return NextResponse.json({ message: 'Unsupported file type. Only PDF, DOCX, PNG, and JPG are allowed.' }, { status: 400 });
        }

        // 5. Metadata stripping based on file type
        let processedBuffer: Buffer = fileBuffer;
        if (detectedMime === 'application/pdf') {
            processedBuffer = await stripPdfMetadata(fileBuffer);
        } else if (detectedMime === 'image/png' || detectedMime === 'image/jpeg') {
            processedBuffer = await stripImageMetadata(fileBuffer);
        }

        // 6. Generate UUID filename and extension mapping
        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        const secureFilename = `${crypto.randomUUID()}.${fileExtension}`;

        // 7. Log file mapping privately for support (never expose in response or storage metadata)
        console.log(`[PRIVACY LOG] User ${user.id} uploaded secure file: "${secureFilename}" (original: "${originalName}", MIME: ${detectedMime})`);

        // 8. Upload to private 'study-materials' bucket in Supabase
        const supabase = await createClient();
        const { data, error } = await supabase.storage
            .from('study-materials')
            .upload(`${user.id}/${secureFilename}`, processedBuffer, {
                contentType: detectedMime,
                duplex: 'half'
            });

        if (error) {
            console.error("Storage upload error:", error.message);
            return NextResponse.json({ message: 'Failed to upload to storage' }, { status: 500 });
        }

        // 9. Fetch user college and register notes upload in database (triggers notifications)
        try {
            const { data: profile } = await supabase
                .from('profiles')
                .select('college')
                .eq('id', user.id)
                .single();

            const college = profile?.college || 'college.edu';

            await supabase
                .from('notes')
                .insert({
                    author_id: user.id,
                    title: originalName,
                    college: college
                });
        } catch (dbErr) {
            console.error("DB notes index/notification sync warning:", dbErr);
        }

        return NextResponse.json({
            message: 'File uploaded and metadata stripped successfully.',
            path: data.path,
            filename: secureFilename
        }, { status: 201 });

    } catch (error: any) {
        console.error("Upload API error:", error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
});

