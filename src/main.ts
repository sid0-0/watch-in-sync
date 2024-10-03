import "./style.css";
import {
  setupCopyOfferButton,
  setupWRTCButton,
  setupAnswerOfferButton,
  setupAddIceCandidatesButton,
} from "./setup.ts";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <div class="offer-container">
      <button id="create-offer-button">Create Offer</button>
      <button id="copy-offer-button">Copy Offer</button>
      <div>
        <code><span id="offer">No offer created yet</span></code>
      </div>
    </div>
    <br/>
    <div class="offer-answer-container">
      <textarea id="offer-textarea" rows="10" cols="50"></textarea>
      <div><button id="answer-offer-button">Answer Offer</button></div>
      <div>
        <code><span id="offer-answer">No answer created yet</span></code>
      </div>
    </div>
    <div class="ice-candidates-input-container">
      <textarea id="ice-candidates-textarea" rows="10" cols="50"></textarea>
      <div><button id="add-candidate-button">Add Candidate</button></div>
    </div>
  </div>
`;

setupWRTCButton(
  document.querySelector<HTMLButtonElement>("#create-offer-button")!
);
setupCopyOfferButton(
  document.querySelector<HTMLButtonElement>("#copy-offer-button")!
);

setupAnswerOfferButton(
  document.querySelector<HTMLButtonElement>("#answer-offer-button")!
);

setupAddIceCandidatesButton(
  document.querySelector<HTMLButtonElement>("#add-candidate-button")!
);
