const https = require('https');

const apikey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0YXl0cWt6b25iaXlmbWp3dGJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwNTA5ODAsImV4cCI6MjA4NzYyNjk4MH0.p-HXoVHbTeRdzOS2pebvtpp8iaSeFT3iqaiWDEL_Xi8";

// To check columns, we can try to insert a dummy and see the error? No.
// We'll use the PostgREST "root" which might show OpenAPI spec?
const url = "https://gtaytqkzonbiyfmjwtbd.supabase.co/rest/v1/";

https.get(url, { headers: { 'apikey': apikey, 'Authorization': 'Bearer ' + apikey } }, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        try {
            const spec = JSON.parse(data);
            const resTable = spec.definitions?.reservations;
            if (resTable) {
                console.log('Reservations columns:', Object.keys(resTable.properties));
            } else {
                console.log('Could not find reservations definition');
            }
        } catch (e) {
            console.log('Error parsing spec:', e.message);
        }
    });
});
