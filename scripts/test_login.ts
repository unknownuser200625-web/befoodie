
async function testLogin() {
    const url = 'http://localhost:3000/r/demo/api/auth/login';
    const payload = {
        role: 'owner',
        password: 'demo@123'
    };

    console.log(`[TEST] POST ${url}`);

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        console.log(`[RESPONSE] Status: ${res.status}`);
        console.log(`[RESPONSE] Body: ${JSON.stringify(data, null, 2)}`);

        if (res.ok && data.success) {
            console.log('--- LOGIN TEST: SUCCESS ---');
        } else {
            console.log('--- LOGIN TEST: FAILED ---');
        }
    } catch (err) {
        console.error('[ERROR] Fetch failed:', err);
    }
}

testLogin();
