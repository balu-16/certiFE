/**
 * Utility functions for converting BYTEA data from Supabase to proper binary format
 */

import { debugCertificateData, validatePdfData } from './certificateDebug';

export interface ByteaConversionResult {
  data: Uint8Array;
  isValid: boolean;
  format: 'uint8array' | 'hex' | 'base64' | 'binary' | 'json-array' | 'json-object' | 'unknown';
}

/**
 * Converts various BYTEA formats to Uint8Array
 */
export function convertByteaToUint8Array(certificate: any): ByteaConversionResult {
  console.log('🔍 Starting certificate conversion...');
  debugCertificateData(certificate, 'convertByteaToUint8Array - Input');
  
  if (!certificate) {
    console.error('❌ Certificate is null or undefined');
    throw new Error('Certificate data is null or undefined');
  }

  let certificateArray: Uint8Array;
  let format: ByteaConversionResult['format'] = 'unknown';

  console.log('Converting certificate data:', {
    type: typeof certificate,
    constructor: certificate?.constructor?.name,
    length: certificate?.length,
    isArray: Array.isArray(certificate),
    firstFewChars: typeof certificate === 'string' ? certificate.substring(0, 20) : 'N/A'
  });

  try {
    // Handle Uint8Array (already correct format)
    if (certificate instanceof Uint8Array) {
      console.log('✅ Certificate is already Uint8Array, validating...');
      const isValid = validatePdfHeader(certificate);
      console.log('📄 PDF header validation result:', isValid);
      debugCertificateData(certificate, 'Method 1 - Uint8Array Direct');
      certificateArray = certificate;
      format = 'uint8array';
    }
    // Handle regular Array
    else if (Array.isArray(certificate)) {
      certificateArray = new Uint8Array(certificate);
      format = 'uint8array';
    }
    // Handle ArrayBuffer
    else if (certificate instanceof ArrayBuffer) {
      certificateArray = new Uint8Array(certificate);
      format = 'uint8array';
    }
    // Handle string data (BYTEA from Supabase)
    else if (typeof certificate === 'string') {
      // Method 1: Check if it's hex format (PostgreSQL \x format)
      if (certificate.startsWith('\\x')) {
        console.log('🔧 Processing hex-encoded certificate data...');
        const hexString = certificate.slice(2);
        console.log('📝 Hex string length:', hexString.length);
        
        if (hexString.length % 2 === 0) {
          // First, convert hex to bytes
          const tempArray = new Uint8Array(hexString.length / 2);
          for (let i = 0; i < hexString.length; i += 2) {
            const byte = parseInt(hexString.substr(i, 2), 16);
            if (isNaN(byte)) {
              throw new Error('Invalid hex character');
            }
            tempArray[i / 2] = byte;
          }
          
          console.log('🔄 Converted hex to bytes, checking for JSON...');
          debugCertificateData(tempArray, 'Method 1 - After Hex Conversion');
          
          // Convert bytes to string to check if it's JSON
          const decodedString = new TextDecoder('utf-8').decode(tempArray);
          
          console.log('📄 Decoded string preview:', decodedString.substring(0, 100));
          
          // Check if the decoded string is JSON (likely a serialized byte array)
          if (decodedString.startsWith('{') || decodedString.startsWith('[')) {
            console.log('🎯 Detected JSON format, parsing...');
            try {
              const jsonData = JSON.parse(decodedString);
              console.log('✅ JSON parsed successfully, type:', Array.isArray(jsonData) ? 'array' : 'object');
              
              // Handle different JSON formats
              if (Array.isArray(jsonData)) {
                console.log('📋 Converting JSON array to Uint8Array...');
                // Direct array of numbers
                certificateArray = new Uint8Array(jsonData);
                format = 'json-array';
              } else if (typeof jsonData === 'object' && jsonData !== null) {
                console.log('📋 Converting JSON object to Uint8Array...');
                // Object with numeric keys (like {"0":37,"1":80,...})
                const keys = Object.keys(jsonData).map(Number).sort((a, b) => a - b);
                certificateArray = new Uint8Array(keys.length);
                for (let i = 0; i < keys.length; i++) {
                  certificateArray[i] = jsonData[keys[i]];
                }
                format = 'json-object';
              } else {
                throw new Error('Unsupported JSON format');
              }
              
              console.log('🎉 JSON conversion complete, validating PDF...');
              debugCertificateData(certificateArray, 'Method 1 - After JSON Conversion');
            } catch (jsonError) {
              console.warn('⚠️ Failed to parse as JSON, treating as raw hex data:', jsonError);
              certificateArray = tempArray;
              format = 'hex';
            }
          } else {
            console.log('📄 Treating as raw hex-decoded data...');
            // Not JSON, use the raw hex-decoded data
            certificateArray = tempArray;
            format = 'hex';
          }
        } else {
          throw new Error('Invalid hex string length');
        }
      }
      // Method 2: Check if it's a direct JSON string (array or object)
      else if ((certificate.startsWith('[') || certificate.startsWith('{'))) {
        try {
          const jsonData = JSON.parse(certificate);
          console.log('Found direct JSON data, attempting to convert to byte array');
          
          // Handle different JSON formats
          if (Array.isArray(jsonData)) {
            // Direct array of numbers
            certificateArray = new Uint8Array(jsonData);
            format = 'json-array';
          } else if (typeof jsonData === 'object' && jsonData !== null) {
            // Object with numeric keys (like {"0":37,"1":80,...})
            const keys = Object.keys(jsonData).map(Number).sort((a, b) => a - b);
            certificateArray = new Uint8Array(keys.length);
            for (let i = 0; i < keys.length; i++) {
              certificateArray[i] = jsonData[keys[i]];
            }
            format = 'json-object';
          } else {
            throw new Error('Unsupported JSON format');
          }
        } catch (jsonError) {
          console.warn('Failed to parse direct JSON, falling back to other methods');
          throw new Error('Invalid JSON format');
        }
      }
      // Method 3: Try base64 decoding
       else if (isBase64(certificate)) {
         try {
           const base64Data = certificate.replace(/^data:application\/pdf;base64,/, '');
           const binaryString = atob(base64Data);
           certificateArray = new Uint8Array(binaryString.length);
           for (let i = 0; i < binaryString.length; i++) {
             certificateArray[i] = binaryString.charCodeAt(i);
           }
           format = 'base64';
         } catch (e) {
           throw new Error('Invalid base64 format');
         }
       }
       // Method 4: Handle as raw binary string (each char is a byte)
      else {
        // Check if it looks like binary data (contains non-printable characters)
        const hasBinaryChars = certificate.split('').some(char => {
          const code = char.charCodeAt(0);
          return code < 32 || code > 126;
        });
        
        if (hasBinaryChars || certificate.length > 1000) {
          // Treat as binary string
          certificateArray = new Uint8Array(certificate.length);
          for (let i = 0; i < certificate.length; i++) {
            certificateArray[i] = certificate.charCodeAt(i) & 0xFF;
          }
          format = 'binary';
        } else {
          // Try to decode as UTF-8 encoded binary data
          try {
            const encoder = new TextEncoder();
            const decoder = new TextDecoder('latin1');
            const bytes = encoder.encode(certificate);
            const binaryString = decoder.decode(bytes);
            certificateArray = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              certificateArray[i] = binaryString.charCodeAt(i) & 0xFF;
            }
            format = 'binary';
          } catch (e) {
            // Fallback to direct character code conversion
            certificateArray = new Uint8Array(certificate.length);
            for (let i = 0; i < certificate.length; i++) {
              certificateArray[i] = certificate.charCodeAt(i) & 0xFF;
            }
            format = 'binary';
          }
        }
      }
    }
    // Handle object with buffer property (some Node.js Buffer representations)
    else if (certificate && typeof certificate === 'object' && certificate.data) {
      if (Array.isArray(certificate.data)) {
        certificateArray = new Uint8Array(certificate.data);
        format = 'uint8array';
      } else {
        throw new Error('Unsupported object format');
      }
    }
    else {
      throw new Error('Unsupported data type');
    }

    console.log(`Converted ${format} format to Uint8Array:`, {
      originalLength: certificate.length,
      convertedLength: certificateArray.length,
      firstFewBytes: Array.from(certificateArray.slice(0, 10))
    });

    // Validate that it's a PDF by checking the header
    const isValid = validatePdfHeader(certificateArray);
    
    if (!isValid) {
      console.warn('PDF header validation failed. First 10 bytes:', Array.from(certificateArray.slice(0, 10)));
      console.warn('Expected PDF header: [37, 80, 68, 70] (%PDF)');
    }
    
    return {
      data: certificateArray,
      isValid,
      format
    };

  } catch (error) {
    console.error('Error converting BYTEA data:', error);
    return {
      data: new Uint8Array(0),
      isValid: false,
      format: 'unknown'
    };
  }
}

/**
 * Validates if the data starts with PDF header
 */
function validatePdfHeader(data: Uint8Array): boolean {
  if (data.length < 4) return false;
  
  // PDF header: %PDF
  const pdfHeader = [0x25, 0x50, 0x44, 0x46];
  return pdfHeader.every((byte, index) => data[index] === byte);
}

/**
 * Checks if a string is valid base64
 */
function isBase64(str: string): boolean {
  try {
    // Remove data URL prefix if present
    const cleanStr = str.replace(/^data:application\/pdf;base64,/, '');
    // Check if it's valid base64
    return btoa(atob(cleanStr)) === cleanStr;
  } catch (e) {
    return false;
  }
}

/**
 * Creates a PDF blob from certificate data with comprehensive error handling
 */
export function createPdfBlob(certificate: any): Blob {
  console.log('🎯 Creating PDF blob...');
  debugCertificateData(certificate, 'createPdfBlob - Input');
  
  try {
    const result = convertByteaToUint8Array(certificate);
    console.log('📊 Conversion result:', {
      format: result.format,
      isValid: result.isValid,
      dataLength: result.data.length
    });
    
    debugCertificateData(result.data, 'createPdfBlob - After Conversion');
    
    if (!result.isValid) {
      console.warn('⚠️ PDF validation failed, but proceeding with blob creation');
    }
    
    if (result.data.length === 0) {
      throw new Error('Converted certificate data is empty');
    }
    
    const blob = new Blob([result.data], { type: 'application/pdf' });
    console.log('✅ PDF blob created successfully:', {
      size: blob.size,
      type: blob.type
    });
    
    return blob;
  } catch (error) {
    console.error('❌ Error creating PDF blob:', error);
    throw new Error(`Failed to create PDF blob: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}