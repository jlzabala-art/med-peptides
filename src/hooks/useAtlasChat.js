import { useState, useEffect, useRef } from 'react';
import { getAI, getGenerativeModel } from 'firebase/ai';
import app from '../firebase';
import { useAuth } from '../context/AuthContext';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

export function useAtlasChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    if (!app) return;
    try {
      const ai = getAI(app);
      const model = getGenerativeModel(ai, { 
        model: 'gemini-1.5-flash',
        systemInstruction: "You are Atlas, an expert clinical and operational AI assistant for a peptide wholesaler and medical platform. Provide concise, actionable insights."
      });
      chatRef.current = model.startChat({ history: [] });
    } catch (err) {
      console.error('Error initializing Vertex AI:', err);
    }
  }, []);

  // Subscribe to persistent session in Firestore
  useEffect(() => {
    if (!user?.uid) return;
    
    // Simplification for now: Just a single latest thread per user
    const messagesRef = collection(db, 'users', user.uid, 'atlas_sessions', 'latest', 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [user]);

  const sendMessage = async (text, contextData = null) => {
    if (!text.trim() || !user?.uid) return;

    setIsProcessing(true);
    
    const messagesRef = collection(db, 'users', user.uid, 'atlas_sessions', 'latest', 'messages');
    
    // Save user message
    await addDoc(messagesRef, {
      role: 'user',
      text,
      createdAt: serverTimestamp()
    });

    try {
      // If we have context data (like a row from DataTable), we can inject it into the prompt invisibly
      const prompt = contextData 
        ? `Context Data: ${JSON.stringify(contextData)}\n\nUser Question: ${text}` 
        : text;

      let fullResponse = "";
      
      // We can use stream to show partial results if we want, but for simplicity let's generate content
      if (chatRef.current) {
        const result = await chatRef.current.sendMessageStream(prompt);
        let currentText = "";
        
        // Add a temporary assistant message that we will update
        const tempMsgRef = await addDoc(messagesRef, {
          role: 'atlas',
          text: '...',
          createdAt: serverTimestamp()
        });

        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          currentText += chunkText;
          // Could update Firestore or local state here for streaming effect, but local state is overridden by onSnapshot.
        }
        
        // Final update to Firestore
        await addDoc(messagesRef, {
          role: 'atlas',
          text: currentText,
          createdAt: serverTimestamp()
        });
        
        // Delete temp message
        await deleteDoc(tempMsgRef);
      }
    } catch (error) {
      console.error('Atlas Chat Error:', error);
      await addDoc(messagesRef, {
        role: 'atlas',
        text: 'I encountered an error processing your request.',
        isError: true,
        createdAt: serverTimestamp()
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    messages,
    sendMessage,
    isProcessing
  };
}
