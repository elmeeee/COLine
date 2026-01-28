import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import https from 'https';

// Konfigurasi __dirname untuk ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());
app.use(express.json());

// HTTPS Agent untuk bypass SSL Error (Solusi ampuh untuk API KRL)
const agent = new https.Agent({
    rejectUnauthorized: false
});

// API Proxy Endpoint
// Menangkap request ke /api/krl-webs/v1/...
app.get('/api/krl-webs/v1/*', async (req, res) => {
    try {
        // Ambil path setelah /api/krl-webs/v1/
        const apiPath = req.params[0];

        // Construct URL target
        const targetUrl = `https://api-partner.krl.co.id/krl-webs/v1/${apiPath}`;

        // Log untuk debugging di Railway console
        console.log(`[Proxy] Forwarding to: ${targetUrl}`);

        // Request ke KRL Server
        const response = await axios.get(targetUrl, {
            params: req.query, // Teruskan query params
            httpsAgent: agent, // BYPASS SSL validation
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                // Header Authorization Hardcoded (Bypass Client Security)
                'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzIiwianRpIjoiYmE0Yzc4MzE4ODNjYTI0N2YzMTBkMTJhYzc3ZjE5ZTdjMTVkNjgxOTk2ODM0MDc0MGM3MzliYmRjNGQ3YTI5MzczYzMyNWM2NDFiZjgxYzciLCJpYXQiOjE3NTQ0NTkxMjYsIm5iZiI6MTc1NDQ1OTEyNiwiZXhwIjoxNzg1OTk1MTI2LCJzdWIiOiI1Iiwic2NvcGVzIjpbXX0.zPA0IDAN3NycMKa6DaOdRmkcFz1oUTX1dkxEp3MLBlhibTQI0L0WB9mY-pUlQW5vQj8ktOdo-rRvrjxiXaHFqLQM6ebONbqTg8V0AjBXwrkBjLZDCE4dop9iZyDXcG2b9XTLCgPgpOBbduW_Dy0-bIkJOOIgIzl9mEEUVQf3T6G_zA796SGJ6rtLqfBK-sMnhOV4eZSqQIXIrxPyCJ8SA893p-29PFxfQfcbXW_6cYBFhDzyiilhJ6xQd6znN2eWOL4MPAxYeS2ZGnaZ7ijUN91MAyPnV0dQU7loVtS1jt2HlM5oMSsE2Zoz6FP31GvG6f7o_MWogEp0ZMOus50bVly3II8Rjjc4IGgswbw0h-RS0Ipo3f2QmXp4GfhRNUoTyqq-7oiCIDPUJcdg39lSIy9Fz7-ECNfbjEiH60V3GyftuiFGrayMoE7XeWaC9wQZo3fLHhI1aPgbXXsP-rqWLFf2km4zdG5Y5CYpUNb_Z11VOU6aaFCdRtoC6e7VcxHxLwCBT22wluNpbfFtEQSYDQE1JlegijvFmnRHTM88n-zp7sWhuCWVX6oE0ULdy51SR4iOqpYOA4B1ZymmYrQz1kBxSA_52lnTBlU9gfWkUiFX8GLSh7wQ8a4dVMYoJj6t1VCJt9-d30jn4S3tXsim_3wpp71RE9SSazV35j8o7do',
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15'
            }
        });

        // Kirim balik data ke client
        res.json(response.data);

    } catch (error) {
        console.error('[Proxy Error]:', error.message);

        if (error.response) {
            console.error('[Upstream Status]:', error.response.status);
            console.error('[Upstream Data]:', JSON.stringify(error.response.data));
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ error: error.message });
        }
    }
});

// Serve Static Files (Frontend) dari folder dist
// Railway menjalankan 'npm run build' sebelum 'npm start', jadi folder dist pasti ada
app.use(express.static(path.join(__dirname, 'dist')));

// SPA Fallback: Semua request lain kirim index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('API Proxy ready at /api/krl-webs/v1/*');
});
