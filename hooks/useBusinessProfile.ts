import { useState, useEffect } from 'react';

export interface BusinessProfile {
    name: string;
    niche: string;
    targetAudience: string;
    tone: string;
    usp: string; // Unique Selling Proposition
    website?: string;
    apiKey?: string;
}

export function useBusinessProfile() {
    const [profile, setProfile] = useState<BusinessProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem('socialsense_profile');
        if (stored) {
            try {
                setProfile(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse business profile", e);
            }
        }
        setLoading(false);
    }, []);

    const saveProfile = (newProfile: BusinessProfile) => {
        localStorage.setItem('socialsense_profile', JSON.stringify(newProfile));
        setProfile(newProfile);
    };

    return { profile, loading, saveProfile };
}
