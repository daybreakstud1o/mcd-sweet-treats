import { RefObject, useEffect, useMemo, useRef, useState } from "react";
import useViewport from "@/hooks/useViewport";
import { createMediaRecorder } from "./createMediaRecorder";

export function useVideoRecording(
  canvasElm: HTMLCanvasElement | undefined,
  videoElm: HTMLVideoElement | undefined,
  hasPermissionGranted: boolean,
) {
  const [recordedBlobData, setRecordedBlobData] = useState<Blob | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null,
  );
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [isMediaRecorderReady, setIsMediaRecorderReady] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const { isMobile } = useViewport();
  const aspectRatio = useMemo(() => (isMobile ? 16 / 9 : 9 / 16), [isMobile]);

  useEffect(() => {
    if (!hasPermissionGranted) {
      console.log("User have not granted permission, abort");
    }
    // console.log("re-creating recording function");

    const asyncCleanupFunctionWrapper = (async function () {
      setIsMediaRecorderReady(false);
      if (!(canvasElm instanceof HTMLCanvasElement)) return;

      try {
        const onBlobAvailable = (newBlobData: Blob) =>
          setRecordedBlobData(newBlobData);

        const recorder = await createMediaRecorder(
          canvasElm,
          aspectRatio,
          onBlobAvailable,
        );
        setIsMediaRecorderReady(true);
        setVideoStream(recorder.videoStream);
        setMediaRecorder(recorder.recorder);

        return () => {
          recorder.destory();
        };
      } catch (error) {
        console.error("Error accessing media devices.", error);
      }
    })();

    return () => {
      asyncCleanupFunctionWrapper.then((cleanup) => {
        cleanup && cleanup();
      });
    };
  }, [aspectRatio, canvasElm, hasPermissionGranted]);

  const startRecording = () => {
    if (mediaRecorder && mediaRecorder.state === "inactive") {
      setRecordedBlobData(null);
      mediaRecorder.start();
      setIsRecording(true);
      return true;
    }
    return false;
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
      setIsRecording(false);
      return true;
    }
    return false;
  };

  const clearRecordedBlobData = () => {
    setRecordedBlobData(null);
  };

  // Put the video stream on screen
  useEffect(() => {
    if (videoElm && videoStream) {
      videoElm.srcObject = videoStream;
      videoElm.play().catch(console.error);
    }
  }, [videoStream, videoElm]);

  return {
    isMediaRecorderReady,
    startRecording,
    stopRecording,
    clearRecordedBlobData,
    videoStream,
    isRecording,
    recordedBlobData,
  };
}
