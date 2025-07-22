/**
 * Utility functions for converting image data to PDF format
 */

export interface ImageToPdfResult {
  success: boolean;
  blob?: Blob;
  error?: string;
}

/**
 * Converts base64 image data to PDF blob
 */
export async function convertImageToPdf(imageData: string): Promise<ImageToPdfResult> {
  try {
    console.log('🔄 Converting image to PDF...');
    
    // Validate input
    if (!imageData || typeof imageData !== 'string') {
      throw new Error('Invalid image data provided');
    }

    // Check if it's a valid base64 image
    if (!imageData.startsWith('data:image/')) {
      throw new Error('Invalid image format - must be base64 data URL');
    }

    // Import jsPDF dynamically
    const { jsPDF } = await import('jspdf');

    // Create new PDF document in landscape orientation
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'in',
      format: [11, 8.2]
    });

    // Create an image element to get dimensions
    const img = new Image();
    
    return new Promise((resolve) => {
      img.onload = () => {
        try {
          // Calculate dimensions to fit the PDF page
          const pdfWidth = 11;
          const pdfHeight = 8.2;
          const imgAspectRatio = img.width / img.height;
          const pdfAspectRatio = pdfWidth / pdfHeight;

          let finalWidth = pdfWidth;
          let finalHeight = pdfHeight;
          let x = 0;
          let y = 0;

          // Maintain aspect ratio and center the image
          if (imgAspectRatio > pdfAspectRatio) {
            // Image is wider than PDF ratio
            finalHeight = pdfWidth / imgAspectRatio;
            y = (pdfHeight - finalHeight) / 2;
          } else {
            // Image is taller than PDF ratio
            finalWidth = pdfHeight * imgAspectRatio;
            x = (pdfWidth - finalWidth) / 2;
          }

          // Add image to PDF
          pdf.addImage(imageData, 'PNG', x, y, finalWidth, finalHeight);

          // Generate PDF blob
          const pdfBlob = pdf.output('blob');

          console.log('✅ Image successfully converted to PDF');
          resolve({
            success: true,
            blob: pdfBlob
          });
        } catch (error) {
          console.error('❌ Error adding image to PDF:', error);
          resolve({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to add image to PDF'
          });
        }
      };

      img.onerror = () => {
        console.error('❌ Failed to load image data');
        resolve({
          success: false,
          error: 'Failed to load image data'
        });
      };

      // Load the image
      img.src = imageData;
    });

  } catch (error) {
    console.error('❌ Error converting image to PDF:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Downloads a PDF blob with the specified filename
 */
export function downloadPdfBlob(blob: Blob, filename: string): void {
  try {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    
    // Clean up
    setTimeout(() => URL.revokeObjectURL(url), 100);
    
    console.log('✅ PDF download initiated');
  } catch (error) {
    console.error('❌ Error downloading PDF:', error);
    throw error;
  }
}