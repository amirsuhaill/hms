// Simple test to verify backend is working
const API_BASE_URL = 'http://localhost:3001';

async function testBackend() {
    console.log('Testing backend connection...');
    
    try {
        // Test health endpoint
        const healthResponse = await fetch(`${API_BASE_URL}/health`);
        const healthData = await healthResponse.json();
        console.log('✅ Health check:', healthData);
        
        // Test lab tests master endpoint (should require auth)
        const labTestsResponse = await fetch(`${API_BASE_URL}/api/lab-tests/master`);
        console.log('Lab tests response status:', labTestsResponse.status);
        
        if (labTestsResponse.status === 401) {
            console.log('✅ Lab tests endpoint exists (requires auth)');
        } else {
            const labTestsData = await labTestsResponse.json();
            console.log('Lab tests data:', labTestsData);
        }
        
        // Test treatment plans endpoint (should require auth)
        const treatmentPlansResponse = await fetch(`${API_BASE_URL}/api/treatment-plans`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        });
        console.log('Treatment plans response status:', treatmentPlansResponse.status);
        
        if (treatmentPlansResponse.status === 401) {
            console.log('✅ Treatment plans endpoint exists (requires auth)');
        } else {
            const treatmentPlansData = await treatmentPlansResponse.json();
            console.log('Treatment plans data:', treatmentPlansData);
        }
        
    } catch (error) {
        console.error('❌ Backend test failed:', error.message);
        console.log('Make sure the backend is running on port 3001');
        console.log('Run: cd backend && npm run dev');
    }
}

testBackend();