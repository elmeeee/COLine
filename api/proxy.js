// Vercel Serverless Function (Node.js)
import https from 'https';

// Create an agent that ignores SSL certificate errors
// This is often needed for some enterprise/government APIs
const agent = new https.Agent({
    rejectUnauthorized: false
});

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', '*');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        const { path } = req.query;

        if (!path) {
            return res.status(400).json({ error: 'Missing path parameter' });
        }

        const queryParams = new URLSearchParams(req.query);
        queryParams.delete('path');

        const pathStr = Array.isArray(path) ? path.join('/') : path;
        const targetUrl = `https://api-partner.krl.co.id/krl-webs/v1/${pathStr}?${queryParams.toString()}`;

        // console.log('Proxying to (insecure):', targetUrl);

        // Use built-in fetch with the custom dispatcher/agent is tricky in Node 18 globals.
        // Instead, let's use the 'https' module directly or add the 'duplex' option if usually stream.
        // Actually, for Node 18+, we can pass { dispatcher } to fetch if using undici, but global fetch is simpler.
        // Global fetch in Node doesn't easily accept https agent.

        // Let's use the old reliable 'axios' again but with the custom agent.
        // We confirmed axios is installed.
        // Axios is easier to configure with https agent.

        // Dynamic import axios to ensure it works in ESM context
        const axios = (await import('axios')).default;

        const response = await axios.get(targetUrl, {
            httpsAgent: agent, // BYPASS SSL ERRORS
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzIiwianRpIjoiYmE0Yzc4MzE4ODNjYTI0N2YzMTBkMTJhYzc3ZjE5ZTdjMTVkNjgxOTk2ODM0MDc0MGM3MzliYmRjNGQ3YTI5MzczYzMyNWM2NDFiZjgxYzciLCJpYXQiOjE3NTQ0NTkxMjYsIm5iZiI6MTc1NDQ1OTEyNiwiZXhwIjoxNzg1OTk1MTI2LCJzdWIiOiI1Iiwic2NvcGVzIjpbXX0.zPA0IDAN3NycMKa6DaOdRmkcFz1oUTX1dkxEp3MLBlhibTQI0L0WB9mY-pUlQW5vQj8ktOdo-rRvrjxiXaHFqLQM6ebONbqTg8V0AjBXwrkBjLZDCE4dop9iZyDXcG2b9XTLCgPgpOBbduW_Dy0-bIkJOOIgIzl9mEEUVQf3T6G_zA796SGJ6rtLqfBK-sMnhOV4eZSqQIXIrxPyCJ8SA893p-29PFxfQfcbXW_6cYBFhDzyiilhJ6xQd6znN2eWOL4MPAxYeS2ZGnaZ7ijUN91MAyPnV0dQU7loVtS1jt2HlM5oMSsE2Zoz6FP31GvG6f7o_MWogEp0ZMOus50bVly3II8Rjjc4IGgswbw0h-RS0Ipo3f2QmXp4GfhRNUoTyqq-7oiCIDPUJcdg39lSIy9Fz7-ECNfbjEiH60V3GyftuiFGrayMoE7XeWaC9wQZo3fLHhI1aPgbXXsP-rqWLFf2km4zdG5Y5CYpUNb_Z11VOU6aaFCdRtoC6e7VcxHxLwCBT22wluNpbfFtEQSYDQE1JlegijvFmnRHTM88n-zp7sWhuCWVX6oE0ULdy51SR4iOqpYOA4B1ZymmYrQz1kBxSA_52lnTBlU9gfWkUiFX8GLSh7wQ8a4dVMYoJj6t1VCJt9-d30jn4S3tXsim_3wpp71RE9SSazV35j8o7do',
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15'
            }
        });

        res.status(200).json(response.data);

    } catch (error) {
        console.error('Proxy Error:', error.message);
        const status = error.response?.status || 500;
        const data = error.response?.data || { message: error.message, stack: error.stack };
        res.status(status).json({ error: 'Proxy Error', details: data });
    }
}
