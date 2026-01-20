"use client";

import { INFURA_GATEWAY } from "@/app/lib/constants";
import Image from "next/image";

const TransitionSection = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => {
  return (
    <div
      className="relative w-full h-fit p-3 sm:p-6 md:p-10 grid grid-flow-row auto-rows-auto gap-10"
      id="outside2"
    >
      <div className="relative row-start-1 w-full h-full rounded-xl flex flex-row">
        <div
          id="radialPinkBorder"
          className="relative w-full h-fit col-start-1 rounded-xl"
        >
          <Image
            src={`${INFURA_GATEWAY}/ipfs/QmPTSfH2nh8S7H4yXWHn3wxBADoGfvj7aD8P4gkLmkKDpw`}
            layout="fill"
            objectFit="cover"
            className="absolute w-full h-full p-2 rounded-xl"
            draggable={false}
            alt="bg"
          />
          <div className="relative w-full h-full col-start-1 f1:flex-row flex flex-col p-4 gap-6 border-4 border-white/20 rounded-lg">
            <div
              id="radialPinkBorder"
              className="relative col-start-1 row-start-2 fo:row-start-1 fo:col-start-2 w-full h-full grid grid-flow-col auto-cols-auto p-1 rounded-xl"
            >
              <div className="relative w-full h-full bg-white/80 rounded-xl flex flex-col gap-3 px-4 py-4">
                <div className="relative w-fit h-fit flex flex-row gap-3">
                  <div className="relative flex w-fit h-fit">
                    <Image
                      alt="escribir"
                      src={`${INFURA_GATEWAY}/ipfs/QmYbuYSSdKb5jScR6Jjg3zutgYVAAbikmM3Y4pxmc7GJqr`}
                      width={30}
                      height={30}
                      draggable={false}
                    />
                  </div>
                  <div className="relative flex w-fit h-fit font-dosis text-offBlack place-self-center">
                    {title}
                  </div>
                </div>
                <div
                  className="relative text-lg font-mult w-full h-fit"
                  dangerouslySetInnerHTML={{ __html: description }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Recuts = ({ dict }: { dict: any }) => {
  return (
    <div className="flex flex-col w-full h-fit gap-6">
      <TransitionSection
        title={dict?.recutsSections?.genesisV3Title || "Genesis V3"}
        description={dict?.recutsSections?.genesisV3Description || ""}
      />
      <TransitionSection
        title={dict?.recutsSections?.ionicTitle || "Ionic"}
        description={dict?.recutsSections?.ionicDescription || ""}
      />
      <TransitionSection
        title={dict?.recutsSections?.w3fTitle || "W3F"}
        description={dict?.recutsSections?.w3fDescription || ""}
      />
    </div>
  );
};

export default Recuts;
