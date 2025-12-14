"use client";

import { useState } from "react";
import { Camera, CheckCircle, AlertCircle } from "lucide-react";
import { useTournament } from "@/hooks/useTournament";
import { compressImage } from "@/lib/image";
import { RegisteredPlayer } from "@/lib/types";

export function RegisterPage() {
    const { registrations, settings, storage, isLoaded } = useTournament();
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
    });
    const [photo, setPhoto] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState("");

    if (!isLoaded) return <div className="p-8 text-center text-zinc-500">Loading registrations...</div>;

    const maxPlayers = settings.maxPlayers;
    const isFull = registrations.length >= maxPlayers;
    // Waitlist active if full OR status is not 'open' (e.g. running or finished)
    // Note: We need to check if settings.status exists, defaulting to 'open' if checking against old storage
    const isWaitlistMode = isFull || (settings.status && settings.status !== 'open');

    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith("image/")) {
                setError("Please upload a valid image file.");
                return;
            }
            try {
                const compressed = await compressImage(file);
                setPhoto(compressed);
                setError("");
            } catch {
                setError("Error processing image. Try another.");
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Validation: Name, Phone, Email, Photo required
        if (!formData.name || !formData.phone || !formData.email || !photo) {
            setError("Please fill in all required fields (Name, Phone, Email, Photo).");
            return;
        }

        // Check for duplicates
        const isDuplicate = registrations.some(p =>
            p.name.toLowerCase() === formData.name.toLowerCase() ||
            p.email?.toLowerCase() === formData.email.toLowerCase() ||
            p.phone === formData.phone
        );

        if (isDuplicate) {
            setError("You are already registered! Use different details if you are registering for someone else.");
            return;
        }

        setIsSubmitting(true);

        // Simulate delay for effect
        setTimeout(() => {
            const newPlayer: RegisteredPlayer = {
                id: crypto.randomUUID(),
                name: formData.name,
                phone: formData.phone,
                email: formData.email,
                photo: photo,
                registeredAt: new Date().toISOString(),
                isWaitlist: isWaitlistMode,
            };

            storage.saveRegistration(newPlayer);
            setIsSubmitting(false);
            setIsSuccess(true);
        }, 800);
    };

    const resetForm = () => {
        setFormData({ name: "", phone: "", email: "" });
        setPhoto(null);
        setIsSuccess(false);
        setError("");
    };

    if (isSuccess) {
        return (
            <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-6 text-center animate-in fade-in zoom-in duration-500">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-500/20 text-green-500">
                    <CheckCircle className="h-12 w-12" />
                </div>
                <h2 className="text-3xl font-bold text-white">{isWaitlistMode ? "Added to Waitlist!" : "You're In!"}</h2>
                <p className="max-w-xs text-zinc-400">
                    {isWaitlistMode
                        ? `We'll notify ${formData.name} when a spot opens up or for the next tournament.`
                        : `Registration confirmed for ${formData.name}. Get ready to play!`}
                </p>
                <button
                    onClick={resetForm}
                    className="rounded-full bg-zinc-800 px-8 py-3 font-bold text-white transition hover:bg-zinc-700"
                >
                    Register Another Player
                </button>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-md space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-black uppercase italic tracking-tighter text-white sm:text-4xl">
                    {isWaitlistMode ? (
                        <>Join <span className="text-zinc-500">Waitlist</span></>
                    ) : (
                        <>Player <span className="text-amber-500">Registration</span></>
                    )}
                </h1>
                <p className="mt-2 text-zinc-400">
                    {isWaitlistMode
                        ? "Tournament is full/active. Secure your spot for next time!"
                        : "Join the Curry & BurgerNow FC 26 Tournament"}
                </p>
            </div>

            {/* Progress / Status */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm">
                <div className="mb-2 flex items-center justify-between">
                    <span className="font-bold text-zinc-300">Available Spots</span>
                    <span className={`font-mono text-xl font-bold ${isFull ? "text-red-500" : "text-amber-500"}`}>
                        {registrations.filter(p => !p.isWaitlist).length} <span className="text-zinc-600">/</span> {maxPlayers}
                    </span>
                </div>
                <div className="h-4 w-full overflow-hidden rounded-full bg-zinc-800">
                    <div
                        className={`h-full transition-all duration-1000 ease-out ${isFull ? "bg-zinc-600" : "bg-gradient-to-r from-amber-500 to-yellow-300"}`}
                        style={{ width: `${Math.min((registrations.filter(p => !p.isWaitlist).length / maxPlayers) * 100, 100)}%` }}
                    />
                </div>
                {isWaitlistMode && (
                    <div className="mt-4 flex items-center justify-center space-x-2 rounded-lg bg-zinc-800 p-2 text-sm font-bold text-zinc-400">
                        <AlertCircle className="h-4 w-4" />
                        <span>ACCEPTING WAITLIST ENTRIES</span>
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Photo Upload */}
                <div className="group relative mx-auto flex h-40 w-40 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-full border-4 border-dashed border-zinc-700 bg-zinc-900/50 transition-colors hover:border-amber-500 hover:bg-zinc-800">
                    <input
                        type="file"
                        accept="image/*"
                        capture="user"
                        onChange={handlePhotoChange}
                        className="absolute inset-0 z-20 cursor-pointer opacity-0"
                    />
                    {photo ? (
                        <img src={photo} alt="Upload Preview" className="h-full w-full object-cover" />
                    ) : (
                        <div className="flex flex-col items-center space-y-2 text-zinc-500 group-hover:text-amber-500">
                            <Camera className="h-8 w-8" />
                            <span className="text-xs font-bold uppercase">Take Photo</span>
                        </div>
                    )}
                </div>

                {/* Inputs */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Full Name *</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 font-semibold text-white placeholder-zinc-600 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                            placeholder="e.g. Farooq AK"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Phone Number *</label>
                        <input
                            type="tel"
                            required
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 font-semibold text-white placeholder-zinc-600 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                            placeholder="e.g. 333 638 6399"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Email *</label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 font-semibold text-white placeholder-zinc-600 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                            placeholder="efak621@gmail.com"
                        />
                    </div>
                </div>

                {error && (
                    <div className="rounded-lg bg-red-500/10 p-3 text-center text-sm font-bold text-red-500 animate-in slide-in-from-top-2">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isSubmitting || !photo}
                    className={`w-full rounded-xl px-6 py-4 text-base font-black uppercase tracking-wide text-black shadow-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:shadow-none disabled:hover:scale-100 ${isWaitlistMode
                        ? "bg-zinc-200 hover:bg-white"
                        : "bg-gradient-to-r from-amber-500 to-yellow-400 hover:shadow-[0_0_30px_rgba(251,191,36,0.4)]"
                        }`}
                >
                    {isSubmitting ? "Processing..." : isWaitlistMode ? "Join Waitlist" : "Join Tournament"}
                </button>
            </form>
        </div>
    );
}
