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
  iceCandidates: RTCIceCandidateInit[] = [];
  createdOffer: boolean = false;

  constructor() {
    this.pc = new RTCPeerConnection(servers);
    this.pc.onicecandidate = (event) => {
      if (event.candidate === null) return;
      const candidateData = event.candidate;
      this.iceCandidates.push(candidateData);
      console.log(this.iceCandidates);
    };
    this.pc.oniceconnectionstatechange = (event) => {
      console.log(event);
    };
  }

  async addIceCandidates(
    iceCandidates: RTCIceCandidateInit[] | RTCIceCandidateInit
  ) {
    const candidates = Array.isArray(iceCandidates)
      ? iceCandidates
      : [iceCandidates];
    console.log(candidates);
    await Promise.all(
      candidates.map(async (candidate) => {
        if (!this.pc) return null;
        const addCandyProm = this.pc.addIceCandidate(candidate);
        const res = await addCandyProm;
        return res;
      })
    );
  }

  async createOffer() {
    if (!this.pc) return;
    // this.generateIceCandidate();
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
    return offer;
  }

  async createAnswer(sessionDescription: RTCSessionDescriptionInit) {
    if (!this.pc) return;
    // this.generateIceCandidate();
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
