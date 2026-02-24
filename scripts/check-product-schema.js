const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');

let supabaseUrl = '';
let supabaseKey = '';

env.split('\n').forEach(line => {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].trim();
    if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) supabaseKey = line.split('=')[1].trim();
});

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    const { data, error } = await supabase
        .from('Product')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Fetch error:', error);
    } else {
        console.log('Sample product:', data[0]);
    }
}

checkSchema().catch(console.error);
