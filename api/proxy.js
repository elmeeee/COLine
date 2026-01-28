// Vercel Serverless Function (Node.js 18+ Native Fetch)

export const config = {
    runtime: 'edge', // Use Edge Runtime for speed & native fetch
};

export default async function handler(req) {
    // CORS Headers
    const corsHeaders = {
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
        'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    };

    // Handle OPTIONS
    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const url = new URL(req.url);
        const searchParams = new URLSearchParams(url.search);

        // Get 'path' from query params (injected by vercel.json rewrites)
        const pathParam = searchParams.get('path');

        if (!pathParam) {
            return new Response(JSON.stringify({ error: 'Missing path parameter' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
        }

        // Prepare target URL
        const targetUrl = `https://api-partner.krl.co.id/krl-webs/v1/${pathParam}`;

        // Forward other query params
        searchParams.delete('path'); // Remove our routing param
        const externalUrl = new URL(targetUrl);
        searchParams.forEach((value, key) => externalUrl.searchParams.append(key, value));

        // Fetch from KRL API
        const response = await fetch(externalUrl.toString(), {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                // Hardcoded Credentials
                'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzIiwianRpIjoiYmE0Yzc4MzE4ODNjYTI0N2YzMTBkMTJhYzc3ZjE5ZTdjMTVkNjgxOTk2ODM0MDc0MGM3MzliYmRjNGQ3YTI5MzczYzMyNWM2NDFiZjgxYzciLCJpYXQiOjE3NTQ0NTkxMjYsIm5iZiI6MTc1NDQ1OTEyNiwiZXhwIjoxNzg1OTk1MTI2LCJzdWIiOiI1Iiwic2NvcGVzIjpbXX0.zPA0IDAN3NycMKa6DaOdRmkcFz1oUTX1dkxEp3MLBlhibTQI0L0WB9mY-pUlQW5vQj8ktOdo-rRvrjxiXaHFqLQM6ebONbqTg8V0AjBXwrkBjLZDCE4dop9iZyDXcG2b9XTLCgPgpOBbduW_Dy0-bIkJOOIgIzl9mEEUVQf3T6G_zA796SGJ6rtLqfBK-sMnhOV4eZSqQIXIrxPyCJ8SA893p-29PFxfQfcbXW_6cYBFhDzyiilhJ6xQd6znN2eWOL4MPAxYeS2ZGnaZ7ijUN91MAyPnV0dQU7loVtS1jt2HlM5oMSsE2Zoz6FP31GvG6f7o_MWogEp0ZMOus50bVly3II8Rjjc4IGgswbw0h-RS0Ipo3f2QmXp4GfhRNUoTyqq-7oiCIDPUJcdg39lSIy9Fz7-ECNfbjEiH60V3GyftuiFGrayMoE7XeWaC9wQZo3fLHhI1aPgbXXsP-rqWLFf2km4zdG5Y5CYpUNb_Z11VOU6aaFCdRtoC6e7VcxHxLwCBT22wluNpbfFtEQSYDQE1JlegijvFmnRHTM88n-zp7sWhuCWVX6oE0ULdy51SR4iOqpYOA4B1ZymmYrQz1kBxSA_52lnTBlU9gfWkUiFX8GLSh7wQ8a4dVMYoJj6t1VCJt9-d30jn4S3tXsim_3wpp71RE9SSazV35j8o7do',
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15'
            }
        });

        const data = await response.json();

        return new Response(JSON.stringify(data), {
            status: response.status,
            headers: {
                'Content-Type': 'application/json',
                ...corsHeaders
            }
        });

    } catch (error) {
        return new Response(JSON.stringify({
            error: 'Proxy Error',
            details: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
    }
}
