import { LiveBracket } from "@/components/live-bracket";
import { StreamChat } from "@/components/stream-chat";

export default function Home() {
  return (
    <div className="flex min-h-screen">
      <div className="hidden md:block">
        <StreamChat />
      </div>
      <div className="flex-1 space-y-8 p-4 md:pl-80">
        <header className="text-center md:text-left">
          <h1 className="text-4xl font-black uppercase italic tracking-tighter text-white sm:text-6xl">
            Live <span className="text-amber-500">Bracket</span>
          </h1>
          <p className="mt-2 text-zinc-400">Monday FC 26 - Real Time Updates</p>
        </header>
        <LiveBracket />
      </div>
    </div>
  );
}
