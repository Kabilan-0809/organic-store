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

async function fixCombos() {
    const { data: combos, error: fetchError } = await supabase
        .from('Combo')
        .select('id, imageUrl');

    if (fetchError) {
        console.error('Fetch error:', fetchError);
        return;
    }

    for (const combo of combos) {
        if (combo.imageUrl && combo.imageUrl.includes('github.com')) {
            // Extract the path after /public
            // Example: https://github.com/Kabilan-0809/organic-store/blob/main/public/combos/millet-snack-combo.png?raw=true
            // To: /combos/millet-snack-combo.png

            let newUrl = combo.imageUrl;
            const publicIndex = newUrl.indexOf('/public/');
            if (publicIndex !== -1) {
                newUrl = newUrl.substring(publicIndex + 7); // keep the slash before 'combos'
                // Remove query params
                const queryIndex = newUrl.indexOf('?');
                if (queryIndex !== -1) {
                    newUrl = newUrl.substring(0, queryIndex);
                }

                console.log(`Updating ${combo.id} from ${combo.imageUrl} to ${newUrl}`);

                const { error: updateError } = await supabase
                    .from('Combo')
                    .update({ imageUrl: newUrl })
                    .eq('id', combo.id);

                if (updateError) console.error(`Failed to update ${combo.id}:`, updateError);
                else console.log(`Success: ${combo.id}`);
            }
        }
    }
}

fixCombos().catch(console.error);
