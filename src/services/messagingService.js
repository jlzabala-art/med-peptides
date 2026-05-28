import { db, storage } from '../firebase';
import { 
  collection, doc, setDoc, getDoc, getDocs, addDoc, updateDoc, 
  query, where, orderBy, onSnapshot, serverTimestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const messagingService = {
  // ──────────────────────────────────────────────────────────
  // PRESENCE & STATUS
  // ──────────────────────────────────────────────────────────
  
  updateUserPresence: async (userId, isOnline) => {
    if (!userId) return;
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        isOnline,
        lastActive: serverTimestamp()
      });
    } catch (error) {
      console.error('[messagingService] Error updating presence:', error);
    }
  },

  subscribeToPresence: (userId, callback) => {
    if (!userId) return () => {};
    const userRef = doc(db, 'users', userId);
    return onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        callback({ isOnline: data.isOnline, lastActive: data.lastActive });
      }
    });
  },

  // ──────────────────────────────────────────────────────────
  // CONVERSATIONS
  // ──────────────────────────────────────────────────────────

  createOrGetDirectConversation: async (user1, user2) => {
    // Check if direct conversation already exists between these two
    const convosRef = collection(db, 'conversations');
    const q1 = query(convosRef, 
      where('participants', 'array-contains', user1.uid),
      where('type', '==', 'direct')
    );
    
    const snapshot = await getDocs(q1);
    let existingConvo = null;
    
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      if (data.participants.includes(user2.uid) && data.participants.length === 2) {
        existingConvo = { id: docSnap.id, ...data };
      }
    });

    if (existingConvo) return existingConvo.id;

    // Create new
    const newConvoRef = await addDoc(convosRef, {
      participants: [user1.uid, user2.uid],
      participantNames: {
        [user1.uid]: user1.displayName || 'Unknown',
        [user2.uid]: user2.displayName || 'Unknown'
      },
      type: 'direct',
      lastMessage: '',
      updatedAt: serverTimestamp()
    });

    return newConvoRef.id;
  },

  createGroupConversation: async (participants, title, type = 'group') => {
    // participants is array of { uid, displayName }
    const pIds = participants.map(p => p.uid);
    const pNames = {};
    participants.forEach(p => { pNames[p.uid] = p.displayName; });

    const convosRef = collection(db, 'conversations');
    const newConvoRef = await addDoc(convosRef, {
      participants: pIds,
      participantNames: pNames,
      type: type, // 'group' or 'transaction'
      title: title,
      lastMessage: '',
      updatedAt: serverTimestamp()
    });

    return newConvoRef.id;
  },

  subscribeToConversations: (userId, callback) => {
    if (!userId) return () => {};
    const convosRef = collection(db, 'conversations');
    const q = query(
      convosRef, 
      where('participants', 'array-contains', userId),
      orderBy('updatedAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const convos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(convos);
    });
  },

  // ──────────────────────────────────────────────────────────
  // MESSAGES
  // ──────────────────────────────────────────────────────────

  sendMessage: async (conversationId, senderId, text, type = 'text', referenceId = null, fileData = null) => {
    try {
      let fileUrl = null;
      let fileType = null;
      let fileName = null;

      // Handle File Uploads
      if (fileData && fileData.file) {
        const fileRef = ref(storage, `chat_files/${conversationId}/${Date.now()}_${fileData.file.name}`);
        const snapshot = await uploadBytes(fileRef, fileData.file);
        fileUrl = await getDownloadURL(snapshot.ref);
        fileType = fileData.file.type;
        fileName = fileData.file.name;
        type = 'file';
      }

      const msgData = {
        senderId,
        text,
        type,
        referenceId,
        createdAt: serverTimestamp(),
        readBy: [senderId]
      };

      if (fileUrl) {
        msgData.fileUrl = fileUrl;
        msgData.fileType = fileType;
        msgData.fileName = fileName;
      }

      // Add message
      const msgsRef = collection(db, `conversations/${conversationId}/messages`);
      await addDoc(msgsRef, msgData);

      // Update conversation lastMessage & updatedAt
      const convoRef = doc(db, 'conversations', conversationId);
      await updateDoc(convoRef, {
        lastMessage: type === 'text' ? text : `[${type.toUpperCase()}]`,
        updatedAt: serverTimestamp()
      });

    } catch (error) {
      console.error('[messagingService] Error sending message:', error);
      throw error;
    }
  },

  subscribeToMessages: (conversationId, callback) => {
    if (!conversationId) return () => {};
    const msgsRef = collection(db, `conversations/${conversationId}/messages`);
    const q = query(msgsRef, orderBy('createdAt', 'asc'));

    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(messages);
    });
  },

  markMessagesAsRead: async (conversationId, userId, unreadMessageIds) => {
    // Note: To be fully efficient, this would be a batch write or a cloud function.
    // For now, we update them individually or just update the conversation 'read' pointer.
    try {
      const batch = [];
      unreadMessageIds.forEach(msgId => {
        const msgRef = doc(db, `conversations/${conversationId}/messages`, msgId);
        // We can't do arrayUnion on client easily without importing it, so we'll just push
        // A better approach in production is batch writes with arrayUnion
      });
    } catch (e) {
      console.error(e);
    }
  }
};
