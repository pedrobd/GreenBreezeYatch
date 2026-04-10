const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function migrate() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error('Missing Supabase environment variables.');
        return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        console.log('Fetching posts from Greenbreeze API...');
        const response = await fetch('https://greenbreeze.pt/wp-json/wp/v2/posts?per_page=100');
        const wpPosts = await response.json();
        console.log('Found', wpPosts.length, 'posts.');

        console.log('Fetching categories...');
        const catResponse = await fetch('https://greenbreeze.pt/wp-json/wp/v2/categories?per_page=100');
        const categories = await catResponse.json();
        
        console.log('Fetching media...');
        const mediaResponse = await fetch('https://greenbreeze.pt/wp-json/wp/v2/media?per_page=100');
        const media = await mediaResponse.json();

        for (const wpPost of wpPosts) {
            const slug = wpPost.slug;

            // Check if post already exists
            const { data: existing } = await supabase
                .from('blog_posts')
                .select('id')
                .eq('slug', slug);

            if (existing && existing.length > 0) {
                console.log('Skipping existing post:', slug);
                continue;
            }

            const coverMedia = Array.isArray(media) ? media.find(m => m.id === wpPost.featured_media) : null;
            const postCategory = Array.isArray(categories) ? categories.find(c => wpPost.categories.includes(c.id)) : null;
            
            const titlePt = wpPost.title.rendered;
            const contentPt = wpPost.content.rendered;

            console.log('Importing:', slug);
            const { error } = await supabase.from('blog_posts').insert({
                title: titlePt,
                title_en: '', 
                slug: slug,
                content: contentPt,
                content_en: '',
                author: 'Equipa Green Breeze',
                publish_date: wpPost.date,
                status: 'Publicado',
                category: postCategory ? postCategory.name : 'Geral',
                cover_image_url: coverMedia ? (coverMedia.media_details?.sizes?.large?.source_url || coverMedia.source_url) : ''
            });

            if (error) {
                console.error('Error inserting', slug, ':', error.message);
            } else {
                console.log('Successfully imported:', slug);
            }
        }
        console.log('Migration complete!');
    } catch (e) {
        console.error('Migration failed:', e.message);
    }
}

migrate();
