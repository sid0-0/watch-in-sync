import room from "./room";

export function setupCreateRoomButton(button: HTMLButtonElement) {
  button.addEventListener("click", async () => {
    await room.createRoom();
    navigator.clipboard.writeText(
      JSON.stringify({ id: room.id, token: room.token })
    );
  });
}

export function setupEnterRoomButton(button: HTMLButtonElement) {
  button.addEventListener("click", () => {
    const roomData = JSON.parse(
      document.querySelector<HTMLTextAreaElement>("#room-id-textarea")!.value
    );
    if (!roomData.id || !roomData.token) return;
    room.joinRoom(roomData.id, roomData.token);
  });
}
