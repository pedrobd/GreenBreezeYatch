import { NextResponse } from 'next/server';

export const revalidate = 86400; // Cache for 24 hours

export async function GET() {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    const placeId = process.env.GOOGLE_PLACE_ID;

    if (!apiKey || !placeId) {
        return NextResponse.json({
            warning: 'Google Places API configuration missing. Using mock data.',
            rating: 5.0,
            total_reviews: 30,
            reviews: [
                {
                    author_name: "Mock Reviewer 1",
                    rating: 5,
                    text: "The experience was just perfect and the on-board crew were fantastic. They were very helpful but also discrete...",
                    time: Date.now() / 1000
                },
                {
                    author_name: "Mock Reviewer 2",
                    rating: 5,
                    text: "We spent a perfect day on Green Breeze. The boat was fantastic, very well appointed and spacious. The crew were great...",
                    time: Date.now() / 1000
                },
                {
                    author_name: "Mock Reviewer 3",
                    rating: 5,
                    text: "Foi mesmo uma experiência maravilhosa para este grupo de amigas... Amizade no seu estado puro e muito bem disposto!",
                    time: Date.now() / 1000
                }
            ]
        }, { status: 200, headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    try {
        const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews,rating,user_ratings_total&key=${apiKey}&language=pt-PT`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.status !== 'OK') {
            return NextResponse.json({ error: 'Failed to fetch from Google Places API', details: data }, { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } });
        }

        // Filter 5-star reviews
        const fiveStarReviews = data.result.reviews ? data.result.reviews.filter((r: any) => r.rating === 5) : [];

        return NextResponse.json({
            rating: data.result.rating,
            total_reviews: data.result.user_ratings_total,
            reviews: fiveStarReviews
        }, {
            headers: {
                'Access-Control-Allow-Origin': '*' // Allow frontend to fetch this
            }
        });

    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } });
    }
}
