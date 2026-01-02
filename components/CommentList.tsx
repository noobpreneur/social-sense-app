"use client"

import { Button } from "@/components/ui/button"
import { Copy, RefreshCw, Wand2 } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"

interface CommentListProps {
    comments: string[];
    onRegenerate: () => void;
}

export function CommentList({ comments, onRegenerate }: CommentListProps) {
    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text)
        toast.success("Comment copied to clipboard!")
    }

    const handleImprove = () => {
        toast.info("AI is refining this comment... (Simulation)")
    }

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                    Generated Suggestions
                </h3>
                <Button size="sm" variant="ghost" onClick={onRegenerate}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Regenerate All
                </Button>
            </div>

            <div className="grid gap-3">
                {comments.map((comment, index) => (
                    <Card key={index} className="glass-card border-white/5 hover:border-white/20 transition-all hover:bg-white/5 group">
                        <CardContent className="p-4 flex items-start gap-4 justify-between">
                            <p className="text-sm leading-relaxed text-gray-200 pt-1">{comment}</p>
                            <div className="flex flex-col gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-white" onClick={() => handleCopy(comment)}>
                                    <Copy className="h-4 w-4" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-indigo-400 hover:text-indigo-300" onClick={handleImprove}>
                                    <Wand2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="flex justify-center pt-4">
                <Button variant="secondary" onClick={onRegenerate}>
                    Load More Variations
                </Button>
            </div>
        </div>
    )
}
