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

async function encodeUrls() {
    console.log('Fetching products...');
    const { data: products, error: pError } = await supabase.from('Product').select('id, imageUrl');
    if (pError) {
        console.error('Error fetching products:', pError);
        return;
    }

    let pCount = 0;
    for (const product of products) {
        if (product.imageUrl && product.imageUrl.includes(' ')) {
            // Encode URI but preserve domain and slashes
            const newUrl = product.imageUrl.split('/').map(part => {
                if (part.startsWith('http')) return part;
                return encodeURIComponent(part);
            }).join('/');

            console.log(`Encoding product ${product.id} -> ${newUrl}`);
            const { error } = await supabase.from('Product').update({ imageUrl: newUrl }).eq('id', product.id);
            if (error) console.error(`Failed to update ${product.id}:`, error);
            else pCount++;
        }
    }
    console.log(`Updated ${pCount} products.`);

    // Also update Combos
    console.log('\nFetching combos...');
    const { data: combos, error: cError } = await supabase.from('Combo').select('id, imageUrl');
    if (cError) {
        console.error('Error fetching combos:', cError);
        return;
    }

    let cCount = 0;
    for (const combo of combos) {
        if (combo.imageUrl && combo.imageUrl.includes(' ')) {
            const newUrl = combo.imageUrl.split('/').map(part => {
                if (part.startsWith('http')) return part;
                return encodeURIComponent(part);
            }).join('/');

            console.log(`Encoding combo ${combo.id} -> ${newUrl}`);
            const { error } = await supabase.from('Combo').update({ imageUrl: newUrl }).eq('id', combo.id);
            if (error) console.error(`Failed to update combo ${combo.id}:`, error);
            else cCount++;
        }
    }
    console.log(`Updated ${cCount} combos.`);
}

encodeUrls().catch(console.error);
