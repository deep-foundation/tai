import { DeepClient } from "@deep-foundation/deeplinks/imports/client";
import { VoiceRecorder } from "capacitor-voice-recorder";
import uploadRecords from "./upload-records";

export interface ISound {
  recordDataBase64: string;
  msDuration: number;
  mimeType: string;
}

interface IStopRecording {
  deep: DeepClient;
  containerLinkId: number;
  startTime: string;
}

interface IStopRecordingResult {
  sound: ISound;
  soundLinkId: number; // Assuming soundLinkId is a number
}

export default async function stopRecording({
  deep,
  containerLinkId,
  startTime,
}: IStopRecording): Promise<IStopRecordingResult> {
  const { value: sound } = await VoiceRecorder.stopRecording();
  const endTime = new Date().toLocaleDateString();
  
  const soundLinkId = await uploadRecords({deep, containerLinkId, records:[{ sound, startTime, endTime }]});
  
  return { sound, soundLinkId };
}
