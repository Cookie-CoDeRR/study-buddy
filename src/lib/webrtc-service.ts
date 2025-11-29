/**
 * WebRTC Service for 1-to-1 Video/Audio Calls
 * Handles all WebRTC peer connection logic and signaling
 */

interface WebRTCConfig {
  iceServers: RTCIceServer[];
}

interface WebRTCCallbacks {
  onLocalStream?: (stream: MediaStream) => void;
  onRemoteStream?: (stream: MediaStream) => void;
  onConnectionStateChange?: (state: string) => void;
  onIceCandidate?: (candidate: RTCIceCandidate) => void;
  onError?: (error: Error) => void;
}

export class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private config: WebRTCConfig;
  private callbacks: WebRTCCallbacks = {};

  constructor(config?: WebRTCConfig) {
    this.config = config || {
      iceServers: [
        {
          urls: 'stun:stun.l.google.com:19302',
        },
      ],
    };
  }

  /**
   * Set event callbacks
   */
  setCallbacks(callbacks: WebRTCCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  /**
   * Start a call - acquire local media and create peer connection
   */
  async startCall(videoEnabled: boolean = true): Promise<void> {
    try {
      // Get local media stream
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: videoEnabled,
        audio: true,
      });

      if (this.callbacks.onLocalStream) {
        this.callbacks.onLocalStream(this.localStream);
      }

      // Create peer connection
      this.createPeerConnection();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      if (this.callbacks.onError) {
        this.callbacks.onError(err);
      }
      throw err;
    }
  }

  /**
   * Create RTCPeerConnection and attach event handlers
   */
  private createPeerConnection(): void {
    try {
      this.peerConnection = new RTCPeerConnection({
        iceServers: this.config.iceServers,
      });

      // Handle remote stream
      this.peerConnection.ontrack = (event: RTCTrackEvent) => {
        if (event.streams && event.streams[0]) {
          if (this.callbacks.onRemoteStream) {
            this.callbacks.onRemoteStream(event.streams[0]);
          }
        }
      };

      // Handle ICE candidates
      this.peerConnection.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
        if (event.candidate && this.callbacks.onIceCandidate) {
          this.callbacks.onIceCandidate(event.candidate);
        }
      };

      // Handle connection state changes
      this.peerConnection.onconnectionstatechange = () => {
        if (this.peerConnection && this.callbacks.onConnectionStateChange) {
          this.callbacks.onConnectionStateChange(this.peerConnection.connectionState);
        }
      };

      // Add local tracks to connection
      if (this.localStream) {
        this.localStream.getTracks().forEach((track) => {
          if (this.localStream && this.peerConnection) {
            this.peerConnection.addTrack(track, this.localStream);
          }
        });
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      if (this.callbacks.onError) {
        this.callbacks.onError(err);
      }
      throw err;
    }
  }

  /**
   * Create and send call offer
   */
  async createOffer(): Promise<RTCSessionDescriptionInit | null> {
    try {
      if (!this.peerConnection) {
        throw new Error('Peer connection not initialized');
      }

      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      return offer;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      if (this.callbacks.onError) {
        this.callbacks.onError(err);
      }
      throw err;
    }
  }

  /**
   * Handle incoming offer and create answer
   */
  async handleOffer(
    offer: RTCSessionDescriptionInit
  ): Promise<RTCSessionDescriptionInit | null> {
    try {
      if (!this.peerConnection) {
        throw new Error('Peer connection not initialized');
      }

      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      return answer;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      if (this.callbacks.onError) {
        this.callbacks.onError(err);
      }
      throw err;
    }
  }

  /**
   * Handle incoming answer
   */
  async handleAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    try {
      if (!this.peerConnection) {
        throw new Error('Peer connection not initialized');
      }

      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      if (this.callbacks.onError) {
        this.callbacks.onError(err);
      }
      throw err;
    }
  }

  /**
   * Add ICE candidate
   */
  async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    try {
      if (!this.peerConnection) {
        throw new Error('Peer connection not initialized');
      }

      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      if (this.callbacks.onError) {
        this.callbacks.onError(err);
      }
      throw err;
    }
  }

  /**
   * Toggle audio track
   */
  toggleAudio(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = enabled;
      });
    }
  }

  /**
   * Toggle video track
   */
  toggleVideo(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach((track) => {
        track.enabled = enabled;
      });
    }
  }

  /**
   * End call and cleanup resources
   */
  endCall(): void {
    // Stop all tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        track.stop();
      });
      this.localStream = null;
    }

    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
  }

  /**
   * Get current connection state
   */
  getConnectionState(): string {
    return this.peerConnection?.connectionState || 'disconnected';
  }

  /**
   * Check if call is active
   */
  isConnected(): boolean {
    return this.peerConnection?.connectionState === 'connected';
  }
}
