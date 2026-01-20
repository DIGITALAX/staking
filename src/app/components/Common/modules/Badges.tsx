import { FunctionComponent } from "react";
import { INFURA_GATEWAY, BADGE_RECORDS } from "../../../lib/constants";
import Image from "next/image";

const Badges: FunctionComponent<{ dict: any }> = ({ dict }) => {
  return (
    <div className="flex bg-offBlack relative flex-col w-full h-fit gap-4 p-6 mt-auto">
      <div className="grid relative grid-cols-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-15 gap-3 w-full">
        {BADGE_RECORDS.map((badge, index) => (
          <div
            key={index}
            className="flex relative w-full aspect-square rounded-lg border-2 border-white cursor-pointer"
          >
            <Image
              src={`${INFURA_GATEWAY}/ipfs/${badge.image}`}
              fill
              className="object-cover rounded-lg"
              draggable={false}
              alt={badge.name}
            />
            <div
              id={badge.color}
              className="flex relative w-full h-full rounded-md p-1 z-10"
            >
              <div className="flex relative self-center w-full h-full rounded-full border-2 border-offBlack">
                <Image
                  src={`${INFURA_GATEWAY}/ipfs/QmVxMmLejwVJrDAfV1vgYVwJyxP29i2K51LiqxK62adPbg`}
                  fill
                  className="object-cover rounded-full hover:rotate-12"
                  draggable={false}
                  alt="badge background"
                />
                <div className="flex relative w-fit h-fit self-center mx-auto capitalize font-[family-name:var(--font-dosis)] text-black text-xs text-center z-10 px-1">
                  {dict?.badges?.[badge.name]}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="relative py-6 w-full h-fit flex justify-between px-2">
        <div
          className="relative font-dosis w-fit h-fit flex underline text-white cursor-pointer"
          onClick={() => window.open("https://dx.computer")}
        >
          dx.computer
        </div>
        <div className="relative w-fit h-fit flex flex-row items-center justify-center gap-2">
          <div
            className="relative font-dosis w-fit h-fit flex underline text-white cursor-pointer"
            onClick={() => window.open("https://digitalax.xyz")}
          >
            digitalax.xyz
          </div>
          <div
            className="relative font-dosis w-fit h-fit flex underline text-white cursor-pointer"
            onClick={() => window.open("https://bridge.digitalax.xyz")}
          >
            bridge.digitalax.xyz
          </div>
        </div>
      </div>
    </div>
  );
};

export default Badges;
