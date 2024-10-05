import * as supabaseHandler from "./supabaseHandler";
import webRTC from "./webrtcHandler";

export type RoomData = {
  id: number;
  token: string;
  iceCandidates: RTCIceCandidateInit[];
  sdpOffer: RTCSessionDescriptionInit;
};

class Room {
  id: number | null = null;
  token: string | null = null;
  iceCandidates: Record<string, RTCIceCandidateInit> = {};
  sdpOffer: RTCSessionDescriptionInit | null = null;

  constructor() {
    webRTC.registerIceCandidateCallback((candidate) => {
      const hash = this.iceCandidateHashGenerator(candidate);
      if (this.iceCandidates[hash]) return null;
      this.iceCandidates[hash] = candidate;
      if (this.id && this.token) {
        supabaseHandler.throttledUpdateIceCandidates({
          id: this.id,
          token: this.token,
          iceCandidates: Object.values(this.iceCandidates),
        });
      }
    });
  }

  setData(data: RoomData) {
    this.id = data.id;
    this.token = data.token;
    this.iceCandidates = data.iceCandidates.reduce(
      (acc, candidate) => ({
        ...acc,
        [this.iceCandidateHashGenerator(candidate)]: candidate,
      }),
      this.iceCandidates
    );
    this.sdpOffer = data.sdpOffer;
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
        const hash = this.iceCandidateHashGenerator(candidate);
        if (this.iceCandidates[hash]) return null;
        const addCandy = await webRTC.addIceCandidate(candidate);
        this.iceCandidates[hash] = candidate;
        return addCandy;
      })
    );
  }

  // ice_candidates take some time to generate so we need to register callback and update them later
  async createRoom() {
    const offer = await webRTC.createOffer();
    if (!offer) return null;
    const roomData = {
      sdpOffer: offer,
      iceCandidates: Object.values(this.iceCandidates),
      token: "test",
    };
    const { data, error } = await supabaseHandler.createRoom(roomData);
    if (error) return null;
    this.setData(data);
    await supabaseHandler.updateIceCandidates({
      id: data.id,
      token: data.token,
      iceCandidates: Object.values(this.iceCandidates),
    });
    supabaseHandler.subscribeToSdpAnswers(data.id, async (payload) => {
      if (payload.eventType === "INSERT") {
        const { sdp_answer: answer } = payload.new;
        await webRTC.acceptAnswer(answer);
      }
    });
    return roomData;
  }

  async loadRoom(id: number, token: string) {
    const { data, error } = await supabaseHandler.getRoom({
      id,
      token,
    });
    if (!error) {
      this.setData(data);
      return data;
    }
    return null;
  }

  async joinRoom(id: number, token: string) {
    const roomToJoin = new Room();
    let roomData = await roomToJoin.loadRoom(id, token);
    if (!roomData) return null;
    webRTC.registerWebRTCConfirmationListeners();
    const answer = await webRTC.createAnswer(roomData.sdpOffer);
    if (!answer) return null;
    this.addIceCandidates(roomData.iceCandidates);
    await supabaseHandler.sendSdpAnswer({
      id: roomData.id,
      token: roomData.token,
      answer,
    });
  }
}

const room = new Room();

export default room;
