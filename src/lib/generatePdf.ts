import jsPDF from 'jspdf';
import { supabase, LibraryBook, LibraryChapter } from './supabase';

/**
 * Generate PDF from book chapters
 * Fetches all chapters for a book and converts Markdown content to PDF
 */
export async function generatePDF(book: LibraryBook): Promise<void> {
    try {
        // Fetch all chapters for this book
        const { data: chapters, error } = await supabase
            .from('ab_library_chapters')
            .select('*')
            .eq('book_id', book.id)
            .order('sort_order', { ascending: true });

        if (error) throw error;

        // Create new PDF document
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

        // Helper function to add new page if needed
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

        // Subtitle
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text('SatuLibrary Collection', pageWidth / 2, titleY + 20, { align: 'center' });

        // Description
        if (book.description) {
            doc.setFontSize(11);
            const descLines = doc.splitTextToSize(book.description, contentWidth - 40);
            doc.text(descLines, pageWidth / 2, titleY + 35, { align: 'center' });
        }

        // Footer on title page
        doc.setFontSize(10);
        doc.text('asrulbasri.com', pageWidth / 2, pageHeight - 20, { align: 'center' });

        // Add chapters
        if (chapters && chapters.length > 0) {
            for (const chapter of chapters) {
                doc.addPage();
                yPosition = margin;
                doc.setTextColor(0, 0, 0);

                // Chapter title
                doc.setFontSize(20);
                doc.setFont('helvetica', 'bold');
                const chapterTitleLines = doc.splitTextToSize(chapter.title, contentWidth);
                doc.text(chapterTitleLines, margin, yPosition);
                yPosition += chapterTitleLines.length * 10 + 10;

                // Chapter content
                if (chapter.content) {
                    const lines = chapter.content.split('\n');

                    for (const line of lines) {
                        // Skip empty lines
                        if (line.trim() === '') {
                            yPosition += 5;
                            continue;
                        }

                        checkPageBreak(15);

                        // H1
                        if (line.startsWith('# ')) {
                            doc.setFontSize(18);
                            doc.setFont('helvetica', 'bold');
                            const textLines = doc.splitTextToSize(line.slice(2), contentWidth);
                            doc.text(textLines, margin, yPosition);
                            yPosition += textLines.length * 8 + 8;
                            continue;
                        }

                        // H2
                        if (line.startsWith('## ')) {
                            doc.setFontSize(14);
                            doc.setFont('helvetica', 'bold');
                            const textLines = doc.splitTextToSize(line.slice(3), contentWidth);
                            doc.text(textLines, margin, yPosition);
                            yPosition += textLines.length * 6 + 6;
                            continue;
                        }

                        // H3
                        if (line.startsWith('### ')) {
                            doc.setFontSize(12);
                            doc.setFont('helvetica', 'bold');
                            const textLines = doc.splitTextToSize(line.slice(4), contentWidth);
                            doc.text(textLines, margin, yPosition);
                            yPosition += textLines.length * 5 + 5;
                            continue;
                        }

                        // Blockquote
                        if (line.startsWith('> ')) {
                            doc.setFontSize(11);
                            doc.setFont('helvetica', 'italic');
                            doc.setTextColor(80, 80, 80);
                            const textLines = doc.splitTextToSize(line.slice(2), contentWidth - 10);
                            doc.text(textLines, margin + 5, yPosition);
                            yPosition += textLines.length * 5 + 5;
                            doc.setTextColor(0, 0, 0);
                            continue;
                        }

                        // List item
                        if (line.trim().startsWith('- ')) {
                            doc.setFontSize(11);
                            doc.setFont('helvetica', 'normal');
                            doc.text('•', margin, yPosition);
                            const textLines = doc.splitTextToSize(line.trim().slice(2), contentWidth - 10);
                            doc.text(textLines, margin + 5, yPosition);
                            yPosition += textLines.length * 5 + 3;
                            continue;
                        }

                        // Regular paragraph
                        doc.setFontSize(11);
                        doc.setFont('helvetica', 'normal');
                        // Remove markdown bold markers for PDF
                        const cleanLine = line.replace(/\*\*(.*?)\*\*/g, '$1');
                        const textLines = doc.splitTextToSize(cleanLine, contentWidth);
                        doc.text(textLines, margin, yPosition);
                        yPosition += textLines.length * 5 + 4;
                    }
                }
            }
        }

        // Save the PDF
        const filename = `${book.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
        doc.save(filename);

    } catch (error) {
        console.error('Error generating PDF:', error);
        throw error;
    }
}
