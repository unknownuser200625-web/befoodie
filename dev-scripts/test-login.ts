import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testLogin() {
    console.log('Testing Login API...');

    // 1. Test Owner Login
    console.log('--- Owner Login ---');
    try {
        const res = await fetch('http://localhost:3000/r/demo/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                role: 'owner',
                password: 'demo@123'
            })
        });

        const data = await res.json();
        console.log(`Status: ${res.status}`);
        console.log('Response:', data);

        if (res.status === 200 && data.success) {
            console.log('✅ Owner Login Success');
        } else {
            console.error('❌ Owner Login Failed');
        }
    } catch (e) {
        if (e instanceof Error) {
            console.error('Owner Login Error:', e.message);
        } else {
            console.error('Owner Login Error:', e);
        }
    }

    // 2. Test Staff Login
    console.log('\n--- Staff Login ---');
    try {
        const res = await fetch('http://localhost:3000/r/demo/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                role: 'staff',
                pin: '1234'
            })
        });

        const data = await res.json();
        console.log(`Status: ${res.status}`);
        console.log('Response:', data);

        if (res.status === 200 && data.success) {
            console.log('✅ Staff Login Success');
        } else {
            console.error('❌ Staff Login Failed');
        }
    } catch (e) {
        if (e instanceof Error) {
            console.error('Staff Login Error:', e.message);
        } else {
            console.error('Staff Login Error:', e);
        }
    }
}

testLogin();
