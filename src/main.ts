import "./style.css";
import { setupCreateRoomButton, setupEnterRoomButton } from "./setup.ts";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <button id="create-room-button">Create Room</button>
    <br/>
    <br/>
    <textarea id="room-id-textarea" rows="10" cols="50"></textarea>
    <br/>
    <br/>
    <div><button id="enter-room-button">Enter Room</button></div>
  </div>
`;

setupCreateRoomButton(
  document.querySelector<HTMLButtonElement>("#create-room-button")!
);
setupEnterRoomButton(
  document.querySelector<HTMLButtonElement>("#enter-room-button")!
);
