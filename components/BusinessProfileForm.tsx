"use client"

import { useState, useEffect } from "react"
import { useBusinessProfile, BusinessProfile } from "@/hooks/useBusinessProfile"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Rocket, Loader2 } from "lucide-react"

export function BusinessProfileForm({ onComplete, onSave }: { onComplete?: () => void, onSave?: (profile: BusinessProfile) => void }) {
    const { profile, loading } = useBusinessProfile()
    const [formData, setFormData] = useState<BusinessProfile>({
        name: "",
        niche: "",
        targetAudience: "",
        tone: "Professional",
        usp: "",
        website: "",
        apiKey: ""
    })
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        if (profile) {
            setFormData(profile)
        }
    }, [profile])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        // Simulate a small delay for better UX
        setTimeout(() => {
            if (onSave) {
                onSave(formData)
            } else {
                // Fallback if no parent handler (though for this app we expect one)
                const { saveProfile } = require("@/hooks/useBusinessProfile").useBusinessProfile() // Won't work cleanly, better to just rely on prop or localStorage directly if needed, but let's stick to prop for now.
                localStorage.setItem('socialsense_profile', JSON.stringify(formData));
            }
            setIsSaving(false)
            if (onComplete) onComplete()
        }, 800)
    }

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>
    }

    return (
        <Card className="w-full max-w-lg mx-auto glass-card border-white/10">
            <CardHeader>
                <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                    Setup Your Brand
                </CardTitle>
                <CardDescription>
                    Tell us about your business so AI can write authentic comments for you.
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Business Name</Label>
                        <Input id="name" name="name" required placeholder="e.g. Acme Co." value={formData.name} onChange={handleChange} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="niche">Industry / Niche</Label>
                            <Input id="niche" name="niche" required placeholder="e.g. Fitness" value={formData.niche} onChange={handleChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tone">Brand Tone</Label>
                            <select
                                id="tone"
                                name="tone"
                                className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={formData.tone}
                                onChange={handleChange}
                            >
                                <option value="Professional">Professional</option>
                                <option value="Friendly">Friendly</option>
                                <option value="Bold">Bold</option>
                                <option value="Humorous">Humorous</option>
                                <option value="Luxury">Luxury</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="targetAudience">Target Audience</Label>
                        <Input id="targetAudience" name="targetAudience" required placeholder="e.g. Busy moms, Tech founders" value={formData.targetAudience} onChange={handleChange} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="usp">Key Selling Proposition</Label>
                        <Input id="usp" name="usp" required placeholder="e.g. Fastest delivery, Eco-friendly materials" value={formData.usp} onChange={handleChange} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="website">Website (Optional)</Label>
                        <Input id="website" name="website" placeholder="https://..." value={formData.website || ""} onChange={handleChange} />
                    </div>

                    <div className="space-y-2 pt-2 border-t border-white/10">
                        <Label htmlFor="apiKey">Gemini API Key (Required for AI)</Label>
                        <Input id="apiKey" name="apiKey" type="password" placeholder="AIzaSy..." value={formData.apiKey || ""} onChange={handleChange} />
                        <p className="text-xs text-muted-foreground">Get one free at <a href="https://aistudio.google.com/app/apikey" target="_blank" className="underline hover:text-white">Google AI Studio</a></p>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" variant="premium" className="w-full" disabled={isSaving}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Rocket className="mr-2 h-4 w-4" />}
                        {isSaving ? "Saving..." : "Save & Continue"}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}
