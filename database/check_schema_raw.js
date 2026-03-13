
const https = require('https');

const url = "https://gtaytqkzonbiyfmjwtbd.supabase.co/rest/v1/fleet?select=is_partner&limit=1";
const apikey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0YXl0cWt6b25iaXlmbWp3dGJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwNTA5ODAsImV4cCI6MjA4NzYyNjk4MH0.p-HXoVHbTeRdzOS2pebvtpp8iaSeFT3iqaiWDEL_Xi8";

const options = {
    headers: {
        'apikey': apikey,
        'Authorization': 'Bearer ' + apikey
    }
};

https.get(url, options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        console.log('Status Code:', res.statusCode);
        console.log('Response:', data);
    });
}).on('error', (err) => {
    console.error('Error:', err.message);
});
