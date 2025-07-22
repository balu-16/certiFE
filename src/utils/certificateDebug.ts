// Certificate Debug Utility
// This utility helps debug certificate data issues

export function debugCertificateData(certificate: any, context: string = 'unknown') {
  console.log(`=== Certificate Debug - ${context} ===`);
  console.log('Type:', typeof certificate);
  console.log('Constructor:', certificate?.constructor?.name);
  console.log('Length:', certificate?.length);
  console.log('Is Array:', Array.isArray(certificate));
  console.log('Is Uint8Array:', certificate instanceof Uint8Array);
  
  if (typeof certificate === 'string') {
    console.log('String length:', certificate.length);
    console.log('First 100 chars:', certificate.substring(0, 100));
    console.log('Starts with hex prefix:', certificate.startsWith('\\x'));
    
    // Check if it's JSON
    try {
      const parsed = JSON.parse(certificate);
      console.log('Is valid JSON:', true);
      console.log('JSON type:', typeof parsed);
      console.log('JSON is array:', Array.isArray(parsed));
    } catch {
      console.log('Is valid JSON:', false);
    }
  }
  
  if (certificate instanceof Uint8Array || Array.isArray(certificate)) {
    console.log('First 10 bytes:', Array.from(certificate.slice(0, 10)));
    
    // Check for PDF header
    const pdfHeader = [0x25, 0x50, 0x44, 0x46]; // %PDF
    const hasValidPdfHeader = pdfHeader.every((byte, index) => certificate[index] === byte);
    console.log('Has valid PDF header:', hasValidPdfHeader);
    
    if (!hasValidPdfHeader && certificate.length > 0) {
      console.log('Expected PDF header:', pdfHeader);
      console.log('Actual first 4 bytes:', Array.from(certificate.slice(0, 4)));
    }
  }
  
  console.log('=== End Debug ===\n');
}

export function validatePdfData(data: Uint8Array): boolean {
  if (!data || data.length === 0) {
    console.error('PDF data is empty or null');
    return false;
  }
  
  // Check for PDF header (%PDF)
  const pdfHeader = [0x25, 0x50, 0x44, 0x46];
  const hasValidHeader = pdfHeader.every((byte, index) => data[index] === byte);
  
  if (!hasValidHeader) {
    console.error('Invalid PDF header. Expected %PDF, got:', 
      String.fromCharCode(...data.slice(0, 4)));
    return false;
  }
  
  // Check for PDF trailer
  const dataStr = String.fromCharCode(...data.slice(-1024)); // Check last 1KB
  const hasTrailer = dataStr.includes('%%EOF');
  
  if (!hasTrailer) {
    console.warn('PDF trailer (%%EOF) not found in last 1KB');
  }
  
  return true;
}

export function createTestPdf(): Uint8Array {
  // Create a minimal valid PDF for testing
  const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
100 700 Td
(Test PDF) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000204 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
297
%%EOF`;

  return new TextEncoder().encode(pdfContent);
}