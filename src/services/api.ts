const API_BASE = '/api';

export function getStudentToken(): string | null {
  return localStorage.getItem('dr_student_token');
}

export function setStudentToken(token: string | null) {
  if (token) localStorage.setItem('dr_student_token', token);
  else localStorage.removeItem('dr_student_token');
}

export function getAdminToken(): string | null {
  return localStorage.getItem('dr_admin_token');
}

export function setAdminToken(token: string | null) {
  if (token) localStorage.setItem('dr_admin_token', token);
  else localStorage.removeItem('dr_admin_token');
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  userType: 'student' | 'admin' | 'any' = 'any'
): Promise<T> {
  const headers = new Headers(options.headers || {});
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  let token: string | null = null;
  if (userType === 'admin') {
    token = getAdminToken();
  } else if (userType === 'student') {
    token = getStudentToken();
  } else {
    token = getStudentToken() || getAdminToken();
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMsg = data?.error || data?.message || `Request failed with status ${res.status}`;
    const error: any = new Error(errorMsg);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data as T;
}

export const api = {
  // Auth
  studentRegister: (data: any) => request<any>('/auth/student/register', { method: 'POST', body: JSON.stringify(data) }),
  studentLogin: (data: any) => request<any>('/auth/student/login', { method: 'POST', body: JSON.stringify(data) }),
  studentForgotPass: (data: { email: string }) => request<any>('/auth/student/forgot-password', { method: 'POST', body: JSON.stringify(data) }),
  studentResetPass: (data: any) => request<any>('/auth/student/reset-password', { method: 'POST', body: JSON.stringify(data) }),
  studentProfile: () => request<any>('/auth/student/profile', { method: 'GET' }, 'student'),
  updateStudentProfile: (data: any) => request<any>('/auth/student/profile', { method: 'PUT', body: JSON.stringify(data) }, 'student'),

  adminLogin: (data: any) => request<any>('/auth/admin/login', { method: 'POST', body: JSON.stringify(data) }),
  adminProfile: () => request<any>('/auth/admin/profile', { method: 'GET' }, 'admin'),

  // Classplus Courses Storefront
  getCourses: (params: { branch?: string; semester?: number; search?: string; sort?: string; all?: boolean } = {}) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') q.append(k, v.toString());
    });
    return request<any[]>(`/courses?${q.toString()}`);
  },
  getCourseById: (id: string) => request<any>(`/courses/${id}`),
  getMaterialById: (id: string) => request<any>(`/courses/${id}`),
  viewPDF: (pdfId: string) => request<any>(`/pdfs/${pdfId}/view`),
  getMaterials: (_params: any = {}) => request<any[]>('/courses'),
  getMaterialPreview: (pdfId: string) => request<any>(`/pdfs/${pdfId}/view`),
  getReviews: (courseId?: string) => request<any[]>(`/courses/${courseId || ''}`),
  addReview: (data: any) => request<any>('/courses/review', { method: 'POST', body: JSON.stringify(data) }),

  // Branches & Notifications
  getBranches: () => request<any[]>('/branches'),
  getNotifications: () => request<any[]>('/notifications'),

  // Checkout & Enrollments
  createOrder: (itemType: 'course' | 'subcourse' | 'pdf', itemId: string, couponCode?: string) =>
    request<any>('/orders/create', { method: 'POST', body: JSON.stringify({ item_type: itemType, item_id: itemId, coupon_code: couponCode }) }, 'student'),
  verifyPayment: (payload: any) => request<any>('/orders/verify-payment', { method: 'POST', body: JSON.stringify(payload) }, 'student'),
  validateCoupon: (code: string, cartTotal: number) =>
    request<any>('/coupons/validate', { method: 'POST', body: JSON.stringify({ code, cart_total: cartTotal }) }),
  getMyPurchases: () => request<any[]>('/purchases/my-purchases', { method: 'GET' }, 'student'),
  getMyOrders: () => request<any[]>('/purchases/my-purchases', { method: 'GET' }, 'student'),

  // ==========================================
  // ADMIN APIS: FULL CLASSPLUS MANAGEMENT
  // ==========================================
  adminWipeAllCoursesAndPDFs: () => request<any>('/admin/wipe-all-courses-and-pdfs', { method: 'POST' }, 'admin'),
  adminSeedDefaultTemplate: () => request<any>('/admin/seed-default-template', { method: 'POST' }, 'admin'),

  adminCreateCourse: (data: any) => request<any>('/admin/courses', { method: 'POST', body: JSON.stringify(data) }, 'admin'),
  adminUpdateCourse: (id: string, data: any) => request<any>(`/admin/courses/${id}`, { method: 'PUT', body: JSON.stringify(data) }, 'admin'),
  adminDeleteCourse: (id: string) => request<any>(`/admin/courses/${id}`, { method: 'DELETE' }, 'admin'),

  adminCreateSubcourse: (data: any) => request<any>('/admin/subcourses', { method: 'POST', body: JSON.stringify(data) }, 'admin'),
  adminUpdateSubcourse: (id: string, data: any) => request<any>(`/admin/subcourses/${id}`, { method: 'PUT', body: JSON.stringify(data) }, 'admin'),
  adminDeleteSubcourse: (id: string) => request<any>(`/admin/subcourses/${id}`, { method: 'DELETE' }, 'admin'),

  adminCreateFolder: (data: any) => request<any>('/admin/folders', { method: 'POST', body: JSON.stringify(data) }, 'admin'),
  adminUpdateFolder: (id: string, data: any) => request<any>(`/admin/folders/${id}`, { method: 'PUT', body: JSON.stringify(data) }, 'admin'),
  adminDeleteFolder: (id: string) => request<any>(`/admin/folders/${id}`, { method: 'DELETE' }, 'admin'),

  adminCreatePDF: (data: any) => request<any>('/admin/pdfs', { method: 'POST', body: JSON.stringify(data) }, 'admin'),
  adminUpdatePDF: (id: string, data: any) => request<any>(`/admin/pdfs/${id}`, { method: 'PUT', body: JSON.stringify(data) }, 'admin'),
  adminDeletePDF: (id: string) => request<any>(`/admin/pdfs/${id}`, { method: 'DELETE' }, 'admin'),

  adminGetStudents: () => request<any[]>('/admin/students', { method: 'GET' }, 'admin'),
  adminGrantAccess: (data: { user_id: string; item_type: string; item_id: string }) =>
    request<any>('/admin/grant-access', { method: 'POST', body: JSON.stringify(data) }, 'admin'),
  adminRevokeAccess: (data: { user_id: string; item_id: string }) =>
    request<any>('/admin/revoke-access', { method: 'POST', body: JSON.stringify(data) }, 'admin'),

  adminGetAnalytics: () => request<any>('/admin/analytics', { method: 'GET' }, 'admin'),
};
