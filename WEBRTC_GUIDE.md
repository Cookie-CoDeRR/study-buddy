# WebRTC Video/Audio Calling Integration Guide

## Overview
This guide explains how to integrate the WebRTC video/audio calling system into your Study Buddy application.

## Components Created

### 1. `WebRTCService` (`src/lib/webrtc-service.ts`)
A reusable service class that handles all WebRTC peer connection logic.

**Key Methods:**
- `startCall(videoEnabled)` - Acquire local media and initialize peer connection
- `createOffer()` - Create SDP offer (for call initiator)
- `handleOffer(offer)` - Handle incoming offer and create answer
- `handleAnswer(answer)` - Handle incoming answer
- `addIceCandidate(candidate)` - Add ICE candidate for NAT traversal
- `toggleAudio(enabled)` - Mute/unmute microphone
- `toggleVideo(enabled)` - Turn camera on/off
- `endCall()` - Clean up resources
- `isConnected()` - Check if call is active

**Callbacks:**
```typescript
onLocalStream?: (stream: MediaStream) => void;     // Local video/audio ready
onRemoteStream?: (stream: MediaStream) => void;    // Remote video/audio received
onConnectionStateChange?: (state: string) => void; // Connection state changed
onIceCandidate?: (candidate: RTCIceCandidate) => void; // ICE candidate generated
onError?: (error: Error) => void;                  // Error occurred
```

### 2. `VideoCallWebRTC` Component (`src/components/VideoCallWebRTC.tsx`)
UI component for video/audio calls with picture-in-picture layout.

**Features:**
- Full-screen remote video
- Picture-in-picture local video (bottom-right)
- Mute/Unmute button
- Camera on/off button
- Call duration tracking
- Connection state indicator
- End call button

## Integration Steps

### Step 1: Set Up Socket Events (Backend/Signaling)

You need to handle these socket events for signaling:

```typescript
// When initiator creates offer
socket.emit('call-offer', {
  to: recipientId,
  from: callerId,
  offer: offer
});

// When recipient receives offer
socket.on('call-offer', (data) => {
  // Pass data.offer to VideoCallWebRTC
});

// When recipient sends answer
socket.emit('call-answer', {
  to: callerId,
  from: recipientId,
  answer: answer
});

// When initiator receives answer
socket.on('call-answer', (data) => {
  // Pass data.answer to VideoCallWebRTC
});

// Exchange ICE candidates
socket.emit('ice-candidate', {
  to: remoteUserId,
  from: userId,
  candidate: candidate
});

socket.on('ice-candidate', (data) => {
  // Pass data.candidate to VideoCallWebRTC
});
```

### Step 2: Update StudyGroup Component

Replace AudioCall with VideoCallWebRTC:

```typescript
import { VideoCallWebRTC } from '@/components/VideoCallWebRTC';

// In your StudyGroupView component:
const callUI = viewMode === 'call' && selectedMember ? (
  <VideoCallWebRTC
    callerId={userId}
    callerName={userProfile?.full_name || 'You'}
    callerAvatar={userProfile?.profile_picture_url}
    recipientId={selectedMember.userId}
    recipientName={selectedMember.name}
    recipientAvatar={selectedMember.profilePicture}
    isInitiator={true}
    onOffer={(offer) => {
      // Emit offer via socket to backend
      socket.emit('call-offer', {
        to: selectedMember.userId,
        from: userId,
        offer: offer
      });
    }}
    onIceCandidate={(candidate) => {
      // Emit ICE candidate via socket
      socket.emit('ice-candidate', {
        to: selectedMember.userId,
        from: userId,
        candidate: candidate
      });
    }}
    onEnd={() => {
      setViewMode('overview');
      setSelectedMember(null);
      setShowCallPanel(false);
      setCallInitiatedByMe(false);
    }}
  />
) : null;
```

### Step 3: Handle Socket Events

Add these socket listeners:

```typescript
// Listen for incoming offers
useEffect(() => {
  socket.on('call-offer', async (data) => {
    setIncomingCall({
      callerId: data.from,
      callerName: data.fromName,
      offer: data.offer
    });
  });

  return () => {
    socket.off('call-offer');
  };
}, []);

// Listen for incoming answers
useEffect(() => {
  socket.on('call-answer', (data) => {
    if (webrtcServiceRef.current) {
      webrtcServiceRef.current.handleAnswer(data.answer);
    }
  });

  return () => {
    socket.off('call-answer');
  };
}, []);

// Listen for ICE candidates
useEffect(() => {
  socket.on('ice-candidate', async (data) => {
    if (webrtcServiceRef.current) {
      await webrtcServiceRef.current.addIceCandidate(data.candidate);
    }
  });

  return () => {
    socket.off('ice-candidate');
  };
}, []);
```

## STUN/TURN Servers

The current implementation uses Google's public STUN server:
```
stun:stun.l.google.com:19302
```

For production, add TURN servers for better connectivity:

```typescript
const iceServers = [
  { urls: 'stun:stun.l.google.com:19302' },
  {
    urls: 'turn:your-turn-server.com:3478',
    username: 'username',
    credential: 'password'
  }
];
```

## Browser Support

- Chrome 65+
- Firefox 55+
- Safari 12+
- Edge 79+

## Known Limitations

1. **No real signaling backend** - You need to implement Socket.IO handlers
2. **Single peer connection** - Currently supports 1-to-1 calls only
3. **No media recording** - Add WebRTC MediaRecorder for recording
4. **No screen sharing** - Can be added with `getDisplayMedia()`

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Permission denied" | User must allow camera/microphone access |
| No video appears | Check browser console for WebRTC errors |
| Connection fails | Ensure STUN/TURN servers are accessible |
| Audio not working | Check browser's microphone settings |
| High latency | May indicate NAT traversal issues, add TURN server |

## Next Steps

1. Implement backend signaling (Socket.IO handlers)
2. Add TURN server configuration for production
3. Implement call reject/hangup notifications
4. Add call recording functionality
5. Implement group video calling (requires SFU/MCU)
