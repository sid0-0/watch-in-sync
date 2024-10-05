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
  iceCandidates: RTCIceCandidateInit[] = [];
  sdpOffer: RTCSessionDescriptionInit | null = null;

  setData(data: RoomData) {
    this.id = data.id;
    this.token = data.token;
    this.iceCandidates = data.iceCandidates;
    this.sdpOffer = data.sdpOffer;
  }

  async createRoom() {
    const offer = await webRTC.createOffer();
    if (!offer) return null;
    const roomData = {
      sdpOffer: offer,
      iceCandidates: Object.values(webRTC.iceCandidates),
      token: "test",
    };
    const { data, error } = await supabaseHandler.createRoom(roomData);
    if (!error) {
      this.setData(data);
      await supabaseHandler.updateIceCandidates({
        id: data.id,
        token: data.token,
        iceCandidates: Object.values(webRTC.iceCandidates),
      });
      this.setData(data);
      return roomData;
    }
    return null;
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
    const { data } = await supabaseHandler.updateIceCandidates({
      id: roomData.id,
      token: roomData.token,
      iceCandidates: Object.values(webRTC.iceCandidates),
    });
    if (!data) return null;
    webRTC.registerWebRTCConfirmationListeners();
    roomData = data;
    const answer = await webRTC.createAnswer(roomData.sdpOffer);
    if (!answer) return null;
    await supabaseHandler.sendSdpAnswer({
      id: roomData.id,
      token: roomData.token,
      answer,
    });
  }
}

const room = new Room();

export default room;
