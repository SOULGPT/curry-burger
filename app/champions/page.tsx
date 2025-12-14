import { PastChampions } from "@/components/past-champions";

export default function Page() {
    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-4xl font-black uppercase italic tracking-tighter text-white sm:text-6xl">
                    Hall of <span className="text-amber-500">Fame</span>
                </h1>
                <p className="mt-2 text-zinc-400">Legends of Curry & BurgerNow FC</p>
            </header>
            <PastChampions />
        </div>
    );
}
