// ============================================
// AUTH & USER TYPES
// ============================================
export type UserRole = 'ADMIN' | 'STAFF' | 'DOCTOR' | 'PATIENT';

export interface User {
    id: number;
    email: string;
    password_hash: string;
    role: UserRole;
    is_active: boolean;
    last_login_at: Date | null;
    created_at: Date;
    updated_at: Date;
}

export interface JWTPayload {
    userId: number;
    email: string;
    role: UserRole;
}

export interface AuthRequest {
    email: string;
    password: string;
}

// ============================================
// PATIENT TYPES
// ============================================
export interface Patient {
    id: number;
    user_id: number | null;
    hospital_mrn: string;
    first_name: string;
    last_name: string;
    dob: Date;
    gender: 'M' | 'F' | 'Other';
    phone: string;
    email: string | null;
    address: string | null;
    blood_group: string | null;
    emergency_name: string | null;
    emergency_phone: string | null;
    created_by: number | null;
    created_at: Date;
    updated_at: Date;
}

// ============================================
// DOCTOR TYPES
// ============================================
export interface Doctor {
    id: number;
    user_id: number;
    registration_no: string;
    specialization: string;
    department_id: number | null;
    consult_fee: number;
    experience_years: number | null;
    signature_url: string | null;
    created_at: Date;
    updated_at: Date;
}

// ============================================
// STAFF TYPES
// ============================================
export type StaffType = 'RECEPTIONIST' | 'NURSE' | 'LAB_TECHNICIAN' | 'ADMIN';

export interface Staff {
    id: number;
    user_id: number;
    staff_type: StaffType;
    department_id: number | null;
    created_at: Date;
    updated_at: Date;
}

// ============================================
// DEPARTMENT TYPES
// ============================================
export interface Department {
    id: number;
    name: string;
    code: string;
    floor: string | null;
    created_at: Date;
}

// ============================================
// APPOINTMENT TYPES
// ============================================
export type VisitType = 'OPD' | 'FOLLOW_UP' | 'EMERGENCY';
export type AppointmentStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export interface Appointment {
    id: number;
    patient_id: number;
    doctor_id: number;
    scheduled_datetime: Date;
    visit_type: VisitType;
    status: AppointmentStatus;
    reason: string | null;
    created_by: number | null;
    created_at: Date;
    updated_at: Date;
}

// ============================================
// PRECHECK (VITALS) TYPES
// ============================================
export interface Precheck {
    id: number;
    appointment_id: number;
    recorded_by: number;
    height_cm: number | null;
    weight_kg: number | null;
    temperature_c: number | null;
    pulse_rate: number | null;
    systolic_bp: number | null;
    diastolic_bp: number | null;
    spo2: number | null;
    notes: string | null;
    created_at: Date;
}

// ============================================
// VISIT TYPES
// ============================================
export type VisitTypeIPD = 'OPD' | 'IPD';
export type VisitStatus = 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Visit {
    id: number;
    patient_id: number;
    doctor_id: number;
    appointment_id: number | null;
    visit_type: VisitTypeIPD;
    visit_started_at: Date;
    visit_ended_at: Date | null;
    chief_complaint: string | null;
    notes_soap: string | null;
    status: VisitStatus;
    created_at: Date;
    updated_at: Date;
}

// ============================================
// DIAGNOSIS TYPES
// ============================================
export interface Diagnosis {
    id: number;
    visit_id: number;
    code: string;
    description: string;
    is_primary: boolean;
    created_at: Date;
}

// ============================================
// TOOTH NODE TYPES
// ============================================
export interface ToothNode {
    id: number;
    appointment_id: number;
    tooth_number: string;
    surface: string | null;
    status: string | null;
    created_by: number | null;
    created_at: Date;
}

// ============================================
// CLINICAL FINDINGS TYPES
// ============================================
export interface ClinicalFinding {
    id: number;
    appointment_id: number;
    doctor_id: number;
    summary: string;
    detailed_notes: string | null;
    created_at: Date;
}

// ============================================
// LAB TEST TYPES
// ============================================
export interface LabTestMaster {
    id: number;
    code: string;
    name: string;
    category: string | null;
    default_price: number;
    created_at: Date;
}

export type LabOrderStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type LabItemStatus = 'PENDING' | 'REPORTED' | 'VERIFIED' | 'CANCELLED';

export interface LabTestOrder {
    id: number;
    appointment_id: number | null;
    patient_id: number;
    doctor_id: number;
    status: LabOrderStatus;
    notes: string | null;
    created_at: Date;
    updated_at: Date;
}

export interface LabTestOrderItem {
    id: number;
    order_id: number;
    test_id: number;
    assigned_lab_tech_id: number | null;
    report_verified_by: number | null;
    result_value: string | null;
    unit: string | null;
    ref_range: string | null;
    result_flag: string | null;
    status: LabItemStatus;
    reported_at: Date | null;
    created_at: Date;
    updated_at: Date;
}

// ============================================
// PROCEDURE & MATERIAL TYPES
// ============================================
export interface ProcedureMaster {
    id: number;
    code: string;
    name: string;
    category: string | null;
    default_duration_minutes: number | null;
    default_cost: number;
    created_at: Date;
}

export interface MaterialMaster {
    id: number;
    name: string;
    unit: string;
    stock_qty: number;
    unit_cost: number;
    reorder_level: number | null;
    created_at: Date;
    updated_at: Date;
}

// ============================================
// TREATMENT PLAN TYPES
// ============================================
export type TreatmentPlanStatus = 'DRAFT' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type ProcedureStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface TreatmentPlan {
    id: number;
    patient_id: number;
    appointment_id: number | null;
    doctor_id: number;
    plan_name: string;
    status: TreatmentPlanStatus;
    total_estimated_cost: number | null;
    created_at: Date;
    updated_at: Date;
}

export interface TreatmentPlanProcedure {
    id: number;
    treatment_plan_id: number;
    procedure_id: number;
    tooth_node_id: number | null;
    custom_notes: string | null;
    min_duration_minutes: number | null;
    estimated_cost: number | null;
    priority: Priority;
    scheduled_datetime: Date | null;
    status: ProcedureStatus;
    created_at: Date;
}

export interface TreatmentProcedureMaterial {
    id: number;
    treatment_plan_procedure_id: number;
    material_id: number;
    quantity: number;
    unit_cost: number;
    total_cost: number;
    created_at: Date;
}

// ============================================
// WARD & BED TYPES
// ============================================
export type WardType = 'GENERAL' | 'SEMI_PRIVATE' | 'PRIVATE';
export type BedStatus = 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'RESERVED';

export interface Ward {
    id: number;
    name: string;
    ward_type: WardType;
    floor: string | null;
    total_beds: number;
    created_at: Date;
}

export interface Bed {
    id: number;
    ward_id: number;
    bed_number: string;
    status: BedStatus;
    created_at: Date;
    updated_at: Date;
}

// ============================================
// ADMISSION TYPES
// ============================================
export type AdmissionStatus = 'ACTIVE' | 'DISCHARGED' | 'TRANSFERRED';

export interface Admission {
    id: number;
    patient_id: number;
    doctor_id: number;
    visit_id: number | null;
    bed_id: number;
    admission_date: Date;
    discharge_date: Date | null;
    admission_reason: string | null;
    status: AdmissionStatus;
    created_at: Date;
    updated_at: Date;
}

// ============================================
// INVOICE TYPES
// ============================================
export type InvoiceStatus = 'UNPAID' | 'PARTIAL' | 'PAID';

export interface Invoice {
    id: number;
    patient_id: number;
    treatment_plan_id: number | null;
    total_amount: number;
    paid_amount: number;
    status: InvoiceStatus;
    created_at: Date;
    updated_at: Date;
}

export interface InvoiceItem {
    id: number;
    invoice_id: number;
    treatment_plan_procedure_id: number | null;
    description: string;
    quantity: number;
    unit_price: number;
    amount: number;
    created_at: Date;
}

// ============================================
// AI TYPES
// ============================================
export interface AIContextSnapshot {
    id: number;
    patient_id: number;
    visit_id: number | null;
    doctor_id: number;
    context_json: Record<string, any>;
    created_at: Date;
}

export interface AISession {
    id: number;
    doctor_id: number;
    patient_id: number;
    visit_id: number | null;
    last_context_id: number | null;
    started_at: Date;
    ended_at: Date | null;
    created_at: Date;
}

export interface AIMessage {
    id: number;
    ai_session_id: number;
    sender_type: 'DOCTOR' | 'AI';
    question_text: string;
    response_json: Record<string, any> | null;
    created_at: Date;
}

// ============================================
// API RESPONSE TYPES
// ============================================
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string | { code: string; message: string; details?: any };
    message?: string;
    pagination?: {
        total: number;
        page: number;
        limit: number;
    };
}
