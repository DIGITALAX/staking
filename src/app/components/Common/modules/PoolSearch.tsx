"use client";

import { INFURA_GATEWAY, PRESETS, TOPICS } from "@/app/lib/constants";
import Image from "next/image";
import { FunctionComponent, JSX } from "react";
import usePoolSearch from "../hooks/usePoolSearch";
import { IoMdArrowDropdown, IoMdArrowDropright } from "react-icons/io";
import { AiOutlineLoading } from "react-icons/ai";

const SliderSearch: FunctionComponent<{ dict: any }> = ({ dict }): JSX.Element => {
  return (
    <div
      id="sliderSearch"
      className="relative w-11/12 h-fit grid grid-flow-row auto-rows-auto"
    >
      <div className="relative w-full h-fit row-start-1">
        <div
          className={`relative w-10/12 h-16 col-start-1 row-start-1 grid grid-flow-col auto-cols-auto rounded-lg border-2 border-black opacity-90 gap-1 pl-1 bg-bluey/50`}
        >
          <div className="relative grid grid-flow-col auto-cols-auto w-fit h-full justify-self-start self-center gap-2 col-span-1">
            <div className="relative col-start-1 w-6 h-6 place-self-center place-self-center grid grid-flow-col auto-cols-auto pl-2">
              <Image
                src={`${INFURA_GATEWAY}/ipfs/QmZhr4Eo92GHQ3Qn3xpv8HSz7ArcjgSPsD3Upe9v8H5rge`}
                alt="search"
                width={15}
                height={20}
                className={`flex w-fit h-fit relative col-start-1 place-self-center`}
                draggable={false}
              />
            </div>
            <div
              className={`relative col-start-2 w-1 h-5/6 self-center justify-self-start border border-black rounded-lg`}
            ></div>
          </div>

          <div className="relative w-full h-full grid grid-flow-row auto-rows-auto col-start-2 col-span-12">
            <input
              className={`relative row-start-1 w-full h-full font-dosis text-black rounded-lg bg-transparent caret-transparent placeholder:text-black text-black`}
              name="search"
              disabled
              placeholder={dict?.searchPlaceholder}
              autoComplete="off"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const PoolSearch = ({ dict }: { dict: any }) => {
  const { topic: selectedTopic, setTopic, topicValues } = usePoolSearch();

  const topicKeys: { [key: string]: string } = {
    "in the style of": "inTheStyleOf",
    genre: "genre",
    format: "format",
    colors: "colors",
    lighting: "lighting",
    engines: "engines",
    "design tools": "designTools",
    techniques: "techniques",
    fashion: "fashion",
    equipment: "equipment",
    descriptive: "descriptive",
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-shame py-3 pl-3 md:py-10 md:pl-10 gap-10">
      <SliderSearch dict={dict} />
      <div className="relative w-full h-fit flex flex-col pl-3 md:pl-20 gap-6">
        <div className="relative w-full h-fit flex flex-row gap-5 overflow-x-scroll">
          {TOPICS?.map((topic: string, index: number) => {
            const topicKey = topicKeys[topic];
            return (
              <div
                key={index}
                className="relative cursor-pointer hover:opacity-70 w-fit h-fit flex flex-row gap-1 whitespace-nowrap"
                onClick={() => setTopic(topic)}
              >
                <div className="relative w-fit h-fit capitalize font-dosis text-offBlack text-base self-center">
                  {dict?.topics?.[topicKey] || topic}
                </div>
                <div className="relative w-fit h-fit self-center">
                  {selectedTopic === topic ? (
                    <IoMdArrowDropdown size={25} color="black" />
                  ) : (
                    <IoMdArrowDropright size={25} color="black" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="relative w-full h-fit flex flex-row gap-7 md:pl-10 overflow-x-scroll pr-3 md:pr-0">
          {topicValues[selectedTopic]?.map((value: string, index: number) => {
            return (
              <div
                key={index}
                className="relative w-fit h-fit whitespace-nowrap"
              >
                <div className="relative w-fit h-fit text-black font-dosis text-sm underline underline-offset-2 cursor-pointer hover:text-offBlue">
                  {value}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="relative w-full h-fit flex flex-row gap-3 overflow-x-scroll">
        {Array.from(Array(10).keys())?.map((_, index: number) => {
          return (
            <div
              key={index}
              id="crt"
              className="relative min-w-66 h-fit flex flex-col rounded-2xl"
            >
              <div className="relative w-66 h-96 rounded-t-2xl animate-pulse">
                <div className="relative w-full h-full flex items-center justify-center animate-spin">
                  <AiOutlineLoading color="black" size={15} />
                </div>
              </div>
              <div className="relative w-full h-80 bg-offBlack rounded-b-2xl flex flex-col text-center text-white font-dosis text-xs p-3">
                <div className="relative w-full h-fit pb-2 pt-3 px-2">
                  {dict?.pool}: ----
                </div>
                <div className="relative w-full h-fit p-2">{dict?.project}: ----</div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="relative w-full h-fit flex flex-col gap-5 pt-10 md:pl-20">
        <div className="relative w-fit h-fit text-black font-dosis text-left text-base galaxy:text-lg">
          {dict?.poolSearchPresets}
        </div>
        <div className="relative w-full h-full flex flex-wrap justify-center gap-2 text-center min-h-96 self-center">
          {PRESETS.map((format: string, index: number) => {
            return (
              <span
                key={index}
                className="relative w-fit h-fit inline-flex items-center px-3 py-1.5 rounded-full shadow-sm cursor-pointer hover:bg-white text-offBlack/80 lowercase underline underline-offset-2 drop-shadow-md md:whitespace-nowrap text-xs galaxy:text-sm md:text-base bg-white"
              >
                {format}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PoolSearch;
