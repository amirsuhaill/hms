const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:3001';

async function testTreatmentPlansAPI() {
    console.log('=== TREATMENT PLANS API TEST ===\n');

    try {
        // First, login to get a token
        console.log('1. Logging in...');
        const loginResponse = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'doctor@example.com', // Update with actual doctor email
                password: 'password123' // Update with actual password
            })
        });
        
        const loginData = await loginResponse.json();
        console.log('Login result:', loginData.success ? 'SUCCESS' : 'FAILED');
        
        if (!loginData.success) {
            console.error('Login failed:', loginData.error);
            return;
        }

        const token = loginData.data.token;
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        // Get doctor profile
        console.log('\n2. Getting doctor profile...');
        const profileResponse = await fetch(`${API_BASE_URL}/api/doctors/profile`, { headers });
        const profileData = await profileResponse.json();
        
        if (!profileData.success) {
            console.error('Failed to get doctor profile:', profileData.error);
            return;
        }

        const doctorId = profileData.data.id;
        console.log('Doctor ID:', doctorId);

        // Test 1: Get all treatment plans for doctor (no filters)
        console.log('\n3. Getting all treatment plans (no filters)...');
        const allPlansResponse = await fetch(`${API_BASE_URL}/api/treatment-plans/doctor/${doctorId}`, { headers });
        const allPlansData = await allPlansResponse.json();
        
        console.log('All plans result:', allPlansData.success ? 'SUCCESS' : 'FAILED');
        if (allPlansData.success) {
            console.log('Total plans found:', allPlansData.data.length);
            allPlansData.data.forEach((plan, index) => {
                console.log(`  Plan ${index + 1}: "${plan.plan_name}" - Status: ${plan.status} - Patient: ${plan.patient_name}`);
            });
        } else {
            console.error('Error:', allPlansData.error);
        }

        // Test 2: Filter by status = CANCELLED
        console.log('\n4. Filtering by status = CANCELLED...');
        const cancelledResponse = await fetch(`${API_BASE_URL}/api/treatment-plans/doctor/${doctorId}?status=CANCELLED`, { headers });
        const cancelledData = await cancelledResponse.json();
        
        console.log('Cancelled plans result:', cancelledData.success ? 'SUCCESS' : 'FAILED');
        if (cancelledData.success) {
            console.log('Cancelled plans found:', cancelledData.data.length);
            cancelledData.data.forEach((plan, index) => {
                console.log(`  Plan ${index + 1}: "${plan.plan_name}" - Status: ${plan.status} - Patient: ${plan.patient_name}`);
            });
        } else {
            console.error('Error:', cancelledData.error);
        }

        // Test 3: Get all patients to find Adba Akhtar's ID
        console.log('\n5. Getting all patients to find Adba Akhtar...');
        const patientsResponse = await fetch(`${API_BASE_URL}/api/patients?page=1&limit=100`, { headers });
        const patientsData = await patientsResponse.json();
        
        if (patientsData.success) {
            const adbaPatient = patientsData.data.find(p => 
                p.first_name.toLowerCase().includes('adba') || 
                p.last_name.toLowerCase().includes('akhtar')
            );
            
            if (adbaPatient) {
                console.log('Found Adba Akhtar:', adbaPatient.id, `${adbaPatient.first_name} ${adbaPatient.last_name}`);
                
                // Test 4: Filter by patient ID
                console.log('\n6. Filtering by Adba Akhtar patient ID...');
                const patientPlansResponse = await fetch(`${API_BASE_URL}/api/treatment-plans/doctor/${doctorId}?patient_id=${adbaPatient.id}`, { headers });
                const patientPlansData = await patientPlansResponse.json();
                
                console.log('Adba Akhtar plans result:', patientPlansData.success ? 'SUCCESS' : 'FAILED');
                if (patientPlansData.success) {
                    console.log('Plans for Adba Akhtar:', patientPlansData.data.length);
                    patientPlansData.data.forEach((plan, index) => {
                        console.log(`  Plan ${index + 1}: "${plan.plan_name}" - Status: ${plan.status}`);
                    });
                } else {
                    console.error('Error:', patientPlansData.error);
                }

                // Test 5: Filter by both status and patient
                console.log('\n7. Filtering by CANCELLED status AND Adba Akhtar...');
                const combinedResponse = await fetch(`${API_BASE_URL}/api/treatment-plans/doctor/${doctorId}?status=CANCELLED&patient_id=${adbaPatient.id}`, { headers });
                const combinedData = await combinedResponse.json();
                
                console.log('Combined filter result:', combinedData.success ? 'SUCCESS' : 'FAILED');
                if (combinedData.success) {
                    console.log('Plans matching both filters:', combinedData.data.length);
                    combinedData.data.forEach((plan, index) => {
                        console.log(`  Plan ${index + 1}: "${plan.plan_name}" - Status: ${plan.status} - Patient: ${plan.patient_name}`);
                    });
                } else {
                    console.error('Error:', combinedData.error);
                }
            } else {
                console.log('Adba Akhtar not found in patients list');
                console.log('Available patients:');
                patientsData.data.slice(0, 10).forEach(p => {
                    console.log(`  ${p.first_name} ${p.last_name} (ID: ${p.id})`);
                });
            }
        }

    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

testTreatmentPlansAPI();