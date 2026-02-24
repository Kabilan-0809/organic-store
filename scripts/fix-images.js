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

async function fixImages() {
    const updates = [
        { name: 'Barnyard Almond Elephant', correct: '/products/millets/Almond Elephant.jpg' },
        { name: 'Multi Millet Choco Coated Balls', correct: '/products/millets/Choco coated monkey.jpg' },
        { name: 'Choco Ragi Malt', correct: '/products/millets/Choco Ragi Millet.png' },
        { name: 'Mudavaattu Kizhangu Saadha Podi', correct: '/products/Saadha_Podi/Mudavaattu Kizhangu saadha podi.png' }
    ];

    for (const update of updates) {
        const { data, error } = await supabase
            .from('Product')
            .update({ imageUrl: update.correct })
            .eq('name', update.name)
            .select('name, imageUrl');

        if (error) {
            console.error(`Error updating ${update.name}:`, error);
        } else {
            console.log(`Updated ${update.name}:`, data);
        }
    }
}

fixImages().catch(console.error);
