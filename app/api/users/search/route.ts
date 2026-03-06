import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length < 1) {
      return NextResponse.json({ users: [] });
    }

    await connectDB();

    const users = await User.find({
      username: { $regex: query, $options: 'i' },
    })
      .select('username bio avatar')
      .limit(10)
      .lean();

    return NextResponse.json({ users });
  } catch (err) {
    console.error('[SEARCH]', err);
    return NextResponse.json({ users: [] });
  }
}