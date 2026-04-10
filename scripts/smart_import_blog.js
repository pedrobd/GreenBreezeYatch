const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function smartMigrate() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        console.log('Fetching all content from WordPress...');
        const postsRes = await fetch('https://greenbreeze.pt/wp-json/wp/v2/posts?per_page=100');
        const wpPosts = await postsRes.json();
        
        const mediaRes = await fetch('https://greenbreeze.pt/wp-json/wp/v2/media?per_page=100');
        const mediaList = await mediaRes.json();
        
        const catRes = await fetch('https://greenbreeze.pt/wp-json/wp/v2/categories?per_page=100');
        const categories = await catRes.json();

        const getImageUrl = (mediaId) => {
            const m = mediaList.find(item => item.id === mediaId);
            return m ? (m.media_details?.sizes?.large?.source_url || m.source_url) : '';
        };

        const isEnglish = (post) => {
            const text = (post.title.rendered + ' ' + post.content.rendered).toLowerCase();
            const enKeywords = [' the ', ' with ', ' and ', ' from ', ' yacht ', ' board ', ' sailing '];
            const ptKeywords = [' o ', ' a ', ' os ', ' as ', ' de ', ' com ', ' iate ', ' passeio ', ' reserva '];
            
            let enScore = enKeywords.reduce((acc, k) => acc + (text.includes(k) ? 1 : 0), 0);
            let ptScore = ptKeywords.reduce((acc, k) => acc + (text.includes(k) ? 1 : 0), 0);
            
            return enScore > ptScore;
        };

        const ptPosts = wpPosts.filter(p => !isEnglish(p));
        const enPosts = wpPosts.filter(p => isEnglish(p));

        console.log(`Found ${ptPosts.length} PT posts and ${enPosts.length} EN posts.`);

        const mergedPosts = [];

        // For each PT post, try to find its EN counterpart
        for (const ptPost of ptPosts) {
            const ptImg = getImageUrl(ptPost.featured_media);
            
            // Heuristic 1: Same featured media ID (unlikely but possible)
            // Heuristic 2: Very similar date (within 2 hours)
            // Heuristic 3: Shared image filename in content
            
            const slugMatches = {
                'aproveite-ao-maximo-setubal-hospede-se-na-carmos-residence-e-navegue-com-a-green-breeze': 'setubals-charm-carmos-residence',
                'o-seu-guia-definitivo-para-umas-ferias-inesqueciveis-em-troia': 'exploring_troia_your_ultimate_guide_to_unforgettable_holidays_in_troia',
                'a-importancia-de-planear-as-suas-ferias-com-antecedencia': 'why-planning-your-holidays-early-is-important',
                'explorando-a-historia-da-peninsula-de-troia-e-a-sua-beleza': 'exploring-the-history-of-troia-peninsula-portugal',
                'ferias-a-bordo-de-um-iate-tudo-o-que-precisa-saber': 'holidays-on-board-of-a-yacht-all-you-need-to-know',
                'um-plano-de-seguranca-para-umas-ferias-em-familia-num-iate-garantindo-a-seguranca-dos-seus-filhos-a-bordo': 'a-safe-plan-for-a-family-yacht-vacation-ensuring-your-childrens-safety-onboard',
                'a_safe_plan_for_a_family_yacht_vacation_childrens_safety_onboard': 'um-plano-de-seguranca-para-umas-ferias-em-familia-num-iate-garantindo-a-seguranca-dos-seus-filhos-a-bordo'
            };

            let enCounterpart = enPosts.find(en => {
                if (slugMatches[ptPost.slug] === en.slug) return true;
                
                const enDate = new Date(en.date);
                const ptDate = new Date(ptPost.date);
                const diffHours = Math.abs(enDate - ptDate) / 36e5;
                if (diffHours < 24) { // Increased window to 24h
                    // Check if titles share any significant words (after simple translation keywords)
                    const enTitle = en.title.rendered.toLowerCase();
                    const commonKeywords = [
                        ['setúbal', 'setubal'], ['ferias', 'holidays'], ['férias', 'holidays'],
                        ['seguranca', 'safety'], ['segurança', 'safety'], ['iate', 'yacht'],
                        ['história', 'history'], ['historia', 'history'], ['troia', 'troia'],
                        ['long run', 'long run'], ['marina', 'marina'], ['plano', 'plan'],
                        ['mergulhe', 'dive'], ['importancia', 'important'], ['mar', 'sea']
                    ];
                    
                    for (const [pt, enWord] of commonKeywords) {
                        if (ptPost.title.rendered.toLowerCase().includes(pt) && enTitle.includes(enWord)) return true;
                    }
                }
                
                // Filename check (more robust)
                const enImg = getImageUrl(en.featured_media);
                if (enImg && ptImg) {
                    const enBase = enImg.split('/').pop().replace(/[0-9-]+/g, '');
                    const ptBase = ptImg.split('/').pop().replace(/[0-9-]+/g, '');
                    if (enBase.length > 5 && enBase === ptBase) return true;
                }
                return false;
            });

            if (enCounterpart) {
                console.log(`Matched: [PT] ${ptPost.slug} <-> [EN] ${enCounterpart.slug}`);
                mergedPosts.push({
                    title: ptPost.title.rendered,
                    title_en: enCounterpart.title.rendered,
                    slug: ptPost.slug,
                    content: ptPost.content.rendered,
                    content_en: enCounterpart.content.rendered,
                    publish_date: ptPost.date,
                    category: (categories.find(c => ptPost.categories.includes(c.id)) || {name: 'Geral'}).name,
                    cover_image_url: ptImg || getImageUrl(enCounterpart.featured_media)
                });
                // Remove from enPosts so it's not imported twice
                enPosts.splice(enPosts.indexOf(enCounterpart), 1);
            } else {
                console.log(`Unmatched PT post: ${ptPost.slug}`);
                mergedPosts.push({
                    title: ptPost.title.rendered,
                    title_en: '',
                    slug: ptPost.slug,
                    content: ptPost.content.rendered,
                    content_en: '',
                    publish_date: ptPost.date,
                    category: (categories.find(c => ptPost.categories.includes(c.id)) || {name: 'Geral'}).name,
                    cover_image_url: ptImg
                });
            }
        }

        // Catch any remaining EN posts as standalone (just in case)
        for (const enPost of enPosts) {
            console.log(`Unmatched EN post (standalone): ${enPost.slug}`);
            mergedPosts.push({
                title: '', // PT missing
                title_en: enPost.title.rendered,
                slug: enPost.slug,
                content: '',
                content_en: enPost.content.rendered,
                publish_date: enPost.date,
                category: (categories.find(c => enPost.categories.includes(c.id)) || {name: 'Geral'}).name,
                cover_image_url: getImageUrl(enPost.featured_media)
            });
        }

        console.log(`Total records to sync: ${mergedPosts.length}`);

        // Cleanup existing and Insert
        console.log('Cleaning up existing blog_posts...');
        const { error: delError } = await supabase.from('blog_posts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (delError) throw delError;

        for (const post of mergedPosts) {
            const { error: insError } = await supabase.from('blog_posts').insert({
                ...post,
                author: 'Equipa Green Breeze',
                status: 'Publicado'
            });
            if (insError) console.error(`Error inserting ${post.slug}:`, insError.message);
            else console.log(`Synced: ${post.slug}`);
        }

        console.log('Smart Migration Complete!');
    } catch (e) {
        console.error('Smart Migration Failed:', e.message);
    }
}

smartMigrate();
