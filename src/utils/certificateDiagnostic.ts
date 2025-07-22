/**
 * Emergency diagnostic utility for certificate issues
 * Use this to quickly test certificate data integrity
 */

export const emergencyDiagnostic = {
  /**
   * Test if certificate data can be converted to a valid PDF
   */
  testCertificateData: (certificate: any) => {
    console.log('🚨 EMERGENCY DIAGNOSTIC START 🚨');
    
    try {
      // Test 1: Basic data check
      console.log('Test 1 - Basic Data Check:');
      console.log('- Type:', typeof certificate);
      console.log('- Length:', certificate?.length || 0);
      console.log('- Is Array:', Array.isArray(certificate));
      console.log('- Is Uint8Array:', certificate instanceof Uint8Array);
      
      // Test 2: Content preview
      console.log('Test 2 - Content Preview:');
      if (typeof certificate === 'string') {
        console.log('- First 100 chars:', certificate.substring(0, 100));
        console.log('- Contains PDF marker:', certificate.includes('%PDF'));
        console.log('- Contains hex pattern:', /^[0-9a-fA-F]+$/.test(certificate.substring(0, 20)));
      } else if (certificate instanceof Uint8Array) {
        const textDecoder = new TextDecoder();
        const preview = textDecoder.decode(certificate.slice(0, 100));
        console.log('- First 100 bytes as text:', preview);
        console.log('- Contains PDF marker:', preview.includes('%PDF'));
      }
      
      // Test 3: Try direct blob creation
      console.log('Test 3 - Direct Blob Creation:');
      let testBlob: Blob;
      
      if (typeof certificate === 'string') {
        // Try as hex string first
        try {
          const bytes = new Uint8Array(certificate.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []);
          testBlob = new Blob([bytes], { type: 'application/pdf' });
          console.log('- Hex conversion blob size:', testBlob.size);
        } catch (e) {
          console.log('- Hex conversion failed:', e);
          
          // Try as direct string
          testBlob = new Blob([certificate], { type: 'application/pdf' });
          console.log('- Direct string blob size:', testBlob.size);
        }
      } else {
        testBlob = new Blob([certificate], { type: 'application/pdf' });
        console.log('- Direct array blob size:', testBlob.size);
      }
      
      // Test 4: Create download link for manual testing
      console.log('Test 4 - Manual Download Test:');
      const url = URL.createObjectURL(testBlob);
      console.log('- Download URL created:', url);
      console.log('- Click this link to test download:', url);
      
      // Auto-cleanup after 30 seconds
      setTimeout(() => {
        URL.revokeObjectURL(url);
        console.log('- Test URL cleaned up');
      }, 30000);
      
      return {
        success: true,
        blobSize: testBlob.size,
        downloadUrl: url
      };
      
    } catch (error) {
      console.error('🚨 DIAGNOSTIC FAILED:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    } finally {
      console.log('🚨 EMERGENCY DIAGNOSTIC END 🚨');
    }
  },

  /**
   * Create a test PDF to verify the download system works
   */
  createTestPdf: () => {
    console.log('📝 Creating test PDF...');
    
    // Simple PDF content
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
0000000206 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
300
%%EOF`;

    const blob = new Blob([pdfContent], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    
    console.log('✅ Test PDF created successfully');
    console.log('- Size:', blob.size, 'bytes');
    console.log('- Download URL:', url);
    
    // Create download link
    const link = document.createElement('a');
    link.href = url;
    link.download = 'test-certificate.pdf';
    link.click();
    
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    
    return { success: true, size: blob.size };
  }
};

// Make it globally available for console testing
(window as any).emergencyDiagnostic = emergencyDiagnostic;