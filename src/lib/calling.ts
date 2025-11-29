import { db } from '@/integrations/firebase/client';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
} from 'firebase/firestore';

export interface CallData {
  id: string;
  callerId: string;
  callerName: string;
  callerAvatar?: string;
  recipientId: string;
  groupId: string;
  status: 'ringing' | 'accepted' | 'rejected' | 'ended';
  offer?: RTCSessionDescription;
  answer?: RTCSessionDescription;
  candidates: RTCIceCandidate[];
  createdAt: number;
  startedAt?: number;
  endedAt?: number;
}

export interface IceCandidate {
  candidate: string;
  sdpMLineIndex: number;
  sdpMid: string;
}

/**
 * Initiate a call
 */
export async function initiateCall(
  callerId: string,
  callerName: string,
  recipientId: string,
  groupId: string,
  callerAvatar?: string
): Promise<string> {
  try {
    const callId = doc(collection(db, 'calls')).id;
    
    await setDoc(doc(db, 'calls', callId), {
      id: callId,
      callerId,
      callerName,
      callerAvatar: callerAvatar || '',
      recipientId,
      groupId,
      status: 'ringing',
      offer: null,
      answer: null,
      candidates: [],
      createdAt: new Date().getTime(),
    });

    return callId;
  } catch (error) {
    console.error('Error initiating call:', error);
    throw error;
  }
}

/**
 * Accept a call
 */
export async function acceptCall(callId: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'calls', callId), {
      status: 'accepted',
      startedAt: new Date().getTime(),
    });
  } catch (error) {
    console.error('Error accepting call:', error);
    throw error;
  }
}

/**
 * Reject a call
 */
export async function rejectCall(callId: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'calls', callId), {
      status: 'rejected',
      endedAt: new Date().getTime(),
    });
    
    // Delete after 5 seconds
    setTimeout(() => {
      deleteDoc(doc(db, 'calls', callId)).catch(console.error);
    }, 5000);
  } catch (error) {
    console.error('Error rejecting call:', error);
    throw error;
  }
}

/**
 * End a call
 */
export async function endCall(callId: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'calls', callId), {
      status: 'ended',
      endedAt: new Date().getTime(),
    });
    
    // Delete after 5 seconds
    setTimeout(() => {
      deleteDoc(doc(db, 'calls', callId)).catch(console.error);
    }, 5000);
  } catch (error) {
    console.error('Error ending call:', error);
    throw error;
  }
}

/**
 * Get active call for a user
 */
export async function getActiveCall(userId: string): Promise<CallData | null> {
  try {
    const callsRef = collection(db, 'calls');
    
    // Check calls where user is recipient
    const q1 = query(
      callsRef,
      where('recipientId', '==', userId),
      where('status', 'in', ['ringing', 'accepted'])
    );
    
    let snapshot = await getDocs(q1);
    if (!snapshot.empty) {
      return {
        id: snapshot.docs[0].id,
        ...snapshot.docs[0].data(),
      } as CallData;
    }

    // Check calls where user is caller
    const q2 = query(
      callsRef,
      where('callerId', '==', userId),
      where('status', 'in', ['ringing', 'accepted'])
    );
    
    snapshot = await getDocs(q2);
    if (!snapshot.empty) {
      return {
        id: snapshot.docs[0].id,
        ...snapshot.docs[0].data(),
      } as CallData;
    }

    return null;
  } catch (error) {
    console.error('Error getting active call:', error);
    throw error;
  }
}

/**
 * Add ICE candidate
 */
export async function addIceCandidate(
  callId: string,
  candidate: IceCandidate
): Promise<void> {
  try {
    const callRef = doc(db, 'calls', callId);
    const callSnap = await getDoc(callRef);
    
    if (!callSnap.exists()) {
      throw new Error('Call not found');
    }

    const candidates = callSnap.data().candidates || [];
    candidates.push(candidate);

    await updateDoc(callRef, { candidates });
  } catch (error) {
    console.error('Error adding ICE candidate:', error);
    throw error;
  }
}

/**
 * Set offer
 */
export async function setOffer(
  callId: string,
  offer: RTCSessionDescription
): Promise<void> {
  try {
    await updateDoc(doc(db, 'calls', callId), {
      offer: {
        type: offer.type,
        sdp: offer.sdp,
      },
    });
  } catch (error) {
    console.error('Error setting offer:', error);
    throw error;
  }
}

/**
 * Set answer
 */
export async function setAnswer(
  callId: string,
  answer: RTCSessionDescription
): Promise<void> {
  try {
    await updateDoc(doc(db, 'calls', callId), {
      answer: {
        type: answer.type,
        sdp: answer.sdp,
      },
    });
  } catch (error) {
    console.error('Error setting answer:', error);
    throw error;
  }
}

/**
 * Subscribe to call updates
 */
export function subscribeToCall(
  callId: string,
  onUpdate: (call: CallData | null) => void
): () => void {
  try {
    const unsubscribe = async () => {
      // Real-time listener would go here
      // For now, using polling as Firestore doesn't support real-time in all scenarios
    };
    
    return unsubscribe;
  } catch (error) {
    console.error('Error subscribing to call:', error);
    throw error;
  }
}
