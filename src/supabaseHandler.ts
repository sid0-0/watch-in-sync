import { createClient, PostgrestSingleResponse } from "@supabase/supabase-js";
import { RoomData } from "./room";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

type RoomDataResponse = {
  sdp_offer: RTCSessionDescriptionInit;
  ice_candidates: RTCIceCandidateInit[];
  token: string;
  id: number;
};

const roomDataPayloadFormatter = (roomData: {
  sdpOffer?: RTCSessionDescriptionInit;
  iceCandidates?: RTCIceCandidateInit[];
  token?: string;
  id?: number;
}) => {
  const payload: Record<string, any> = {};
  if (roomData.sdpOffer != null) {
    payload.sdp_offer = roomData.sdpOffer;
  }
  if (roomData.iceCandidates != null) {
    payload.ice_candidates = roomData.iceCandidates;
  }
  if (roomData.token != null) {
    payload.token = roomData.token;
  }
  if (roomData.id != null) {
    payload.id = roomData.id;
  }
  return payload;
};

const roomDataResponseFormatter = (roomData: RoomDataResponse) => {
  const { sdp_offer, ice_candidates, ...rest } = roomData;
  return {
    ...rest,
    iceCandidates: ice_candidates,
    sdpOffer: sdp_offer,
  } as RoomData;
};

const formatRoomDataResponse = ({
  data,
  error,
}: PostgrestSingleResponse<RoomDataResponse>) => {
  if (error != null) {
    return { data, error };
  }
  return {
    data: roomDataResponseFormatter(data),
    error,
  };
};

export const createRoom = async (roomData: {
  sdpOffer: RTCSessionDescriptionInit;
  iceCandidates: RTCIceCandidateInit[];
  token: string;
}) => {
  const payload = roomDataPayloadFormatter(roomData);
  const { data, error } = await supabase.rpc("create_room", payload);
  if (error != null) {
    return { data, error };
  }
  return {
    data: {
      ...data,
      iceCandidates: data.ice_candidates,
      sdpOffer: data.sdp_offer,
    },
    error,
  };
};

export const getRoom = (params: { id: number; token: string }) => {
  const { id, token } = params;
  return supabase.rpc("get_room", { id, token }).then(formatRoomDataResponse);
};

export const updateIceCandidates = (params: {
  id: number;
  token: string;
  iceCandidates: RTCIceCandidateInit[];
}) => {
  const { id, token, iceCandidates } = params;
  return supabase
    .rpc("update_ice_candidates", {
      id,
      token,
      ice_candidates: iceCandidates,
    })
    .then(formatRoomDataResponse);
};

export const sendSdpAnswer = (params: {
  id: number;
  token: string;
  answer: RTCSessionDescriptionInit;
}) => {
  const { id, token, answer } = params;
  return supabase.rpc("send_offer_answer", { id, token, answer });
};
