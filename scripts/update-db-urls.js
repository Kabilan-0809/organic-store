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
const DOMAIN = 'https://milletsnjoy.com';

async function updateUrls() {
    console.log('Fetching products...');
    const { data: products, error: pError } = await supabase.from('Product').select('id, imageUrl');
    if (pError) {
        console.error('Error fetching products:', pError);
        return;
    }

    for (const product of products) {
        if (product.imageUrl && product.imageUrl.startsWith('/')) {
            const newUrl = DOMAIN + product.imageUrl;
            console.log(`Updating product ${product.id} -> ${newUrl}`);
            const { error } = await supabase.from('Product').update({ imageUrl: newUrl }).eq('id', product.id);
            if (error) console.error(`Failed to update ${product.id}:`, error);
        }
    }

    // Also update Combos
    console.log('\nFetching combos...');
    const { data: combos, error: cError } = await supabase.from('Combo').select('id, imageUrl');
    if (cError) {
        console.error('Error fetching combos:', cError);
        return;
    }

    for (const combo of combos) {
        if (combo.imageUrl && combo.imageUrl.startsWith('/')) {
            const newUrl = DOMAIN + combo.imageUrl;
            console.log(`Updating combo ${combo.id} -> ${newUrl}`);
            const { error } = await supabase.from('Combo').update({ imageUrl: newUrl }).eq('id', combo.id);
            if (error) console.error(`Failed to update combo ${combo.id}:`, error);
        }
    }
}

updateUrls().catch(console.error);
