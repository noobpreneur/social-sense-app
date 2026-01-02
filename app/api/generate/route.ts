import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
    try {
        const { postData, businessProfile } = await req.json();

        const apiKey = businessProfile.apiKey || process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return NextResponse.json({
                error: 'Missing API Key',
                comments: ["Error: Please enter your Gemini API Key in the Business Profile setup to use real AI."]
            }, { status: 401 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        // Using -latest alias often resolves resolution issues
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // Construct the prompt
        const tone = businessProfile.tone || "Professional";
        const niche = businessProfile.niche || "General";
        const brandName = businessProfile.name || "Use";
        const usp = businessProfile.usp || "";

        const caption = postData.caption || "No caption found.";
        const hashtags = (postData.hashtags || []).join(", ");
        const username = postData.username || "unknown";
        const mediaUrl = postData.mediaUrl;
        const videoUrl = postData.videoUrl;

        const parts: any[] = [];

        // Add Prompt Text
        parts.push({
            text: `
        You are a social media expert managing the account for "${brandName}" in the "${niche}" industry.
        Your tone is: ${tone}
        Your generic key selling point (USP): ${usp}

        Goal: Write 5 distinct, authentic, and engaging Instagram comments for the following post.
        The comments should:
        1. Be highly relevant to the VIDEO content (if provided) or Image + Caption.
        2. Be natural (like a real human).
        3. Subtly align with our brand values.
        4. Vary in length (short punchy vs slightly longer value-add).
        5. Use emojis appropriately to match "${tone}".

        Target Post Context:
        - Author: ${username}
        - Caption: "${caption.substring(0, 500)}..."
        - Hashtags: ${hashtags}
        
        Return ONLY the 5 comments as a JSON array of strings.
        `
        });

        // Handle Media (Prioritize Video if available and small enough, otherwise Image)
        let mediaProcessed = false;

        if (videoUrl && videoUrl.startsWith('http')) {
            try {
                console.log("Fetching video for AI analysis:", videoUrl);
                // Fetch HEAD to check size first
                const headResp = await fetch(videoUrl, { method: 'HEAD' });
                const size = parseInt(headResp.headers.get('content-length') || '0');
                const MAX_SIZE = 10 * 1024 * 1024; // 10MB limit for serverless stability

                if (size > 0 && size < MAX_SIZE) {
                    const videoResp = await fetch(videoUrl);
                    if (videoResp.ok) {
                        const videoBuffer = await videoResp.arrayBuffer();
                        parts.push({
                            inlineData: {
                                data: Buffer.from(videoBuffer).toString('base64'),
                                mimeType: 'video/mp4'
                            }
                        });
                        mediaProcessed = true;
                        console.log("Attached video to prompt.");
                    }
                } else {
                    console.warn(`Video too large (${(size / 1024 / 1024).toFixed(2)}MB) or undefined. Falling back to cover image.`);
                }
            } catch (e) {
                console.warn("Error processing video:", e);
            }
        }

        // Fallback to Image if video failed or wasn't present
        if (!mediaProcessed && mediaUrl && mediaUrl.startsWith('http')) {
            try {
                console.log("Fetching image for AI vision:", mediaUrl);
                const imageResp = await fetch(mediaUrl);
                if (imageResp.ok) {
                    const imageBuffer = await imageResp.arrayBuffer();
                    parts.push({
                        inlineData: {
                            data: Buffer.from(imageBuffer).toString('base64'),
                            mimeType: 'image/jpeg'
                        }
                    });
                }
            } catch (e) {
                console.warn("Error fetching image for AI:", e);
            }
        }

        const result = await model.generateContent(parts);
        const response = await result.response;
        let text = response.text();

        // Clean up markdown if Gemini adds it
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        let comments = [];
        try {
            comments = JSON.parse(text);
        } catch (e) {
            console.error("Failed to parse AI response as JSON", text);
            comments = text.split('\n').filter((line: string) => line.length > 5).map((l: string) => l.replace(/^\d+\.\s*/, '').replace(/^-\s*/, '').replace(/"/g, ''));
        }

        return NextResponse.json({ comments });

    } catch (error: any) {
        console.error('Generation failed:', error);
        return NextResponse.json({
            error: 'AI Generation Failed',
            details: error.message
        }, { status: 500 });
    }
}
