const http = require('http');

http.get('http://localhost:3001/api/products', (resp) => {
    let data = '';
    resp.on('data', (chunk) => { data += chunk; });
    resp.on('end', () => {
        try {
            const json = JSON.parse(data);
            let discounted = 0;
            json.products.forEach(p => {
                if (p.discount_percent > 0) discounted++;
            });
            console.log('COUNT:' + discounted + '/' + json.products.length);
        } catch (e) {
            console.error(e.message);
        }
    });
}).on("error", (err) => {
    console.log("Error: " + err.message);
});
