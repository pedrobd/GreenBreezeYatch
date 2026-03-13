
const https = require('https');

const url = "https://gtaytqkzonbiyfmjwtbd.supabase.co/rest/v1/fleet?select=*&limit=1";
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
        try {
            const json = JSON.parse(data);
            if (json.length > 0) {
                console.log('Columns:', Object.keys(json[0]));
            } else {
                console.log('No data to infer columns.');
            }
        } catch (e) {
            console.log('Raw Response:', data);
        }
    });
}).on('error', (err) => {
    console.error('Error:', err.message);
});
