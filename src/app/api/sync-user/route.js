import { syncCustomer } from '@/models/customers';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const userData = await request.json();
    if (!userData || !userData.tg_id) {
      return NextResponse.json({ error: 'Invalid user data' }, { status: 400 });
    }

    const customer = await syncCustomer(userData);
    return NextResponse.json({ customer });
  } catch (error) {
    console.error('Error syncing user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
