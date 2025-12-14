import { useState, useEffect } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, getDocs, writeBatch, limit } from 'firebase/firestore';
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
    const [username, setUsername] = useState<string | null>(null);
    const { settings } = useTournament();

    useEffect(() => {
        // Load username from local storage if exists
        const storedName = localStorage.getItem('chat_username');
        if (storedName) setUsername(storedName);
    }, []);

    useEffect(() => {
        if (!db) return;

        // Subscribe to messages
        const q = query(collection(db, "messages"), orderBy("timestamp", "asc"), limit(100));
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
