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
}

const room = new Room();

export default room;
