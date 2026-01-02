"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Sparkles } from "lucide-react"

interface UrlInputProps {
    onSearch: (url: string) => void;
    isLoading: boolean;
}

export function UrlInput({ onSearch, isLoading }: UrlInputProps) {
    const [url, setUrl] = useState("")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (url.trim()) {
            onSearch(url.trim())
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-2xl mx-auto">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                    placeholder="Paste Instagram Post URL (e.g. https://www.instagram.com/p/...)"
                    className="pl-10 h-12 bg-white/5 border-white/10 hover:border-white/20 transition-colors"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                />
            </div>
            <Button type="submit" variant="premium" className="h-12 px-6" disabled={isLoading || !url}>
                {isLoading ? (
                    <span className="flex items-center gap-2">
                        Generating...
                    </span>
                ) : (
                    <span className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Generate
                    </span>
                )}
            </Button>
        </form>
    )
}
