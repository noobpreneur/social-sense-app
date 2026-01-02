"use client"

import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, Heart, MessageCircle, Calendar } from "lucide-react"

interface PostData {
    username: string;
    caption: string;
    mediaUrl: string;
    hashtags: string[];
    likes?: number; // New
    commentsCount?: number; // New
    timestamp?: string; // New
    videoUrl?: string | null; // New (Fixed build error)
    type?: string;
}

export function PostPreview({ data }: { data: PostData }) {
    const hasMedia = data.mediaUrl && data.mediaUrl.startsWith("http");
    const isLimited = data.username === "Unknown User" || data.caption.includes("Could not retrieve");

    const formatDate = (isoString?: string) => {
        if (!isoString) return "";
        return new Date(isoString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }

    return (
        <div className="space-y-4">
            {isLimited && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-200 p-3 rounded-lg flex items-start gap-3 text-sm">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p>Limited data access. Instagram blocked the scraper, but you can still generate comments!</p>
                </div>
            )}

            <Card className="glass-card overflow-hidden border-white/10">
                <CardContent className="p-0 flex flex-col md:flex-row">
                    {hasMedia ? (
                        data.type === 'video' || data.videoUrl ? (
                            <div className="relative w-full md:w-48 h-48 bg-black shrink-0">
                                <video
                                    src={data.videoUrl || data.mediaUrl}
                                    className="w-full h-full object-cover"
                                    controls
                                    playsInline
                                />
                            </div>
                        ) : (
                            <div className="relative w-full md:w-48 h-48 bg-black/20 shrink-0">
                                <img
                                    src={data.mediaUrl}
                                    alt="Post Preview"
                                    className="w-full h-full object-cover"
                                    referrerPolicy="no-referrer"
                                />
                            </div>
                        )
                    ) : (
                        <div className="w-full md:w-48 h-48 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center shrink-0">
                            <span className="text-muted-foreground text-sm">No Preview</span>
                        </div>
                    )}
                    <div className="p-4 flex flex-col justify-center space-y-2 w-full">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-lg">{data.username !== 'Unknown' ? `@${data.username}` : 'Instagram User'}</span>
                            </div>
                            {data.timestamp && <span className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(data.timestamp)}</span>}
                        </div>

                        <p className="text-sm text-muted-foreground line-clamp-3">
                            {data.caption}
                        </p>

                        {/* Stats Row */}
                        {(data.likes !== undefined || data.commentsCount !== undefined) && (
                            <div className="flex gap-4 pt-2 text-sm text-gray-300">
                                {data.likes !== undefined && (
                                    <div className="flex items-center gap-1">
                                        <Heart className="w-4 h-4 text-pink-500" />
                                        <span>{data.likes.toLocaleString()} likes</span>
                                    </div>
                                )}
                                {data.commentsCount !== undefined && (
                                    <div className="flex items-center gap-1">
                                        <MessageCircle className="w-4 h-4 text-blue-400" />
                                        <span>{data.commentsCount.toLocaleString()} comments</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {data.hashtags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                                {data.hashtags.slice(0, 3).map(tag => (
                                    <span key={tag} className="text-xs text-blue-400">{tag}</span>
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
