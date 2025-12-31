import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import jsPDF from 'jspdf';

function getSupabaseClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Supabase not configured');
    }

    return createClient(supabaseUrl, supabaseServiceKey);
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const supabase = getSupabaseClient();
        const { token } = await params;

        // Validate token
        const { data: downloadRequest, error: requestError } = await supabase
            .from('ab_download_requests')
            .select('*, ab_library_books(*)')
            .eq('download_token', token)
            .single();

        if (requestError || !downloadRequest) {
            return NextResponse.json({ error: 'Invalid download link' }, { status: 404 });
        }

        // Check expiry
        if (new Date(downloadRequest.expires_at) < new Date()) {
            return NextResponse.json({ error: 'Download link has expired' }, { status: 410 });
        }

        const book = downloadRequest.ab_library_books;

        // Fetch chapters
        const { data: chapters } = await supabase
            .from('ab_library_chapters')
            .select('*')
            .eq('book_id', book.id)
            .order('sort_order', { ascending: true });

        // Generate PDF
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;
        const contentWidth = pageWidth - (margin * 2);
        let yPosition = margin;

        const checkPageBreak = (requiredHeight: number) => {
            if (yPosition + requiredHeight > pageHeight - margin) {
                doc.addPage();
                yPosition = margin;
                return true;
            }
            return false;
        };

        // Title Page
        doc.setFontSize(32);
        doc.setFont('helvetica', 'bold');
        const titleLines = doc.splitTextToSize(book.title, contentWidth);
        const titleY = (pageHeight / 2) - 20;
        doc.text(titleLines, pageWidth / 2, titleY, { align: 'center' });

        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text('SatuLibrary Collection', pageWidth / 2, titleY + 20, { align: 'center' });

        if (book.description) {
            doc.setFontSize(11);
            const descLines = doc.splitTextToSize(book.description, contentWidth - 40);
            doc.text(descLines, pageWidth / 2, titleY + 35, { align: 'center' });
        }

        doc.setFontSize(10);
        doc.text('asrulbasri.com', pageWidth / 2, pageHeight - 20, { align: 'center' });

        // Add chapters
        if (chapters && chapters.length > 0) {
            for (const chapter of chapters) {
                doc.addPage();
                yPosition = margin;
                doc.setTextColor(0, 0, 0);

                // Helper to clean text (remove emoji, fix encoding)
                const cleanText = (text: string) => {
                    return text
                        // Remove emoji
                        .replace(/[\u{1F600}-\u{1F64F}]/gu, '')
                        .replace(/[\u{1F300}-\u{1F5FF}]/gu, '')
                        .replace(/[\u{1F680}-\u{1F6FF}]/gu, '')
                        .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '')
                        .replace(/[\u{2600}-\u{26FF}]/gu, '')
                        .replace(/[\u{2700}-\u{27BF}]/gu, '')
                        .replace(/[\u{1F900}-\u{1F9FF}]/gu, '')
                        .replace(/[\u{1FA00}-\u{1FA6F}]/gu, '')
                        .replace(/[\u{1FA70}-\u{1FAFF}]/gu, '')
                        // Replace number emoji with text
                        .replace(/1️⃣/g, '1.')
                        .replace(/2️⃣/g, '2.')
                        .replace(/3️⃣/g, '3.')
                        .replace(/4️⃣/g, '4.')
                        .replace(/5️⃣/g, '5.')
                        .replace(/6️⃣/g, '6.')
                        .replace(/7️⃣/g, '7.')
                        .replace(/8️⃣/g, '8.')
                        .replace(/9️⃣/g, '9.')
                        .replace(/🔟/g, '10.')
                        // Replace other common emoji
                        .replace(/✅/g, '[✓]')
                        .replace(/❌/g, '[X]')
                        .replace(/⚠️/g, '[!]')
                        .replace(/📌/g, '•')
                        .replace(/💡/g, '*')
                        .replace(/🔑/g, '-')
                        .replace(/📖/g, '')
                        .replace(/📚/g, '')
                        // Remove bold markdown
                        .replace(/\*\*(.*?)\*\*/g, '$1')
                        .trim();
                };

                // Chapter title
                doc.setFontSize(20);
                doc.setFont('helvetica', 'bold');
                const chapterTitle = cleanText(chapter.title);
                const chapterTitleLines = doc.splitTextToSize(chapterTitle, contentWidth);
                doc.text(chapterTitleLines, margin, yPosition);
                yPosition += chapterTitleLines.length * 10 + 10;

                if (chapter.content) {
                    const lines = chapter.content.split('\n');

                    for (const line of lines) {
                        const trimmedLine = line.trim();

                        // Skip empty lines
                        if (trimmedLine === '') {
                            yPosition += 4;
                            continue;
                        }

                        // Horizontal rule
                        if (trimmedLine === '---' || trimmedLine === '***' || trimmedLine.match(/^[-*_]{3,}$/)) {
                            checkPageBreak(10);
                            yPosition += 5;
                            doc.setDrawColor(200, 200, 200);
                            doc.line(margin, yPosition, pageWidth - margin, yPosition);
                            yPosition += 8;
                            continue;
                        }

                        checkPageBreak(15);

                        // H1 heading
                        if (line.startsWith('# ')) {
                            doc.setFontSize(16);
                            doc.setFont('helvetica', 'bold');
                            const textLines = doc.splitTextToSize(cleanText(line.slice(2)), contentWidth);
                            doc.text(textLines, margin, yPosition);
                            yPosition += textLines.length * 7 + 8;
                            continue;
                        }

                        // H2 heading
                        if (line.startsWith('## ')) {
                            doc.setFontSize(14);
                            doc.setFont('helvetica', 'bold');
                            const textLines = doc.splitTextToSize(cleanText(line.slice(3)), contentWidth);
                            doc.text(textLines, margin, yPosition);
                            yPosition += textLines.length * 6 + 6;
                            continue;
                        }

                        // H3 heading
                        if (line.startsWith('### ')) {
                            doc.setFontSize(12);
                            doc.setFont('helvetica', 'bold');
                            const textLines = doc.splitTextToSize(cleanText(line.slice(4)), contentWidth);
                            doc.text(textLines, margin, yPosition);
                            yPosition += textLines.length * 5 + 5;
                            continue;
                        }

                        // Blockquote
                        if (trimmedLine.startsWith('> ')) {
                            doc.setFontSize(11);
                            doc.setFont('helvetica', 'italic');
                            doc.setTextColor(80, 80, 80);
                            const textLines = doc.splitTextToSize(cleanText(trimmedLine.slice(2)), contentWidth - 15);
                            doc.text(textLines, margin + 8, yPosition);
                            yPosition += textLines.length * 5 + 4;
                            doc.setTextColor(0, 0, 0);
                            continue;
                        }

                        // Numbered list
                        const numberedMatch = trimmedLine.match(/^(\d+)\.\s+(.+)/);
                        if (numberedMatch) {
                            doc.setFontSize(11);
                            doc.setFont('helvetica', 'normal');
                            doc.text(`${numberedMatch[1]}.`, margin, yPosition);
                            const textLines = doc.splitTextToSize(cleanText(numberedMatch[2]), contentWidth - 12);
                            doc.text(textLines, margin + 8, yPosition);
                            yPosition += textLines.length * 5 + 3;
                            continue;
                        }

                        // Bullet list
                        if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
                            doc.setFontSize(11);
                            doc.setFont('helvetica', 'normal');
                            doc.text('•', margin, yPosition);
                            const textLines = doc.splitTextToSize(cleanText(trimmedLine.slice(2)), contentWidth - 10);
                            doc.text(textLines, margin + 6, yPosition);
                            yPosition += textLines.length * 5 + 3;
                            continue;
                        }

                        // Checkbox list
                        if (trimmedLine.startsWith('- [ ] ') || trimmedLine.startsWith('- [x] ') || trimmedLine.startsWith('- [X] ')) {
                            doc.setFontSize(11);
                            doc.setFont('helvetica', 'normal');
                            const isChecked = trimmedLine.includes('[x]') || trimmedLine.includes('[X]');
                            doc.text(isChecked ? '[✓]' : '[ ]', margin, yPosition);
                            const textLines = doc.splitTextToSize(cleanText(trimmedLine.slice(6)), contentWidth - 12);
                            doc.text(textLines, margin + 10, yPosition);
                            yPosition += textLines.length * 5 + 3;
                            continue;
                        }

                        // Table row detection (starts with |)
                        if (trimmedLine.startsWith('|') && trimmedLine.endsWith('|')) {
                            // Skip separator rows like |---|---|
                            if (trimmedLine.match(/^\|[-:\s|]+\|$/)) {
                                continue;
                            }

                            // Parse table cells
                            const cells = trimmedLine
                                .slice(1, -1)  // Remove outer |
                                .split('|')
                                .map((cell: string) => cleanText(cell.trim()));

                            checkPageBreak(10);

                            const cellWidth = contentWidth / cells.length;
                            doc.setFontSize(10);
                            doc.setFont('helvetica', 'normal');

                            // Draw cells
                            cells.forEach((cell: string, cellIndex: number) => {
                                const x = margin + (cellIndex * cellWidth);
                                const cellText = doc.splitTextToSize(cell, cellWidth - 4);
                                doc.text(cellText, x + 2, yPosition);
                            });

                            // Draw cell borders
                            doc.setDrawColor(180, 180, 180);
                            cells.forEach((_: string, cellIndex: number) => {
                                const x = margin + (cellIndex * cellWidth);
                                doc.rect(x, yPosition - 4, cellWidth, 8);
                            });

                            yPosition += 10;
                            continue;
                        }

                        // Code block (lines starting with spaces or tabs, or between ```)
                        if (trimmedLine.startsWith('```') || line.startsWith('    ') || line.startsWith('\t')) {
                            doc.setFontSize(9);
                            doc.setFont('courier', 'normal');
                            doc.setTextColor(50, 50, 50);

                            // Draw background
                            checkPageBreak(8);
                            doc.setFillColor(245, 245, 245);
                            const codeText = line.replace(/^```\w*/, '').replace(/```$/, '').replace(/^\t/, '  ').replace(/^    /, '');
                            if (codeText.trim()) {
                                const textLines = doc.splitTextToSize(codeText, contentWidth - 10);
                                doc.rect(margin, yPosition - 4, contentWidth, textLines.length * 4 + 4, 'F');
                                doc.text(textLines, margin + 4, yPosition);
                                yPosition += textLines.length * 4 + 4;
                            }
                            doc.setTextColor(0, 0, 0);
                            continue;
                        }

                        // Regular paragraph
                        doc.setFontSize(11);
                        doc.setFont('helvetica', 'normal');
                        const cleanedLine = cleanText(line);
                        if (cleanedLine) {
                            const textLines = doc.splitTextToSize(cleanedLine, contentWidth);
                            doc.text(textLines, margin, yPosition);
                            yPosition += textLines.length * 5 + 3;
                        }
                    }
                }
            }
        }

        // Mark as downloaded
        await supabase
            .from('ab_download_requests')
            .update({ downloaded_at: new Date().toISOString() })
            .eq('download_token', token);

        // Return PDF
        const pdfBuffer = doc.output('arraybuffer');
        const filename = `${book.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;

        return new NextResponse(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        });

    } catch (error) {
        console.error('Error processing download:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
