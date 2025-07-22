// Testing Utilities
// src/utils/testHelpers.ts

export const mockStudent = {
  student_id: 1,
  name: 'Test Student',
  phone_number: '1234567890',
  email: 'test@example.com',
  year: '2024',
  branch: 'Computer Science',
  college_name: 'Test College',
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

export const createMockFetch = (response: any, ok = true) => {
  return jest.fn(() =>
    Promise.resolve({
      ok,
      json: () => Promise.resolve(response),
      status: ok ? 200 : 500,
      statusText: ok ? 'OK' : 'Internal Server Error'
    })
  ) as jest.MockedFunction<typeof fetch>;
};

export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));