import { NextResponse } from 'next/server';
// @ts-ignore
const { instagramGetUrl } = require("instagram-url-direct")

export async function POST(req: Request) {
    try {
        const { url } = await req.json();

        if (!url || !url.includes('instagram.com/')) {
            return NextResponse.json({ error: 'Invalid Instagram URL' }, { status: 400 });
        }

        console.log(`Scraping URL via instagram-url-direct: ${url}`);

        // Using the 'instagram-url-direct' library
        // It returns structured data including media links
        const data = await instagramGetUrl(url);

        // Log raw data for debugging
        console.log("Raw Scrape Data:", JSON.stringify(data).substring(0, 200) + "...");

        if (!data.url_list || data.url_list.length === 0) {
            throw new Error("No media found (Private or Login Wall)");
        }

        // Map library output to our app structure
        // The library usually returns: { results_number: 1, url_list: [Url], post_info: { owner: {...}, caption: "..." } }
        // Note: The specific shape depends on the library version, we adapt based on common response.

        // Check if post_info exists (some versions provide it)
        const postInfo = data.post_info || {};
        const owner = postInfo.owner || {};

        const refinedData = {
            username: owner.username || "Unknown",
            caption: postInfo.caption || "",
            mediaUrl: data.url_list[0], // First media item
            videoUrl: data.url_list.find((u: string) => u.includes('.mp4')) || null, // Best guess for video
            likes: postInfo.likes || 0,
            commentsCount: postInfo.comments || 0,
            timestamp: new Date().toISOString(), // Library might not give timestamp, defaulted
            hashtags: (postInfo.caption || "").match(/#\w+/g) || [],
            type: data.url_list[0].includes('.mp4') ? 'video' : 'image'
        };

        return NextResponse.json(refinedData);

    } catch (error: any) {
        console.error('API Error:', error.message);
        return NextResponse.json({
            error: "Scraping failed",
            details: error.message,
            // Fallback mock
            username: "Unknown User",
            caption: "Could not retrieve data via the new library. Please ensure the link is public.",
            mediaUrl: "",
            hashtags: [],
            likes: 0,
            type: "post"
        });
    }
}
