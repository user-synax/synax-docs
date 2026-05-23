import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center bg-zinc-950 overflow-hidden">
            {/* Noise Texture Overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                    <filter id="noise">
                        <feTurbulence
                            type="fractalNoise"
                            baseFrequency="0.65"
                            numOctaves="3"
                            stitchTiles="stitch"
                        />
                    </filter>
                    <rect width="100%" height="100%" filter="url(#noise)" />
                </svg>
            </div>

            <main className="relative z-10 flex flex-col items-center text-center px-6">
                <div className="mb-8">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-zinc-50 mb-4">
                        synax<span className="text-violet-500">docs</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-zinc-400 font-medium">
                        Documents, built for speed.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                        asChild
                        size="lg"
                        className="bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-8 shadow-md shadow-zinc-950"
                    >
                        <Link href="/sign-up">Get Started</Link>
                    </Button>
                    <Button
                        asChild
                        variant="outline"
                        size="lg"
                        className="border-zinc-800 bg-zinc-900 text-zinc-50 hover:bg-zinc-800 rounded-lg px-8"
                    >
                        <Link href="/sign-in">Sign In</Link>
                    </Button>
                    <Button
                        asChild
                        variant="primary"
                        size="lg"
                        className="border-zinc-800 bg-zinc-900 text-zinc-50 hover:bg-zinc-800 rounded-lg px-8"
                    >
                        <Link href="/dashboard">Dashboard</Link>
                    </Button>
                </div>
            </main>

            <footer className="absolute bottom-8 text-zinc-600 text-sm">
                © {new Date().getFullYear()} synax-docs. All rights reserved.
            </footer>
        </div>
    );
}
