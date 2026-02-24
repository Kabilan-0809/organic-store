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

async function check() {
    const { data, error } = await supabase
        .from('Product')
        .select('name, imageUrl')
        .ilike('name', '%almond%');

    const { data: data2 } = await supabase
        .from('Product')
        .select('name, imageUrl')
        .ilike('name', '%choco%');

    const { data: data3 } = await supabase
        .from('Product')
        .select('name, imageUrl')
        .ilike('name', '%saadha%');

    console.log('Almond:', data);
    console.log('Choco:', data2);
    console.log('Saadha:', data3);
}

check().catch(console.error);
