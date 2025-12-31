import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://asrulbasri.com'

    // Static pages
    const staticPages = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 1,
        },
        {
            url: `${baseUrl}/articles`,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 0.9,
        },
        {
            url: `${baseUrl}/services`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.8,
        },
        {
            url: `${baseUrl}/library`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        },
        {
            url: `${baseUrl}/work-with-me`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.7,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.6,
        },
        {
            url: `${baseUrl}/privacy`,
            lastModified: new Date(),
            changeFrequency: 'yearly' as const,
            priority: 0.3,
        },
        {
            url: `${baseUrl}/terms`,
            lastModified: new Date(),
            changeFrequency: 'yearly' as const,
            priority: 0.3,
        },
    ]

    // Dynamic articles from Supabase
    let articlePages: MetadataRoute.Sitemap = []

    // Only attempt to fetch if env vars are present
    if (supabaseUrl && supabaseKey) {
        try {
            const supabase = createClient(supabaseUrl, supabaseKey)
            // Use 'status' instead of 'is_published' which might not exist
            const { data: articles } = await supabase
                .from('ab_blog_posts')
                .select('slug, updated_at')
                .eq('status', 'Published')

            if (articles) {
                articlePages = articles.map((article) => ({
                    url: `${baseUrl}/articles/${article.slug}`,
                    lastModified: new Date(article.updated_at),
                    changeFrequency: 'weekly' as const,
                    priority: 0.7,
                }))
            }
        } catch (error) {
            console.error('Error fetching articles for sitemap:', error)
            // Continue without articles, do not crash
        }
    }

    return [...staticPages, ...articlePages]
}
