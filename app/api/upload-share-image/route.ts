import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        return NextResponse.json({ imageUrl: data.data.url });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
    }
} 