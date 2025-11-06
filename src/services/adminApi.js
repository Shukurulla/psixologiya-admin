import api from './api';

export const adminApi = {
  // Dashboard
  getDashboard: () => api.get('/admin/dashboard'),

  // Statistics
  getTestStatistics: () => api.get('/admin/statistics/tests'),

  // Test Results
  getTestResults: (filters) => api.get('/admin/test-results', { params: filters }),
  getTestResultById: (id) => api.get(`/admin/test-results/${id}`),
  reviewTestResult: (id, data) => api.put(`/admin/test-results/${id}/review`, data),

  // Faculties
  getFaculties: () => api.get('/admin/faculties'),

  // Groups
  getGroups: (departmentId) => api.get('/admin/groups', { params: { department: departmentId } }),

  // Students
  getStudents: (filters) => api.get('/admin/students', { params: filters }),
  getStudentById: (id) => api.get(`/admin/students/${id}`),
  getStudentResults: (studentId) => api.get(`/admin/students/${studentId}/results`),
  getStudentStatistics: (studentId) => api.get(`/admin/students/${studentId}/statistics`),

  // Tests Management
  getTests: () => api.get('/admin/tests'),
  getTestById: (id) => api.get(`/admin/tests/${id}`),
  createTest: (data) => api.post('/admin/tests', data),
  updateTest: (id, data) => api.put(`/admin/tests/${id}`, data),
  deleteTest: (id) => api.delete(`/admin/tests/${id}`),
  toggleTestStatus: (id) => api.patch(`/admin/tests/${id}/toggle-status`),
};
