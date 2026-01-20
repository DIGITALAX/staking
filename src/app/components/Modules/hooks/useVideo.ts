import { ModalContext } from "@/app/providers";
import {
  ChangeEvent,
  MouseEvent,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { fetchPosts } from "@lens-protocol/client/actions";
import { MainContentFocus, PageSize, Post } from "@lens-protocol/client";
import { CHROMADIN } from "@/app/lib/constants";

const useVideo = () => {
  const context = useContext(ModalContext);
  const videoRef = useRef<null | HTMLVideoElement>(null);
  const [videosLoading, setVideosLoading] = useState<boolean>(false);
  const [videoLoading, setVideoLoading] = useState<{
    play: boolean;
    next: boolean;
    videos: boolean;
  }>({
    play: false,
    next: false,
    videos: false,
  });

  const handlePlayPause = async (): Promise<void> => {
    if (videoLoading?.play) return;
    setVideoLoading((prev) => ({
      ...prev,
      play: true,
    }));
    try {
      const video = videoRef?.current;
      if (video && video.readyState >= 3) {
        if (video?.paused) {
          await video.play();

          context?.setFullScreenVideo({
            open: context?.fullScreenVideo?.open,
            time: context?.fullScreenVideo?.time,
            duration: context?.fullScreenVideo?.duration,
            isPlaying: true,
            volume: context?.fullScreenVideo?.volume,
            volumeOpen: context?.fullScreenVideo?.volumeOpen,
            allVideos: context?.fullScreenVideo?.allVideos,
            cursor: context?.fullScreenVideo?.cursor,
            index: context?.fullScreenVideo?.index,
          });
        } else {
          video.pause();

          context?.setFullScreenVideo({
            open: context?.fullScreenVideo?.open,
            time: context?.fullScreenVideo?.time,
            duration: context?.fullScreenVideo?.duration,
            isPlaying: false,
            volume: context?.fullScreenVideo?.volume,
            volumeOpen: context?.fullScreenVideo?.volumeOpen,
            allVideos: context?.fullScreenVideo?.allVideos,
            cursor: context?.fullScreenVideo?.cursor,
            index: context?.fullScreenVideo?.index,
          });
        }
      }
    } catch (err: any) {
      console.error(err.message);
    }
    setVideoLoading((prev) => ({
      ...prev,
      play: false,
    }));
  };

  const handleSeek = (e: MouseEvent<HTMLDivElement>): void => {
    const progressRect = e.currentTarget.getBoundingClientRect();
    const seekFr = (e.clientX - progressRect.left) / progressRect.width;

    const video = videoRef?.current;

    if (video && Number.isFinite(video.duration)) {
      const seekTime = seekFr * video.duration;
      if (Number.isFinite(seekTime)) {
        video.currentTime = seekTime;
      }
    }
  };

  const handleNextVideo = async (forward: boolean): Promise<void> => {
    setVideoLoading((prev) => ({
      ...prev,
      next: true,
    }));
    try {
      if (
        forward &&
        Number(context?.fullScreenVideo?.index) + 1 >=
          Number(context?.fullScreenVideo?.allVideos?.length)
      ) {
        await getVideos(Number(context?.fullScreenVideo?.index) + 1);
      } else {
        let index = Number(context?.fullScreenVideo?.index);

        if (forward) {
          index = index + 1;
        } else {
          if (index - 1 < 0) {
            index = Number(context?.fullScreenVideo?.allVideos?.length) - 1;
          } else {
            index = index - 1;
          }
        }

        context?.setFullScreenVideo({
          open: context?.fullScreenVideo?.open,
          time: 0,
          duration: context?.fullScreenVideo?.duration,
          isPlaying: context?.fullScreenVideo?.isPlaying,
          volume: context?.fullScreenVideo?.volume,
          volumeOpen: context?.fullScreenVideo?.volumeOpen,
          allVideos: context?.fullScreenVideo?.allVideos,
          cursor: context?.fullScreenVideo?.cursor,
          index: index,
        });
      }
    } catch (err: any) {
      console.error(err.message);
    }
    setVideoLoading((prev) => ({
      ...prev,
      next: false,
    }));
  };
  const handleVolumeChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const video = videoRef?.current;
    const newVolume = parseFloat(e.target.value);
    if (Number.isFinite(newVolume) && video) {
      video.volume = newVolume;
    }
  };

  const getVideos = async (newIndex?: number): Promise<void> => {
    if (!context?.lensClient) return;
    setVideoLoading((prev) => ({
      ...prev,
      videos: true,
    }));
    try {
      const data = await fetchPosts(context?.lensClient, {
        cursor: context?.fullScreenVideo?.cursor,
        pageSize: PageSize.Ten,
        filter: {
          authors: [CHROMADIN],
          metadata: {
            mainContentFocus: [MainContentFocus.Video],
          },
        },
      });


      if (!data?.isOk()) {
        setVideoLoading((prev) => ({
          ...prev,
          videos: false,
        }));
        return;
      }

      context?.setFullScreenVideo({
        open: context?.fullScreenVideo?.open,
        time: 0,
        duration: context?.fullScreenVideo?.duration,
        isPlaying: context?.fullScreenVideo?.isPlaying,
        volume: context?.fullScreenVideo?.volume,
        volumeOpen: context?.fullScreenVideo?.volumeOpen,
        allVideos: [
          ...context?.fullScreenVideo?.allVideos,
          ...(data?.value?.items || []),
        ] as Post[],
        cursor: data?.value?.pageInfo.next!,
        index: newIndex ? newIndex : 0,
      });
    } catch (err: any) {
      console.error(err.message);
    }
    setVideoLoading((prev) => ({
      ...prev,
      videos: false,
    }));
  };

  useEffect(() => {
    if (
      context?.fullScreenVideo?.open &&
      context?.fullScreenVideo?.allVideos?.length < 1 && context?.lensClient
    ) {
      getVideos();
    }
  }, [context?.fullScreenVideo?.open, context?.lensClient]);

  return {
    videoRef,
    videoLoading,
    handleNextVideo,
    handlePlayPause,
    handleSeek,
    handleVolumeChange,
    videosLoading,
    setVideosLoading,
  };
};

export default useVideo;
