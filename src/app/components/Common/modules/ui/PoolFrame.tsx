"use client";

import Image from "next/image";
import { INFURA_GATEWAY } from "@/app/lib/constants";

type PoolFrameProps = {
  title: string;
  children: React.ReactNode;
};

const FrameIcon = ({ image }: { image?: string }) => {
  return (
    <div className="relative col-start-1 border-4 w-10 h-10 md:w-12 md:h-12 border-black bg-yell grid grid-flow-row auto-rows-auto p-px self-center justify-self-start">
      {image && (
        <Image
          src={`${INFURA_GATEWAY}/ipfs/${image}`}
          alt="frame icon"
          fill
          className="absolute object-cover object-center"
          draggable={false}
        />
      )}
      <div className="relative row-start-1 w-full h-1 bg-white justify-self-center self-start"></div>
      <div className="relative row-start-2 w-2/3 justify-self-center self-end bg-black border border-white h-1.5"></div>
    </div>
  );
};

const FrameLines = () => {
  return (
    <div className="relative w-24 md:w-40 lg:w-60 h-full col-start-2 grid grid-flow-row auto-rows-auto gap-2 place-self-center">
      <div className="relative w-full h-2 bg-white border-b-2 border-dcomp row-start-1 place-self-center"></div>
      <div className="relative w-full h-2 bg-white border-b-2 border-dcomp row-start-2 place-self-center"></div>
      <div className="relative w-full h-2 bg-white border-b-2 border-dcomp row-start-3 place-self-center"></div>
    </div>
  );
};


const PoolFrame = ({ title, children }: PoolFrameProps) => {
  return (
    <div className="relative w-full h-fit bg-comp p-3 md:p-4 flex flex-col gap-4 rounded items-center">
      <div className="relative w-full h-fit gap-4 flex flex-row grow">
        <div className="relative w-fit h-fit col-start-1 grid grid-flow-col auto-cols-auto gap-4 self-center justify-self-start hidden sm:contents row-start-1">
          <FrameIcon />
          <FrameLines />
        </div>
        <div className="relative w-fit h-fit font-digiB text-black text-2xl uppercase col-start-1 sm:col-start-2 text-center place-self-center px-6 row-start-1 grow py-2">
          {title}
        </div>
        <div className="relative w-fit h-fit col-start-3 justify-self-end self-center grid grid-flow-col auto-cols-auto gap-4 hidden sm:contents row-start-1">
          <FrameLines />
          <div className="relative w-fit h-fit col-start-2 flex flex-row gap-4 self-center justify-self-end">
            <FrameIcon image="QmSMt1Et6xQZA6RikNoHg4HQQNeZZLX5Ho7QtmyZmMTGdd" />
            <FrameIcon image="QmURfK4nEow8epVW2B4o9G7F5A2jFbDRX1gE78A988krNw" />
          </div>
        </div>
      </div>
      <div className="relative w-full h-fit border-2 md:border-4 border-black grid grid-flow-col auto-cols-auto">
      
        <div className="relative w-full h-full flex flex-col bg-dullY">
          <Image
            src={`${INFURA_GATEWAY}/ipfs/QmTLN24oXMbEj3QgHX7dD3GWnYwL2GqsP16yvLzm29bk5X`}
            alt="frame background"
            fill
            className="absolute object-cover"
            draggable={false}
          />
          <div className="relative w-full h-full p-3 md:p-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoolFrame;
