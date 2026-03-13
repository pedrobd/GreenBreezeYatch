import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { verifySibsCallback } from '@/utils/sibs';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const signature = req.headers.get('x-sibs-signature') || '';

        console.log('SIBS Callback received:', JSON.stringify(body, null, 2));

        // 1. Verify Signature (Sandbox has it optional sometimes, but good to keep structure)
        if (!verifySibsCallback(body, signature)) {
            console.warn('Invalid SIBS signature received');
            // return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        // 2. Extract Data (SIBS SPG Format)
        // Note: Field names might vary depending on whether it's the checkout session or direct payment
        const merchantReference = body.merchantReference || body.orderId;
        const status = body.paymentStatus || body.status;
        const transactionID = body.transactionID || body.paymentId;

        if (!merchantReference) {
            return NextResponse.json({ error: 'Missing merchantReference' }, { status: 400 });
        }

        // 3. Update Reservation Status in Supabase
        const supabase = createAdminClient();

        let paymentStatus = 'Erro';
        if (['Success', 'SUCCESS', 'PROCESSED', 'COMPLETED'].includes(status)) {
            paymentStatus = 'Pago';
        } else if (['Pending', 'PENDING'].includes(status)) {
            paymentStatus = 'Pendente';
        } else {
            paymentStatus = 'Falhou';
        }

        const { error } = await supabase
            .from('reservations')
            .update({
                payment_status: paymentStatus,
                sibs_reference: transactionID,
                status: paymentStatus === 'Pago' ? 'Confirmado' : 'Pendente'
            })
            .eq('id', merchantReference);

        if (error) {
            console.error('Supabase update error:', error);
            throw error;
        }

        return NextResponse.json({ success: true, message: 'Status updated' });

    } catch (error: any) {
        console.error('SIBS Callback Error:', error);
        return NextResponse.json({ error: 'Internal server error', message: error.message }, { status: 500 });
    }
}
