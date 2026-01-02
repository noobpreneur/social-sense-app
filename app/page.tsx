"use client"

import { useState, useEffect } from "react"
import { useBusinessProfile } from "@/hooks/useBusinessProfile"
import { BusinessProfileForm } from "@/components/BusinessProfileForm"
import { UrlInput } from "@/components/UrlInput"
import { PostPreview } from "@/components/PostPreview"
import { CommentList } from "@/components/CommentList"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { Settings } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Home() {
  const { profile, loading, saveProfile } = useBusinessProfile()
  const [isEditingProfile, setIsEditingProfile] = useState(false)

  const [postUrl, setPostUrl] = useState("")
  const [postData, setPostData] = useState<any>(null)
  const [comments, setComments] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  // Show profile form if not loading and no profile exists, or if editing
  const showProfileForm = !loading && (!profile || isEditingProfile)

  const handleProfileComplete = () => {
    setIsEditingProfile(false)
    toast.success("Business profile saved!")
  }

  const handleSearch = async (url: string) => {
    setIsProcessing(true)
    setPostUrl(url)
    setPostData(null)
    setComments([])

    try {
      // 1. Scrape
      const scrapeRes = await fetch('/api/scrape', {
        method: 'POST',
        body: JSON.stringify({ url }),
        headers: { 'Content-Type': 'application/json' }
      })

      if (!scrapeRes.ok) throw new Error("Failed to fetch post")

      const scrapedData = await scrapeRes.json()
      setPostData(scrapedData)

      // 2. Generate
      await generateComments(scrapedData)

    } catch (error) {
      console.error(error)
      toast.error("Could not fetch post details. Check the URL and try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const generateComments = async (data: any) => {
    try {
      const genRes = await fetch('/api/generate', {
        method: 'POST',
        body: JSON.stringify({ postData: data, businessProfile: profile }),
        headers: { 'Content-Type': 'application/json' }
      })

      if (!genRes.ok) throw new Error("Generaton failed")

      const { comments } = await genRes.json()
      setComments(comments)
    } catch (e) {
      toast.error("Failed to generate comments.")
    }
  }

  if (loading) return null

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-indigo-950/20 p-4 md:p-8">

      {/* Header */}
      <header className="max-w-4xl mx-auto flex justify-between items-center mb-12">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center font-bold text-white">S</div>
          <h1 className="text-2xl font-bold tracking-tight">SocialSense</h1>
        </div>
        {profile && !showProfileForm && (
          <Button variant="ghost" size="sm" onClick={() => setIsEditingProfile(true)} className="text-muted-foreground hover:text-white">
            <Settings className="w-4 h-4 mr-2" />
            {profile.name}
          </Button>
        )}
      </header>

      <div className="max-w-4xl mx-auto">
        {showProfileForm ? (
          <div className="max-w-lg mx-auto py-12 animate-in fade-in zoom-in-95 duration-500">
            <BusinessProfileForm onComplete={handleProfileComplete} onSave={saveProfile} />
          </div>
        ) : (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="text-center space-y-4">
              <h2 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-indigo-200 pb-2">
                Viral Comments. <br /> Zero Effort.
              </h2>
              <p className="text-gray-400 text-lg max-w-xl mx-auto">
                Paste an Instagram link and let AI generate authentic, promotion-safe comments using your brand voice.
              </p>
            </div>

            <div className="sticky top-4 z-10 backdrop-blur-sm bg-black/10 p-4 rounded-xl -mx-4">
              <UrlInput onSearch={handleSearch} isLoading={isProcessing} />
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-start">
              {postData && (
                <div className="animate-in fade-in slide-in-from-left-4 duration-500 delay-100">
                  <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">Target Post</h3>
                  <PostPreview data={postData} />
                </div>
              )}

              {comments.length > 0 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500 delay-200">
                  <CommentList comments={comments} onRegenerate={() => generateComments(postData)} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
