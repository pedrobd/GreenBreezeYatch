const https = require('https');

const apikey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0YXl0cWt6b25iaXlmbWp3dGJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwNTA5ODAsImV4cCI6MjA4NzYyNjk4MH0.p-HXoVHbTeRdzOS2pebvtpp8iaSeFT3iqaiWDEL_Xi8";
const url = "https://gtaytqkzonbiyfmjwtbd.supabase.co/rest/v1/reservations?select=client_name,boarding_location&limit=10";

https.get(url, { headers: { 'apikey': apikey, 'Authorization': 'Bearer ' + apikey } }, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        try {
            const reservations = JSON.parse(data);
            console.log('Last 10 reservations boarding locations:');
            if (Array.isArray(reservations)) {
                reservations.forEach(r => {
                    console.log(`- ${r.client_name}: "${r.boarding_location}"`);
                });
            } else {
                console.log('Reservations is not an array:', reservations);
            }
        } catch (e) {
            console.log('Error:', e.message);
        }
    });
});
