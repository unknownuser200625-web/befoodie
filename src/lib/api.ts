export async function safeFetch(url: string, options: RequestInit = {}) {
    try {
        const response = await fetch(url, options);

        // Check content type
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error(`API Error: Expected JSON but got ${contentType}`, text.substring(0, 100));
            return {
                ok: false,
                status: response.status,
                error: `Server error (${response.status}). Please contact support.`
            };
        }

        const data = await response.json();

        return {
            ok: response.ok,
            status: response.status,
            data
        };
    } catch (error) {
        console.error('Network/Fetch Error:', error);
        return {
            ok: false,
            status: 0,
            error: "Connection lost. Please check your internet."
        };
    }
}
