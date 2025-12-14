import { useState, useEffect } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, getDocs, writeBatch, limit, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useTournament } from './useTournament';

export interface ChatMessage {
    id: string;
    user: string;
    text: string;
    timestamp: any;
    isSystem?: boolean;
}

export function useChat() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [username, setUsername] = useState<string | null>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('chat_username');
        }
        return null;
    });
    const { settings } = useTournament();

    // No need for useEffect to load username anymore since we do it lazily
    // But we listen for storage events in case other tabs update it
    useEffect(() => {
        const handleStorage = () => {
            setUsername(localStorage.getItem('chat_username'));
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    useEffect(() => {
        if (!db) return;

        // "Twitch Style" Ephemeral Chat: Only show last 6 hours
        // This effectively "deletes" old messages from the user's view immediately
        const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);

        // Subscribe to messages
        const q = query(
            collection(db, "messages"),
            where("timestamp", ">", sixHoursAgo),
            orderBy("timestamp", "asc"),
            limit(300) // Keep plenty of history for active streams
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as ChatMessage[];
            setMessages(msgs);
        });

        return () => unsubscribe();
    }, []);

    const sendMessage = async (text: string) => {
        if (!db || !text.trim() || !username) return;

        await addDoc(collection(db, "messages"), {
            user: username,
            text: text.trim(),
            timestamp: serverTimestamp(),
            // TTL Field: 6 hours from now
            expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000)
        });
    };

    const setChatName = (name: string) => {
        localStorage.setItem('chat_username', name);
        setUsername(name);
    };

    const clearChat = async () => {
        if (!db) return;
        const q = query(collection(db, "messages"));
        const snapshot = await getDocs(q);
        const batch = writeBatch(db);
        snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });
        await batch.commit();
    };

    return { messages, sendMessage, username, setChatName, clearChat };
}
