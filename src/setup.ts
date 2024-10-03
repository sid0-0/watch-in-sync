import webRTC from "./webrtcHandler";

export function setupWRTCButton(element: HTMLButtonElement) {
  element.addEventListener("click", async () => {
    const offer = await webRTC.createOffer();
    navigator.clipboard.writeText(JSON.stringify(offer));
    document.querySelector<HTMLSpanElement>("#offer")!.innerText =
      JSON.stringify(offer);
  });
}

export function setupCopyOfferButton(element: HTMLButtonElement) {
  element.addEventListener("click", async () => {
    const offer = document.querySelector<HTMLSpanElement>("#offer")!.innerText;
    navigator.clipboard.writeText(offer);
  });
}

export function setupAnswerOfferButton(element: HTMLButtonElement) {
  element.addEventListener("click", async () => {
    const offerString =
      document.querySelector<HTMLTextAreaElement>("#offer-textarea")!.value;
    const offer = JSON.parse(offerString);
    let answer: RTCSessionDescriptionInit | undefined;

    if (!webRTC.createdOffer) {
      answer = await webRTC.createAnswer(offer);
    } else {
      await webRTC.acceptAnswer(offer);
    }
    navigator.clipboard.writeText(JSON.stringify(answer));
    document.querySelector<HTMLSpanElement>("#offer-answer")!.innerText =
      JSON.stringify(answer);
  });
}

export function setupAddIceCandidatesButton(element: HTMLButtonElement) {
  element.addEventListener("click", async () => {
    const candidatesString = document.querySelector<HTMLTextAreaElement>(
      "#ice-candidates-textarea"
    )!.value;
    const candidates = JSON.parse(candidatesString);
    await webRTC.addIceCandidates(candidates);
  });
}
