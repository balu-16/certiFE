// Testing Utilities
// src/utils/testHelpers.ts

export const mockStudent = {
  student_id: 1,
  name: 'Test Student',
  phone_number: '1234567890',
  email: 'test@example.com',
  year: '2024',
  branch: 'Computer Science',
  college_id: 1,
  eligible: true,
  certificate: null,
  certificate_id: null,
  downloaded_count: 0,
  deleted: false,
  created_at: new Date().toISOString()
};

export const mockApiResponse = {
  success: (data: any) => ({
    success: true,
    data,
    timestamp: new Date().toISOString()
  }),
  error: (message: string) => ({
    success: false,
    error: message,
    timestamp: new Date().toISOString()
  })
};

// Simple mock fetch function without Jest dependencies
export const createMockFetch = (response: any, ok = true) => {
  const mockFn = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> =>
    Promise.resolve({
      ok,
      json: () => Promise.resolve(response),
      status: ok ? 200 : 500,
      statusText: ok ? 'OK' : 'Internal Server Error',
      headers: new Headers(),
      redirected: false,
      type: 'basic' as ResponseType,
      url: '',
      clone: () => ({} as Response),
      body: null,
      bodyUsed: false,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
      blob: () => Promise.resolve(new Blob()),
      formData: () => Promise.resolve(new FormData()),
      text: () => Promise.resolve('')
    } as Response);
  
  return mockFn;
};

export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));