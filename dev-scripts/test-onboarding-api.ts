import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testOnboarding() {
    console.log('Testing Onboarding API...');

    const uniqueSlug = `test-rest-${Date.now()}`;
    const payload = {
        name: `Test Restaurant ${Date.now()}`,
        slug: uniqueSlug,
        password: 'securePassword123!',
        pin: '9999',
        email: 'test@example.com' // Optional but passed
    };

    try {
        const res = await fetch('http://localhost:3000/api/platform/create-restaurant', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        console.log(`Status: ${res.status}`);

        if (res.status === 200 && data.success) {
            console.log('✅ Restaurant Creation Success');
            console.log(`Slug: ${data.restaurant.slug}`);
            console.log(`ID: ${data.restaurant.id}`);
        } else {
            console.error('❌ Restaurant Creation Failed');
            console.error('Error:', data);
        }

    } catch (e) {
        if (e instanceof Error) {
            console.error('API Error:', e.message);
        } else {
            console.error('API Error:', e);
        }
    }
}

testOnboarding();
