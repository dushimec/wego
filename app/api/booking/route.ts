import { NextResponse } from 'next/server';
import { submitBooking } from '@/app/booking/actions';

export async function POST(request: Request) {
  try {
    const bookingData = await request.json();
    const newBooking = await submitBooking(bookingData);
    return NextResponse.json(newBooking, { status: 201 });
  } catch (error) {
    let errorMessage = 'An unknown error occurred.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
