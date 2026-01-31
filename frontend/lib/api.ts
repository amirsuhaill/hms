/**
 * API Client for HMS Backend
 * Handles all API requests with proper error handling and authentication
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    pagination?: {
        total: number;
        page: number;
        limit: number;
    };
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    user: {
        id: number;
        email: string;
        role: 'ADMIN' | 'DOCTOR' | 'STAFF' | 'PATIENT';
        is_active: boolean;
    };
}

/**
 * Get stored authentication token from localStorage
 */
export const getAuthToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('authToken');
};

/**
 * Store authentication token in localStorage
 */
export const setAuthToken = (token: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('authToken', token);
};

/**
 * Remove authentication token from localStorage
 */
export const removeAuthToken = (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('authToken');
};

/**
 * Get stored user data from localStorage
 */
export const getStoredUser = () => {
    if (typeof window === 'undefined') return null;
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
};

/**
 * Store user data in localStorage
 */
export const setStoredUser = (user: any): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('user', JSON.stringify(user));
};

/**
 * Remove user data from localStorage
 */
export const removeStoredUser = (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('user');
};

/**
 * Generic API request function
 */
async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = getAuthToken();

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    console.log('Making API request to:', url);
    console.log('Headers:', headers);

    try {
        const response = await fetch(url, {
            ...options,
            headers,
        });

        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);

        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error(`Expected JSON response, got ${contentType}`);
        }

        const data = await response.json();
        console.log('Response data:', data);

        if (!response.ok) {
            return {
                success: false,
                error: data.error || data.message || `HTTP ${response.status}: ${response.statusText}`,
            };
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        
        // More specific error handling
        if (error instanceof TypeError && error.message.includes('fetch')) {
            return {
                success: false,
                error: `Cannot connect to server at ${url}. Please check if the backend is running.`,
            };
        }
        
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Network error',
        };
    }
}

/**
 * Authentication API calls
 */
export const authApi = {
    /**
     * Login user with email and password
     */
    login: async (email: string, password: string): Promise<ApiResponse<LoginResponse>> => {
        return apiRequest<LoginResponse>('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    },

    /**
     * Logout user
     */
    logout: async (): Promise<ApiResponse<null>> => {
        return apiRequest<null>('/api/auth/logout', {
            method: 'POST',
        });
    },

    /**
     * Refresh authentication token
     */
    refreshToken: async (): Promise<ApiResponse<{ token: string }>> => {
        return apiRequest<{ token: string }>('/api/auth/refresh-token', {
            method: 'POST',
        });
    },
};

/**
 * Patient API calls
 */
export const patientApi = {
    /**
     * Get all patients
     */
    getAll: async (page = 1, limit = 20): Promise<ApiResponse<any[]>> => {
        return apiRequest<any[]>(`/api/patients?page=${page}&limit=${limit}`, {
            method: 'GET',
        });
    },

    /**
     * Get patient by ID
     */
    getById: async (id: number): Promise<ApiResponse<any>> => {
        return apiRequest<any>(`/api/patients/${id}`, {
            method: 'GET',
        });
    },

    /**
     * Create new patient
     */
    create: async (data: any): Promise<ApiResponse<any>> => {
        return apiRequest<any>('/api/patients', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    /**
     * Update patient by ID
     */
    update: async (id: number, data: any): Promise<ApiResponse<any>> => {
        return apiRequest<any>(`/api/patients/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },
};

/**
 * Doctor API calls
 */
export const doctorApi = {
    /**
     * Get all doctors
     */
    getAll: async (): Promise<ApiResponse<any[]>> => {
        return apiRequest<any[]>('/api/doctors', {
            method: 'GET',
        });
    },

    /**
     * Get doctor by ID
     */
    getById: async (id: number): Promise<ApiResponse<any>> => {
        return apiRequest<any>(`/api/doctors/${id}`, {
            method: 'GET',
        });
    },

    /**
     * Get current doctor profile by user ID
     */
    getCurrentProfile: async (): Promise<ApiResponse<any>> => {
        return apiRequest<any>('/api/doctors/profile', {
            method: 'GET',
        });
    },
};

/**
 * Appointment API calls
 */
export const appointmentApi = {
    /**
     * Get all appointments with optional filters
     */
    getAll: async (page = 1, limit = 10, filters?: any): Promise<ApiResponse<any[]>> => {
        let url = `/api/appointments?page=${page}&limit=${limit}`;
        
        if (filters) {
            if (filters.status) url += `&status=${filters.status}`;
            if (filters.doctor_id) url += `&doctor_id=${filters.doctor_id}`;
            if (filters.visit_type) url += `&visit_type=${filters.visit_type}`;
            if (filters.date_from) url += `&date_from=${filters.date_from}`;
            if (filters.date_to) url += `&date_to=${filters.date_to}`;
        }
        
        return apiRequest<any[]>(url, {
            method: 'GET',
        });
    },

    /**
     * Get appointment by ID
     */
    getById: async (id: number): Promise<ApiResponse<any>> => {
        return apiRequest<any>(`/api/appointments/${id}`, {
            method: 'GET',
        });
    },

    /**
     * Create new appointment
     */
    create: async (data: any): Promise<ApiResponse<any>> => {
        return apiRequest<unknown>('/api/appointments', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    /**
     * Update appointment by ID
     */
    update: async (id: number, data: any): Promise<ApiResponse<any>> => {
        return apiRequest<unknown>(`/api/appointments/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    /**
     * Cancel appointment
     */
    cancel: async (appointmentId: string, reason: string): Promise<ApiResponse<unknown>> => {
        return apiRequest<unknown>(`/api/appointments/${appointmentId}/cancel`, {
            method: 'PUT',
            body: JSON.stringify({ reason }),
        });
    },
};

/**
 * Visit API calls
 */
export const visitApi = {
    /**
     * Create new visit
     */
    create: async (data: any): Promise<ApiResponse<any>> => {
        return apiRequest<any>('/api/visits', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    /**
     * Update visit
     */
    update: async (id: number, data: any): Promise<ApiResponse<any>> => {
        return apiRequest<any>(`/api/visits/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    /**
     * Complete visit
     */
    complete: async (id: number, data: any): Promise<ApiResponse<any>> => {
        return apiRequest<any>(`/api/visits/${id}/complete`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    /**
     * Get visit by ID
     */
    getById: async (id: number): Promise<ApiResponse<any>> => {
        return apiRequest<any>(`/api/visits/${id}`, {
            method: 'GET',
        });
    },

    /**
     * Create precheck/vitals
     */
    createPrecheck: async (data: any): Promise<ApiResponse<any>> => {
        return apiRequest<any>('/api/visits/prechecks', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    /**
     * Get precheck by appointment ID
     */
    getPrecheckByAppointment: async (appointmentId: number): Promise<ApiResponse<any>> => {
        return apiRequest<any>(`/api/visits/prechecks/appointment/${appointmentId}`, {
            method: 'GET',
        });
    },
};

/**
 * Diagnosis API calls
 */
export const diagnosisApi = {
    /**
     * Create diagnosis
     */
    create: async (data: any): Promise<ApiResponse<any>> => {
        return apiRequest<any>('/api/diagnoses', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    /**
     * Get diagnoses for visit
     */
    getByVisit: async (visitId: number): Promise<ApiResponse<any[]>> => {
        return apiRequest<any[]>(`/api/diagnoses/visit/${visitId}`, {
            method: 'GET',
        });
    },

    /**
     * Update diagnosis
     */
    update: async (id: number, data: any): Promise<ApiResponse<any>> => {
        return apiRequest<any>(`/api/diagnoses/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },
};

/**
 * Clinical Findings API calls
 */
export const clinicalFindingApi = {
    /**
     * Create clinical finding
     */
    create: async (data: any): Promise<ApiResponse<any>> => {
        return apiRequest<any>('/api/clinical-findings', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    /**
     * Get clinical findings for appointment
     */
    getByAppointment: async (appointmentId: number): Promise<ApiResponse<any>> => {
        return apiRequest<any>(`/api/clinical-findings/appointment/${appointmentId}`, {
            method: 'GET',
        });
    },

    /**
     * Update clinical finding
     */
    update: async (id: number, data: any): Promise<ApiResponse<any>> => {
        return apiRequest<any>(`/api/clinical-findings/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },
};

/**
 * Treatment Plan API calls
 */
export const treatmentPlanApi = {
    /**
     * Create treatment plan
     */
    create: async (data: any): Promise<ApiResponse<any>> => {
        console.log('Creating treatment plan with data:', data); // Debug log
        return apiRequest<any>('/api/treatment-plans', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    /**
     * Get treatment plans for patient
     */
    getByPatient: async (patientId: number): Promise<ApiResponse<any[]>> => {
        return apiRequest<any[]>(`/api/treatment-plans/patient/${patientId}`, {
            method: 'GET',
        });
    },

    /**
     * Get treatment plans for doctor
     */
    getByDoctor: async (doctorId: number): Promise<ApiResponse<any[]>> => {
        const url = `/api/treatment-plans/doctor/${doctorId}`;
        console.log('Treatment plans API call URL:', url);
        return apiRequest<any[]>(url, {
            method: 'GET',
        });
    },

    /**
     * Get treatment plan by ID
     */
    getById: async (id: number): Promise<ApiResponse<any>> => {
        return apiRequest<any>(`/api/treatment-plans/${id}`, {
            method: 'GET',
        });
    },

    /**
     * Update treatment plan
     */
    update: async (id: number, data: any): Promise<ApiResponse<any>> => {
        return apiRequest<any>(`/api/treatment-plans/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    /**
     * Add procedure to treatment plan
     */
    addProcedure: async (planId: number, data: any): Promise<ApiResponse<any>> => {
        return apiRequest<any>(`/api/treatment-plans/${planId}/procedures`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    /**
     * Get procedures master list
     */
    getProceduresMaster: async (category?: string): Promise<ApiResponse<any[]>> => {
        const url = category 
            ? `/api/treatment-plans/procedures-master?category=${category}`
            : '/api/treatment-plans/procedures-master';
        return apiRequest<any[]>(url, {
            method: 'GET',
        });
    },
};

/**
 * Lab Test API calls
 */
export const labTestApi = {
    /**
     * Get lab tests master list
     */
    getMaster: async (category?: string): Promise<ApiResponse<any[]>> => {
        const url = category 
            ? `/api/lab-tests/master?category=${category}`
            : '/api/lab-tests/master';
        return apiRequest<any[]>(url, {
            method: 'GET',
        });
    },

    /**
     * Create lab test order
     */
    createOrder: async (data: any): Promise<ApiResponse<any>> => {
        console.log('Creating lab order with data:', data); // Debug log
        return apiRequest<any>('/api/lab-tests/orders', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    /**
     * Get lab orders for patient
     */
    getOrdersByPatient: async (patientId: number, status?: string): Promise<ApiResponse<any[]>> => {
        const url = status 
            ? `/api/lab-tests/orders/patient/${patientId}?status=${status}`
            : `/api/lab-tests/orders/patient/${patientId}`;
        return apiRequest<any[]>(url, {
            method: 'GET',
        });
    },

    /**
     * Get lab orders for doctor
     */
    getOrdersByDoctor: async (doctorId: number): Promise<ApiResponse<any[]>> => {
        const url = `/api/lab-tests/orders/doctor/${doctorId}`;
        console.log('Lab orders API call URL:', url);
        return apiRequest<any[]>(url, {
            method: 'GET',
        });
    },

    /**
     * Get lab order by ID
     */
    getOrderById: async (id: number): Promise<ApiResponse<any>> => {
        return apiRequest<any>(`/api/lab-tests/orders/${id}`, {
            method: 'GET',
        });
    },

    /**
     * Update lab test result
     */
    updateResult: async (itemId: number, data: any): Promise<ApiResponse<any>> => {
        return apiRequest<any>(`/api/lab-tests/items/${itemId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },
};

/**
 * Health check
 */
export const healthCheck = async (): Promise<boolean> => {
    try {
        console.log('Checking health at:', `${API_BASE_URL}/health`);
        const response = await fetch(`${API_BASE_URL}/health`);
        console.log('Health check response:', response.status, response.ok);
        return response.ok;
    } catch (error) {
        console.error('Health check failed:', error);
        return false;
    }
};

/**
 * Test API connection
 */
export const testConnection = async (): Promise<{ success: boolean; message: string }> => {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        const data = await response.json();
        
        if (response.ok) {
            return {
                success: true,
                message: `Connected to backend successfully. Server response: ${data.message || 'OK'}`
            };
        } else {
            return {
                success: false,
                message: `Backend responded with error: ${response.status} ${response.statusText}`
            };
        }
    } catch (error) {
        return {
            success: false,
            message: `Cannot connect to backend at ${API_BASE_URL}. Error: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
    }
};

/**
 * Get current doctor profile and ID
 */
export const getCurrentDoctorId = async (): Promise<number | null> => {
    try {
        const response = await doctorApi.getCurrentProfile();
        if (response.success && response.data) {
            return response.data.id;
        }
        return null;
    } catch (error) {
        console.error('Error getting current doctor ID:', error);
        return null;
    }
};