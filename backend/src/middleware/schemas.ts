import Joi from 'joi';

// ============================================
// AUTH SCHEMAS
// ============================================
export const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
});

// ============================================
// USER SCHEMAS
// ============================================
export const createUserSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('ADMIN', 'STAFF', 'DOCTOR', 'PATIENT').required(),
    is_active: Joi.boolean().default(true),
});

export const updateUserSchema = Joi.object({
    email: Joi.string().email(),
    is_active: Joi.boolean(),
}).min(1);

// ============================================
// PATIENT SCHEMAS
// ============================================
export const createPatientSchema = Joi.object({
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    dob: Joi.date().required(),
    gender: Joi.string().valid('M', 'F', 'Other').required(),
    phone: Joi.string().required(),
    email: Joi.string().email(),
    address: Joi.string(),
    blood_group: Joi.string(),
    emergency_name: Joi.string(),
    emergency_phone: Joi.string(),
});

export const updatePatientSchema = Joi.object({
    first_name: Joi.string(),
    last_name: Joi.string(),
    phone: Joi.string(),
    email: Joi.string().email(),
    address: Joi.string(),
    blood_group: Joi.string(),
    emergency_name: Joi.string(),
    emergency_phone: Joi.string(),
}).min(1);

// ============================================
// DOCTOR SCHEMAS
// ============================================
export const createDoctorSchema = Joi.object({
    user_id: Joi.number().required(),
    registration_no: Joi.string().required(),
    specialization: Joi.string().required(),
    department_id: Joi.number(),
    consult_fee: Joi.number().required(),
    experience_years: Joi.number(),
    signature_url: Joi.string(),
});

export const updateDoctorSchema = Joi.object({
    specialization: Joi.string(),
    department_id: Joi.number(),
    consult_fee: Joi.number(),
    experience_years: Joi.number(),
    signature_url: Joi.string(),
}).min(1);

// ============================================
// STAFF SCHEMAS
// ============================================
export const createStaffSchema = Joi.object({
    user_id: Joi.number().required(),
    staff_type: Joi.string().valid('RECEPTIONIST', 'NURSE', 'LAB_TECHNICIAN', 'ADMIN').required(),
    department_id: Joi.number(),
});

export const updateStaffSchema = Joi.object({
    staff_type: Joi.string().valid('RECEPTIONIST', 'NURSE', 'LAB_TECHNICIAN', 'ADMIN'),
    department_id: Joi.number(),
}).min(1);

// ============================================
// DEPARTMENT SCHEMAS
// ============================================
export const createDepartmentSchema = Joi.object({
    name: Joi.string().required(),
    code: Joi.string().required(),
    floor: Joi.string(),
});

export const updateDepartmentSchema = Joi.object({
    name: Joi.string(),
    code: Joi.string(),
    floor: Joi.string(),
}).min(1);

// ============================================
// APPOINTMENT SCHEMAS
// ============================================
export const createAppointmentSchema = Joi.object({
    patient_id: Joi.number().required(),
    doctor_id: Joi.number().required(),
    scheduled_datetime: Joi.date().required(),
    visit_type: Joi.string().valid('OPD', 'FOLLOW_UP', 'EMERGENCY').required(),
    reason: Joi.string(),
});

export const updateAppointmentSchema = Joi.object({
    scheduled_datetime: Joi.date(),
    status: Joi.string().valid('SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'),
    reason: Joi.string(),
}).min(1);

// ============================================
// PRECHECK SCHEMAS
// ============================================
export const createPrecheckSchema = Joi.object({
    appointment_id: Joi.number().required(),
    height_cm: Joi.number(),
    weight_kg: Joi.number(),
    temperature_c: Joi.number(),
    pulse_rate: Joi.number(),
    systolic_bp: Joi.number(),
    diastolic_bp: Joi.number(),
    spo2: Joi.number(),
    notes: Joi.string(),
});

// ============================================
// VISIT SCHEMAS
// ============================================
export const createVisitSchema = Joi.object({
    appointment_id: Joi.number(),
    patient_id: Joi.number().required(),
    doctor_id: Joi.number().required(),
    visit_type: Joi.string().valid('OPD', 'IPD').required(),
    chief_complaint: Joi.string(),
});

export const updateVisitSchema = Joi.object({
    notes_soap: Joi.string(),
    chief_complaint: Joi.string(),
}).min(1);

// ============================================
// DIAGNOSIS SCHEMAS
// ============================================
export const createDiagnosisSchema = Joi.object({
    visit_id: Joi.number().required(),
    code: Joi.string().required(),
    description: Joi.string().required(),
    is_primary: Joi.boolean(),
});

export const updateDiagnosisSchema = Joi.object({
    code: Joi.string(),
    description: Joi.string(),
    is_primary: Joi.boolean(),
}).min(1);

// ============================================
// TOOTH NODE SCHEMAS
// ============================================
export const createToothNodeSchema = Joi.object({
    appointment_id: Joi.number().required(),
    tooth_number: Joi.string().required(),
    surface: Joi.string(),
    status: Joi.string(),
});

export const updateToothNodeSchema = Joi.object({
    surface: Joi.string(),
    status: Joi.string(),
}).min(1);

// ============================================
// CLINICAL FINDINGS SCHEMAS
// ============================================
export const createClinicalFindingSchema = Joi.object({
    appointment_id: Joi.number().required(),
    doctor_id: Joi.number().required(),
    summary: Joi.string().required(),
    detailed_notes: Joi.string(),
});

export const updateClinicalFindingSchema = Joi.object({
    summary: Joi.string(),
    detailed_notes: Joi.string(),
}).min(1);

// ============================================
// LAB TEST SCHEMAS
// ============================================
export const createLabTestMasterSchema = Joi.object({
    code: Joi.string().required(),
    name: Joi.string().required(),
    category: Joi.string(),
    default_price: Joi.number().required(),
});

export const createLabTestOrderSchema = Joi.object({
    appointment_id: Joi.number(),
    patient_id: Joi.number().required(),
    doctor_id: Joi.number().required(),
    notes: Joi.string(),
    test_ids: Joi.array().items(Joi.number()).required(),
});

export const updateLabTestItemSchema = Joi.object({
    result_value: Joi.string(),
    unit: Joi.string(),
    ref_range: Joi.string(),
    result_flag: Joi.string(),
    status: Joi.string().valid('PENDING', 'REPORTED', 'VERIFIED', 'CANCELLED'),
});

// ============================================
// PROCEDURE & MATERIAL SCHEMAS
// ============================================
export const createProcedureMasterSchema = Joi.object({
    code: Joi.string().required(),
    name: Joi.string().required(),
    category: Joi.string(),
    default_duration_minutes: Joi.number(),
    default_cost: Joi.number().required(),
});

export const createMaterialMasterSchema = Joi.object({
    name: Joi.string().required(),
    unit: Joi.string().required(),
    stock_qty: Joi.number().required(),
    unit_cost: Joi.number().required(),
    reorder_level: Joi.number(),
});

export const updateMaterialStockSchema = Joi.object({
    stock_qty: Joi.number().required(),
    adjustment_reason: Joi.string(),
});

// ============================================
// TREATMENT PLAN SCHEMAS
// ============================================
export const createTreatmentPlanSchema = Joi.object({
    patient_id: Joi.number().required(),
    appointment_id: Joi.number(),
    doctor_id: Joi.number().required(),
    plan_name: Joi.string().required(),
    status: Joi.string().valid('DRAFT', 'APPROVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'),
    total_estimated_cost: Joi.number(),
});

export const updateTreatmentPlanSchema = Joi.object({
    plan_name: Joi.string(),
    status: Joi.string().valid('DRAFT', 'APPROVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'),
    total_estimated_cost: Joi.number(),
}).min(1);

export const addProcedureSchema = Joi.object({
    procedure_id: Joi.number().required(),
    tooth_node_id: Joi.number(),
    custom_notes: Joi.string(),
    estimated_cost: Joi.number(),
    priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH'),
    scheduled_datetime: Joi.date(),
});

export const addMaterialSchema = Joi.object({
    material_id: Joi.number().required(),
    quantity: Joi.number().required(),
    unit_cost: Joi.number().required(),
});

// ============================================
// WARD & BED SCHEMAS
// ============================================
export const createWardSchema = Joi.object({
    name: Joi.string().required(),
    ward_type: Joi.string().valid('GENERAL', 'SEMI_PRIVATE', 'PRIVATE').required(),
    floor: Joi.string(),
    total_beds: Joi.number().required(),
});

export const createBedsSchema = Joi.object({
    bed_numbers: Joi.array().items(Joi.string()).required(),
});

// ============================================
// ADMISSION SCHEMAS
// ============================================
export const createAdmissionSchema = Joi.object({
    patient_id: Joi.number().required(),
    doctor_id: Joi.number().required(),
    visit_id: Joi.number(),
    bed_id: Joi.number().required(),
    admission_reason: Joi.string(),
});

export const dischargePatientSchema = Joi.object({
    discharge_summary: Joi.string(),
});

// ============================================
// INVOICE SCHEMAS
// ============================================
export const createInvoiceSchema = Joi.object({
    patient_id: Joi.number().required(),
    treatment_plan_id: Joi.number(),
});

export const recordPaymentSchema = Joi.object({
    amount_paid: Joi.number().required(),
    payment_method: Joi.string(),
    notes: Joi.string(),
});

// ============================================
// AI SCHEMAS
// ============================================
export const createAIContextSchema = Joi.object({
    patient_id: Joi.number().required(),
    visit_id: Joi.number(),
    doctor_id: Joi.number().required(),
    context_json: Joi.object().required(),
});

export const createAISessionSchema = Joi.object({
    doctor_id: Joi.number().required(),
    patient_id: Joi.number().required(),
    visit_id: Joi.number(),
    last_context_id: Joi.number(),
});

export const sendAIMessageSchema = Joi.object({
    question_text: Joi.string().required(),
    sender_type: Joi.string().valid('DOCTOR', 'AI').required(),
});
