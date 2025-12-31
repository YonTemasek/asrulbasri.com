import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkAdminAuth, unauthorizedResponse } from '@/lib/admin-auth';

// Admin client with service role for full access
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// GET - List all services (admin sees all, including inactive)
export async function GET() {
    // Check authentication
    const { authenticated } = await checkAdminAuth();
    if (!authenticated) {
        return unauthorizedResponse();
    }

    try {
        const { data, error } = await supabaseAdmin
            .from('ab_services')
            .select('*')
            .order('sort_order', { ascending: true });

        if (error) throw error;

        return NextResponse.json({ services: data });
    } catch (error) {
        console.error('Error fetching services:', error);
        return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
    }
}

// POST - Create new service
export async function POST(request: NextRequest) {
    // Check authentication
    const { authenticated } = await checkAdminAuth();
    if (!authenticated) {
        return unauthorizedResponse();
    }

    try {
        const body = await request.json();

        const { data, error } = await supabaseAdmin
            .from('ab_services')
            .insert([{
                name: body.name,
                description: body.description || null,
                price: body.price || 0,
                price_label: body.price_label || `RM ${body.price}`,
                period: body.period || null,
                duration: body.duration || null,
                features: body.features || [],
                stripe_price_id: body.stripe_price_id || null,
                icon: body.icon || 'Briefcase',
                color_theme: body.color_theme || 'emerald',
                is_active: body.is_active ?? true,
                is_featured: body.is_featured ?? false,
                sort_order: body.sort_order || 0,
            }])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ service: data });
    } catch (error) {
        console.error('Error creating service:', error);
        return NextResponse.json({ error: 'Failed to create service' }, { status: 500 });
    }
}
