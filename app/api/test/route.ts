import axios from 'axios';

// Next.js App Router uses the Web Fetch API style
export async function GET(req: Request) {
  try {
    // Fetch from Catalyst serverless function
    const catalystRes = await axios.get(
      'https://socialmediaapp-7006507973.development.catalystserverless.com.au/server/test/execute'
    );

    // Return JSON response
    return new Response(
      JSON.stringify({ message: catalystRes.data }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (err: any) {
    console.error('Error fetching Catalyst function:', err.message || err);

    return new Response(
      JSON.stringify({ error: 'Failed to fetch external data' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}