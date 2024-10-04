import room from "./room";
import { createRoom, updateIceCandidates } from "./supabaseHandler";

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
        const addCandy = await this.pc.addIceCandidate(candidate);
        return addCandy;
      })
    );
  }

  async createOffer() {
    if (!this.pc) return;
    const dataChannel = this.pc.createDataChannel("test");
    console.log(dataChannel);
    dataChannel.onopen = () => {
      console.log("dataChannel opened");
    };
    dataChannel.onmessage = (event) => {
      console.log("dataChannel message", event);
    };
    setInterval(() => {
      if (dataChannel.readyState !== "open") return;
      console.log("sending");
      dataChannel.send("Hello from the sender");
    }, 2000);
    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);
    this.createdOffer = true;
    const roomData = {
      sdpOffer: offer,
      iceCandidates: Object.values(this.iceCandidates),
      token: "test",
    };
    const { data, error } = await createRoom(roomData);
    if (!error) {
      room.setData(data);
      await updateIceCandidates({
        id: data.id,
        token: data.token,
        iceCandidates: Object.values(this.iceCandidates),
      });
    }
    return offer;
  }

  async createAnswer(sessionDescription: RTCSessionDescriptionInit) {
    if (!this.pc) return;
    const offerDescription = new RTCSessionDescription(sessionDescription);
    this.pc.setRemoteDescription(offerDescription);
    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);
    this.pc.addEventListener("datachannel", (event) => {
      const dataChannel = event.channel;
      dataChannel.onopen = () => {
        console.log("dataChannel opened");
      };
      dataChannel.onmessage = (event) => {
        console.log("dataChannel message", event);
      };
    });
    return answer;
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
