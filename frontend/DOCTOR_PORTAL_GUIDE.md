# Doctor Portal Implementation Guide

## Database Schema Alignment

### Key Tables Used:

1. **appointments** - Stores appointment records
   - Columns: id, patient_id, doctor_id, scheduled_datetime, visit_type, status, reason, created_at, updated_at

2. **visits** - Stores patient visit records
   - Columns: id, patient_id, doctor_id, appointment_id, visit_type, visit_started_at, visit_ended_at, chief_complaint, notes_soap, status, created_at, updated_at

3. **diagnoses** - Stores diagnosis records
   - Columns: id, visit_id, code, description, is_primary, created_at

4. **clinical_findings** - Stores clinical observations
   - Columns: id, appointment_id, doctor_id, summary, detailed_notes, created_at

5. **treatment_plans** - Stores treatment plans
   - Columns: id, patient_id, appointment_id, doctor_id, plan_name, status, total_estimated_cost, created_at, updated_at

6. **treatment_plan_procedures** - Stores procedures in a treatment plan
   - Columns: id, treatment_plan_id, procedure_id, tooth_node_id, custom_notes, min_duration_minutes, estimated_cost, priority, scheduled_datetime, status, created_at

7. **procedures_master** - Master list of procedures
   - Columns: id, code, name, category, default_duration_minutes, default_cost, created_at

8. **lab_test_orders** - Stores lab test orders
   - Columns: id, appointment_id, patient_id, doctor_id, status, notes, created_at, updated_at

9. **lab_test_order_items** - Individual tests in an order
   - Columns: id, order_id, test_id, assigned_lab_tech_id, report_verified_by, result_value, unit, ref_range, result_flag, status, reported_at, created_at, updated_at

10. **lab_tests_master** - Master list of lab tests
    - Columns: id, code, name, category, default_price, created_at

11. **prechecks** - Vital signs recorded before visit
    - Columns: id, appointment_id, recorded_by, height_cm, weight_kg, temperature_c, pulse_rate, systolic_bp, diastolic_bp, spo2, notes, created_at

## API Endpoints

### Visits
- `POST /api/visits` - Create a new visit
- `PUT /api/visits/:id` - Update visit
- `PUT /api/visits/:id/complete` - Complete visit
- `GET /api/visits/:id` - Get visit details
- `POST /api/visits/prechecks` - Record vitals
- `GET /api/visits/prechecks/appointment/:appointment_id` - Get latest vitals

### Diagnoses
- `POST /api/diagnoses` - Add diagnosis
- `GET /api/diagnoses/visit/:visit_id` - Get diagnoses for visit
- `PUT /api/diagnoses/:id` - Update diagnosis

### Clinical Findings
- `POST /api/clinical-findings` - Add clinical findings
- `GET /api/clinical-findings/appointment/:appointment_id` - Get findings
- `PUT /api/clinical-findings/:id` - Update findings

### Treatment Plans
- `POST /api/treatment-plans` - Create treatment plan
- `GET /api/treatment-plans/:id` - Get plan details
- `PUT /api/treatment-plans/:id` - Update plan
- `POST /api/treatment-plans/:id/procedures` - Add procedure
- `GET /api/treatment-plans/procedures-master` - Get procedures list
- `GET /api/treatment-plans/materials-master` - Get materials list

### Lab Tests
- `POST /api/lab-tests/orders` - Create lab order
- `GET /api/lab-tests/orders/:id` - Get order details
- `GET /api/lab-tests/orders/patient/:patient_id` - Get patient's orders
- `GET /api/lab-tests/master` - Get available tests
- `PUT /api/lab-tests/items/:id` - Update test result

## Frontend Pages

### 1. Doctor Dashboard (`/doctor/dashboard`)
- Shows today's appointments
- Displays pending visits count
- Quick action buttons for starting visits, treatment plans, lab orders

### 2. Visits (`/doctor/visits`)
- Lists all appointments for the doctor
- Filter by status and date
- Quick start visit button

### 3. Visit Screen (`/doctor/visits/[id]`)
- **Left Panel**: Patient summary with vitals
- **Right Panel**: Chief complaint, clinical findings, diagnosis, SOAP notes
- Tabs for different sections
- Connected to backend APIs for saving data

### 4. Treatment Plans (`/doctor/treatment-plans`)
- Create new treatment plans
- List all treatment plans
- Filter by status

### 5. Treatment Plan Detail (`/doctor/treatment-plans/[id]`)
- Add procedures from master list
- View procedures with costs
- Edit procedure details

### 6. Lab Orders (`/doctor/lab-orders`)
- Create new lab orders
- Select multiple tests
- View order status

### 7. Lab Order Detail (`/doctor/lab-orders/[id]`)
- View test results
- See result flags and reference ranges
- Print results

## Important Notes

1. **Doctor ID**: Always use `user?.id` from localStorage for doctor_id, not from appointment data
2. **Route Ordering**: In backend, specific routes must come before generic `:id` routes
3. **Data Fetching**: Always check response.success before using response.data
4. **Error Handling**: Use toast notifications for user feedback
5. **Loading States**: Show loading spinner while fetching data

## Common Issues & Solutions

### Issue: Treatment plan procedures not loading
**Solution**: Ensure the GET route for `/procedures-master` comes before the `/:id` route in the backend

### Issue: Doctor ID mismatch
**Solution**: Always use `getStoredUser()?.id` for the current doctor, not from appointment data

### Issue: Lab tests not showing
**Solution**: Ensure lab_tests_master table has data and the GET /api/lab-tests/master endpoint is working

### Issue: Vitals not displaying
**Solution**: Check that prechecks table has data for the appointment and the endpoint returns it correctly
