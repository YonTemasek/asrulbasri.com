import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkAdminAuth, unauthorizedResponse } from '@/lib/admin-auth';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// GET - Get single service
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { authenticated } = await checkAdminAuth();
    if (!authenticated) return unauthorizedResponse();

    try {
        const { id } = await params;

        const { data, error } = await supabaseAdmin
            .from('ab_services')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        if (!data) {
            return NextResponse.json({ error: 'Service not found' }, { status: 404 });
        }

        return NextResponse.json({ service: data });
    } catch (error) {
        console.error('Error fetching service:', error);
        return NextResponse.json({ error: 'Failed to fetch service' }, { status: 500 });
    }
}

// PATCH - Update service
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { authenticated } = await checkAdminAuth();
    if (!authenticated) return unauthorizedResponse();

    try {
        const { id } = await params;
        const body = await request.json();

        const { data, error } = await supabaseAdmin
            .from('ab_services')
            .update({
                ...body,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ service: data });
    } catch (error) {
        console.error('Error updating service:', error);
        return NextResponse.json({ error: 'Failed to update service' }, { status: 500 });
    }
}

// DELETE - Delete service
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { authenticated } = await checkAdminAuth();
    if (!authenticated) return unauthorizedResponse();

    try {
        const { id } = await params;

        const { error } = await supabaseAdmin
            .from('ab_services')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting service:', error);
        return NextResponse.json({ error: 'Failed to delete service' }, { status: 500 });
    }
}
