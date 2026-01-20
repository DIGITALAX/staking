import { INFURA_GATEWAY, INFURA_GATEWAY_INTERNAL } from "@/app/lib/constants";
import { ModalContext } from "@/app/providers";
import { Post, VideoMetadata } from "@lens-protocol/client";
import Image from "next/image";
import { FunctionComponent, JSX, useContext, useState } from "react";
import { AiOutlineLoading } from "react-icons/ai";
import useVideo from "../hooks/useVideo";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  useDraggable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { formatDuration } from "@/app/lib/helpers";
import {
  restrictToParentElement,
  restrictToWindowEdges,
} from "@dnd-kit/modifiers";

const FullScreenVideo: FunctionComponent = (): JSX.Element => {
  const [position, setPosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { distance: 5 } }),
  );

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none">
      <DndContext
        onDragEnd={(event) => {
          setPosition((prev) => ({
            x: prev.x + event.delta.x,
            y: prev.y + event.delta.y,
          }));
        }}
        modifiers={[restrictToParentElement, restrictToWindowEdges]}
        sensors={sensors}
      >
        <DraggableVideo position={position} />
      </DndContext>
    </div>
  );
};

export default FullScreenVideo;

const DraggableVideo: FunctionComponent<{
  position: { x: number; y: number };
}> = ({ position }) => {
  const context = useContext(ModalContext);
  const {
    videoRef,
    videoLoading,
    handleNextVideo,
    handlePlayPause,
    handleSeek,
    handleVolumeChange,
    videosLoading,
    setVideosLoading,
  } = useVideo();
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: "draggable-video",
  });
  const style = {
    transform: `translate3d(${position.x + (transform?.x || 0)}px, ${position.y + (transform?.y || 0)}px, 0)`,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={
        "absolute z-50 xl:w-1/3 sm:w-1/2 w-full h-fit px-4 md:px-8 pb-8 pt-4 cursor-grab active:cursor-grabbing items-center justify-center border-4 border-black rounded-lg top-40 left-0 sm:left-10 flex flex-col gap-3 pointer-events-auto"
      }
      id="videoplayer"
    >
      <div className="relative w-full h-fit flex flex-row items-center">
        <div
          className="relative w-fit h-fit justify-start flex pb-2 cursor-sewingHS"
          onClick={() =>
            window.open(
              `https://cypher.digitalax.xyz/item/pub/${
                (
                  context?.fullScreenVideo?.allVideos?.[
                    context?.fullScreenVideo?.index
                  ] as Post
                )?.id
              }`,
            )
          }
        >
          <Image
            src={`${INFURA_GATEWAY_INTERNAL}Qmf6evtDntW5NPNp5vcGRpyG2LgK6qg5ndJ3kw7cNy4BuK`}
            width={25}
            height={25}
            draggable={false}
            alt="cypher"
          />
        </div>
        <div
          className="close"
          onClick={() =>
            context?.setFullScreenVideo({
              open: false,
              time: context?.fullScreenVideo?.time,
              duration: context?.fullScreenVideo?.duration,
              isPlaying: context?.fullScreenVideo?.isPlaying,
              volume: context?.fullScreenVideo?.volume,
              volumeOpen: context?.fullScreenVideo?.volumeOpen,
              allVideos: context?.fullScreenVideo?.allVideos,
              cursor: context?.fullScreenVideo?.cursor,
              index: context?.fullScreenVideo?.index,
            })
          }
        >
          <Image
            src={`${INFURA_GATEWAY_INTERNAL}QmRtXzfqbJXXZ6fReUihpauh9nz6pmjUv5CKGm3oXquzh4`}
            // layout="fill"
            alt="close"
            width={25}
            height={25}
            draggable={false}
          />
        </div>
      </div>
      <div className="relative w-full h-60 flex items-center justify-center rounded-md bg-black border-2 px-2 border-black">
        {videoLoading?.videos ? (
          <div className="relative w-fit h-fit flex items-center justify-center animate-spin opacity-50">
            <AiOutlineLoading size={40} color="white" />
          </div>
        ) : (
          <video
            key={
              (
                (
                  context?.fullScreenVideo?.allVideos?.[
                    context?.fullScreenVideo?.index
                  ] as Post
                )?.metadata as VideoMetadata
              )?.video?.item
            }
            ref={videoRef}
            draggable={false}
            controls={false}
            playsInline
            autoPlay={true}
            className="relative w-full h-full object-cover rounded-md"
            onLoadedMetadata={() => {
              setVideosLoading(false);

              context?.setFullScreenVideo({
                open: context?.fullScreenVideo?.open,
                time: context?.fullScreenVideo?.time,
                duration: videoRef?.current?.duration || 0,
                isPlaying: context?.fullScreenVideo?.isPlaying,
                volume: context?.fullScreenVideo?.volume,
                volumeOpen: context?.fullScreenVideo?.volumeOpen,
                allVideos: context?.fullScreenVideo?.allVideos,
                cursor: context?.fullScreenVideo?.cursor,
                index: context?.fullScreenVideo?.index,
              });

              if (context?.fullScreenVideo?.time != 0 && videoRef.current) {
                videoRef.current.currentTime =
                  context?.fullScreenVideo?.time || 0;
              }
            }}
            onTimeUpdate={() =>
              context?.setFullScreenVideo({
                open: context?.fullScreenVideo?.open,
                time: videoRef?.current?.currentTime || 0,
                duration: context?.fullScreenVideo?.duration,
                isPlaying: context?.fullScreenVideo?.isPlaying,
                volume: context?.fullScreenVideo?.volume,
                volumeOpen: context?.fullScreenVideo?.volumeOpen,
                allVideos: context?.fullScreenVideo?.allVideos,
                cursor: context?.fullScreenVideo?.cursor,
                index: context?.fullScreenVideo?.index,
              })
            }
            onVolumeChange={() =>
              context?.setFullScreenVideo({
                open: context?.fullScreenVideo?.open,
                time: context?.fullScreenVideo?.time,
                duration: context?.fullScreenVideo?.duration,
                isPlaying: context?.fullScreenVideo?.isPlaying,
                volume: videoRef?.current?.volume || 0,
                volumeOpen: context?.fullScreenVideo?.volumeOpen,
                allVideos: context?.fullScreenVideo?.allVideos,
                cursor: context?.fullScreenVideo?.cursor,
                index: context?.fullScreenVideo?.index,
              })
            }
            onLoadStart={() => setVideosLoading(true)}
            onEnded={() => handleNextVideo(true)}
            poster={
              (
                (
                  context?.fullScreenVideo?.allVideos?.[
                    context?.fullScreenVideo?.index
                  ] as Post
                )?.metadata as VideoMetadata
              )?.video?.cover?.includes("https://")
                ? (
                    (
                      context?.fullScreenVideo?.allVideos?.[
                        context?.fullScreenVideo?.index
                      ] as Post
                    )?.metadata as VideoMetadata
                  )?.video?.cover
                : `${INFURA_GATEWAY}/ipfs/${
                    (
                      (
                        context?.fullScreenVideo?.allVideos?.[
                          context?.fullScreenVideo?.index
                        ] as Post
                      )?.metadata as VideoMetadata
                    )?.video?.cover?.split("ipfs://")?.[1]
                  }`
            }
          >
            <source
              src={
                (
                  (
                    context?.fullScreenVideo?.allVideos?.[
                      context?.fullScreenVideo?.index
                    ] as Post
                  )?.metadata as VideoMetadata
                )?.video?.item?.includes("https://")
                  ? (
                      (
                        context?.fullScreenVideo?.allVideos?.[
                          context?.fullScreenVideo?.index
                        ] as Post
                      )?.metadata as VideoMetadata
                    )?.video?.item
                  : `${INFURA_GATEWAY}/ipfs/${
                      (
                        (
                          context?.fullScreenVideo?.allVideos?.[
                            context?.fullScreenVideo?.index
                          ] as Post
                        )?.metadata as VideoMetadata
                      )?.video?.item?.split("ipfs://")?.[1]
                    }`
              }
            />
          </video>
        )}
      </div>
      <div
        className={`relative h-fit flex w-full gap-3 items-center justify-center flex-col md:flex-row flex-wrap`}
      >
        <div
          className={`relative w-full h-full flex justify-between flex-row flex-wrap items-center gap-3`}
        >
          <div className="relative w-fit h-fit flex items-center justify-center gap-3">
            <div
              className={`relative cursor-sewingHS w-3 h-3 flex items-center justify-center ${
                (videoLoading?.play || videosLoading) && "animate-spin"
              }`}
              onClick={() =>
                (!videoLoading?.play || videosLoading) && handlePlayPause()
              }
            >
              {videoLoading?.play || videosLoading ? (
                <AiOutlineLoading size={15} color="white" />
              ) : (
                <Image
                  src={`${INFURA_GATEWAY_INTERNAL}${
                    context?.fullScreenVideo?.isPlaying
                      ? "Qmbg8t4xoNywhtCexD5Ln5YWvcKMXGahfwyK6UHpR3nBip"
                      : "QmXw52mJFnzYXmoK8eExoHKv7YW9RBVEwSFtfvxXgy7sfp"
                  }`}
                  alt="play"
                  draggable={false}
                  layout="fill"
                />
              )}
            </div>
            <div className="relative w-fit h-full flex items-center font-aust text-xs text-white">
              <span className="text-rosa">
                {formatDuration(context?.fullScreenVideo?.time || 0)}
              </span>
              /
              <span className="text-light">
                {formatDuration(context?.fullScreenVideo?.duration || 0)}
              </span>
            </div>
          </div>
          <div className="relative w-fit h-fit flex items-center justify-center gap-3">
            <div
              className=".volume relative cursor-sewingHS w-3 h-3 flex items-center justify-center"
              onClick={() =>
                context?.setFullScreenVideo({
                  open: context?.fullScreenVideo?.open,
                  time: context?.fullScreenVideo?.time,
                  duration: context?.fullScreenVideo?.duration,
                  isPlaying: context?.fullScreenVideo?.isPlaying,
                  volume: context?.fullScreenVideo?.volume,
                  volumeOpen: !context?.fullScreenVideo?.volumeOpen,
                  allVideos: context?.fullScreenVideo?.allVideos,
                  cursor: context?.fullScreenVideo?.cursor,
                  index: context?.fullScreenVideo?.index,
                })
              }
            >
              <Image
                src={`${INFURA_GATEWAY_INTERNAL}${
                  context?.fullScreenVideo?.volume === 0
                    ? "QmVVzvq68RwGZFi46yKEthuG6PXQf74BaMW4yCrZCkgtzK"
                    : "Qme1i88Yd1x4SJfgrSCFyXp7GELCZRnnPQeFUt6jbfPbqL"
                }`}
                layout="fill"
                alt="volume"
                draggable={false}
              />
            </div>

            <div
              className="relative cursor-sewingHS w-3 h-3 flex items-center justify-center -rotate-180"
              onClick={() => !videoLoading?.next && handleNextVideo(false)}
            >
              <Image
                src={`${INFURA_GATEWAY_INTERNAL}QmcYHKZJWJjgibox8iLqNozENnkgD4CZQqYsmmVJpoYUyo`}
                layout="fill"
                alt="back"
                draggable={false}
              />
            </div>
            <div
              className={`relative cursor-sewingHS w-3 h-3 flex items-center justify-center ${
                videoLoading?.next && "animate-spin"
              }`}
              onClick={() => !videoLoading?.next && handleNextVideo(true)}
            >
              {videoLoading?.next ? (
                <AiOutlineLoading size={15} color="white" />
              ) : (
                <Image
                  src={`${INFURA_GATEWAY_INTERNAL}QmcYHKZJWJjgibox8iLqNozENnkgD4CZQqYsmmVJpoYUyo`}
                  layout="fill"
                  alt="next"
                  draggable={false}
                />
              )}
            </div>
          </div>
          {context?.fullScreenVideo?.volumeOpen && (
            <input
              className="volume absolute right-1 bottom-7"
              type="range"
              max={1}
              min={0}
              step={0.01}
              value={context?.fullScreenVideo?.volume}
              onChange={(e) => handleVolumeChange(e)}
            />
          )}
        </div>
        <div className="relative w-full h-full flex flex-col items-center justify-center">
          <div
            className="relative w-full h-2 bg-white/40 rounded-sm cursor-sewingHS"
            onClick={(e) => handleSeek(e)}
          >
            <div
              className="absolute h-full bg-white/80 rounded-sm"
              style={{
                width: `${
                  ((context?.fullScreenVideo?.time || 0) /
                    (context?.fullScreenVideo?.duration || 0)) *
                  100
                }%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
