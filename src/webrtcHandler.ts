import room from "./room";
import { updateIceCandidates } from "./supabaseHandler";

const servers = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun.l.google.com:5349" },
    { urls: "stun:stun1.l.google.com:3478" },
    { urls: "stun:stun1.l.google.com:5349" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:5349" },
    { urls: "stun:stun3.l.google.com:3478" },
    { urls: "stun:stun3.l.google.com:5349" },
    { urls: "stun:stun4.l.google.com:19302" },
    { urls: "stun:stun4.l.google.com:5349" },
  ],
  iceCandidatePoolSize: 10,
};

class WebRTC {
  pc: RTCPeerConnection | null = null;
  iceCandidates: Record<string, RTCIceCandidateInit> = {};
  createdOffer: boolean = false;
  dataChannels: RTCDataChannel[] = [];

  constructor() {
    this.pc = new RTCPeerConnection(servers);
    this.pc.onicecandidate = (event) => {
      if (event.candidate === null) return;
      const candidateData = event.candidate;
      this.iceCandidates[this.iceCandidateHashGenerator(candidateData)] =
        candidateData;

      if (room.id && room.token) {
        updateIceCandidates({
          id: room.id,
          token: room.token,
          iceCandidates: Object.values(this.iceCandidates),
        });
      }
    };
    this.pc.oniceconnectionstatechange = (event) => {
      console.log(event);
    };
  }

  iceCandidateHashGenerator(candidate: RTCIceCandidateInit) {
    return `${candidate.candidate}#${candidate.sdpMid}#${candidate.sdpMLineIndex}`;
  }

  async addIceCandidates(
    iceCandidates: RTCIceCandidateInit[] | RTCIceCandidateInit
  ) {
    const candidates = Array.isArray(iceCandidates)
      ? iceCandidates
      : [iceCandidates];
    await Promise.all(
      candidates.map(async (candidate) => {
        if (!this.pc) return null;
        const hash = this.iceCandidateHashGenerator(candidate);
        if (this.iceCandidates[hash]) return null;
        const addCandy = await this.pc.addIceCandidate(candidate);
        this.iceCandidates[hash] = candidate;
        return addCandy;
      })
    );
  }

  async createOffer() {
    if (!this.pc) return null;
    const dataChannel = this.pc.createDataChannel("test");
    setInterval(() => {
      if (dataChannel.readyState !== "open") return;
      dataChannel.send("marco");
    }, 2000);

    dataChannel.addEventListener("message", (event) => {
      const message = event.data;
      console.log("dataChannel received:", message);
      if (message === "marco") dataChannel.send("polo");
    });

    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);
    this.createdOffer = true;
    return offer;
  }

  async createAnswer(sessionDescription: RTCSessionDescriptionInit) {
    if (!this.pc) return;
    const offerDescription = new RTCSessionDescription(sessionDescription);
    this.pc.setRemoteDescription(offerDescription);
    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);
    return answer;
  }

  registerWebRTCConfirmationListeners() {
    if (!this.pc) return;
    this.pc.addEventListener("datachannel", (event) => {
      const dataChannel = event.channel;
      this.dataChannels.push(dataChannel);
      dataChannel.addEventListener("message", (event) => {
        const message = event.data;
        console.log("dataChannel received:", message);
        if (message === "marco") dataChannel.send("polo");
      });
    });
  }

  async acceptAnswer(answer: RTCSessionDescriptionInit) {
    if (!this.pc) return;
    const answerDescription = new RTCSessionDescription(answer);
    await this.pc.setRemoteDescription(answerDescription);
    return answerDescription;
  }
}

const webRTC = new WebRTC();

export default webRTC;
