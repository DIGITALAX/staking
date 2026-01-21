import { FunctionComponent, JSX, useContext, useState } from "react";
import MarqueeText from "react-fast-marquee";
import Image from "next/image";
import {
  idiomaAIndice,
  Idiomas,
  indiceAIdioma,
  INFURA_GATEWAY,
  PANEL_KEY,
  PANELES,
} from "@/app/lib/constants";
import { ModalContext } from "@/app/providers";
import { ScanProps } from "../types/common.types";
import { ConnectKitButton } from "connectkit";
import FullScreenVideo from "../../Modules/modules/FullScreenVideo";
import { usePathname, useRouter } from "next/navigation";
import {
  PiArrowFatLinesLeftFill,
  PiArrowFatLinesRightFill,
} from "react-icons/pi";

const Scan: FunctionComponent<ScanProps> = ({
  dict,
  selectedPanel,
  onPanelSelect,
}): JSX.Element => {
  const [open, setOpen] = useState<boolean>(false);
  const context = useContext(ModalContext);
  const path = usePathname();
  const router = useRouter();
  const [chosenLanguage, setChosenLanguage] = useState<number>(
    idiomaAIndice[(path.match(/(?<=\/)(en|es|ar|pt)(?=\/)/)?.[0] ?? "en") as Idiomas],
  );
  const changeLanguage = (lang: string) => {
    const segments = path.split("/");
    segments[1] = lang;
    const newPath = segments.join("/");

    document.cookie = `NEXT_LOCALE=${lang}; path=/; SameSite=Lax`;

    router.push(newPath);
  };

  return (
    <div className="flex relative flex-col w-full h-full">
      <div className="relative flex flex-col w-full min-h-[40rem] h-screen  p-6">
        <div className="flex absolute top-0 left-0 w-full h-full">
          <Image
            src={`${INFURA_GATEWAY}/ipfs/QmQDttaD6Y2pJ6Bv6CEVPZt5Y5QjDKtDH6k8wBTDz1XB7a`}
            fill
            className="object-cover object-top opacity-80"
            alt="mirrorMain"
            priority
            draggable={false}
          />
        </div>
        <div className="relative items-center w-full flex flex-row justify-between gap-5 flex-wrap">
          <div className="relative w-fit h-fit flex text-white font-dosis text-7xl">
            {dict?.materialStaking}
          </div>
          <div className="relative w-fit h-fit flex flex-row gap-3 items-center justify-center flex-wrap">
            <div
              className="relative w-fit h-fit flex cursor-pointer active:scale-95 hover:opacity-80"
              onClick={() =>
                context?.setFullScreenVideo((prev) => ({
                  ...prev,
                  open: context?.fullScreenVideo?.open ? false : true,
                }))
              }
            >
              <div className="relative w-10 h-10 flex">
                <Image
                  src={`${INFURA_GATEWAY}/ipfs/Qmb4h9vReob4VXMByg7Go1kUmacjuGAcTxft5Rq4SbSgXY`}
                  alt="headerIcon1"
                  layout="fill"
                  draggable={false}
                />
              </div>
            </div>
            <div className="relative w-fit h-fit flex items-center justify-center flex flex-row gap-3">
              <div className="relative text-white font-dosis uppercase w-fit h-fit flex items-center justify-center flex-row gap-2">
                <div
                  className="relative flex items-center justify-center w-fit h-fit active:scale-95 cursor-pointer"
                  onClick={() => {
                    const newIdioma =
                      chosenLanguage > 0
                        ? chosenLanguage - 1
                        : 3;
                    changeLanguage(indiceAIdioma[newIdioma]);
                    setChosenLanguage(newIdioma);
                  }}
                >
                  <PiArrowFatLinesLeftFill color="white" size={20} />
                </div>
                <div className="relative w-fit h-fit flex items-center justify-center">
                  {indiceAIdioma[chosenLanguage]}
                </div>
                <div
                  className="relative flex items-center justify-center w-fit h-fit active:scale-95 cursor-pointer"
                  onClick={() => {
                    const newIdioma =
                      chosenLanguage < 3
                        ? chosenLanguage + 1
                        : 0;
                    changeLanguage(indiceAIdioma[newIdioma]);
                    setChosenLanguage(newIdioma);
                  }}
                >
                  <PiArrowFatLinesRightFill color="white" size={20} />
                </div>
              </div>
            </div>

            <ConnectKitButton.Custom>
              {({ isConnected, show, address }) => (
                <div className="relative w-fit h-fit grid grid-flow-col auto-cols-auto rounded-lg border-2 border-black gap-1 pl-1 pr-2 bg-bluey py-2">
                  <div className="relative grid grid-flow-col auto-cols-auto w-fit h-full justify-self-start self-center gap-2 col-span-1">
                    <div className="relative col-start-1 w-6 h-6 place-self-center grid grid-flow-col auto-cols-auto pl-2">
                      <Image
                        src={`${INFURA_GATEWAY}/ipfs/QmZhr4Eo92GHQ3Qn3xpv8HSz7ArcjgSPsD3Upe9v8H5rge`}
                        alt="connect"
                        width={15}
                        height={20}
                        className="flex w-fit h-fit relative col-start-1 place-self-center"
                        draggable={false}
                      />
                    </div>
                    <div className="relative col-start-2 w-1 h-5/6 self-center justify-self-start border border-black rounded-lg"></div>
                  </div>
                  <div className="relative w-full h-full grid grid-flow-row auto-rows-auto col-start-2 col-span-8">
                    <button
                      type="button"
                      onClick={show}
                      className="relative w-full h-full font-dosis uppercase tracking-[0.18em] text-xs text-left px-2 hover:bg-bluey/30 active:scale-[0.98]"
                    >
                      {isConnected && address
                        ? `${address.slice(0, 6)}...${address.slice(-4)}`
                        : dict?.connectWallet}
                    </button>
                  </div>
                </div>
              )}
            </ConnectKitButton.Custom>
          </div>
        </div>

        <div className="flex absolute w-full h-fit left-0 bottom-0 pt-20">
          <MarqueeText gradient={false} speed={100} direction={"left"}>
            <div className="flex relative w-full h-fit text-white font-digi uppercase leading-[16rem] text-[16rem] px-2 pb-2">
              {dict?.marquee}
            </div>
          </MarqueeText>
        </div>
        {context?.fullScreenVideo?.open && <FullScreenVideo />}
      </div>
      <div className="flex -top-3 relative w-full h-full bg-shame rounded-t-2xl z-10 px-2 pt-2 mt-auto">
        <div
          className="flex relative w-full h-full rounded-t-2xl border-2 border-x-white/40 border-t-white/40"
          id="conic"
        >
          <div className="flex relative w-full h-full">
            <div className="flex relative w-full h-fit gap-3 flex-row self-center overflow-x-scroll md:pl-3 z-1">
              <div className="relative w-full h-full grid grid-flow-col auto-cols-auto px-2  py-6 md:gap-0 gap-6">
                <div
                  className={`relative w-fit h-fit col-start-1 gap-3 flex flex-row self-center justify-self-start md:pl-3 z-1 overflow-x-scroll`}
                >
                  <div
                    className={`relative ${
                      !open ? "w-fit" : "w-full galaxy:w-80"
                    } h-fit col-start-1 gap-3 md:gap-6 grid grid-flow-col auto-cols-auto overflow-x-scroll`}
                  >
                    {(open ? PANELES : PANELES.slice(0, 2))?.map(
                      (uri: string, index: number) => {
                        const isActive = selectedPanel === index;
                        return (
                          <div
                            className={`relative w-16 md:w-fit h-fit col-start-${
                              index + 1
                            } grid grid-flow-col auto-cols-auto gap-2 cursor-pointer hover:opacity-80 active:scale-95 p-1.5 rounded-md border-4 ${
                              isActive ? "border-black" : "border-coast/60"
                            } shadow-md bg-disk`}
                            key={index}
                            id="panel"
                            onClick={() => onPanelSelect(index)}
                          >
                            <Image
                              src={`${INFURA_GATEWAY}/ipfs/QmSjh6dsibg9yDfBwRfC5YSWFTmwpwPxRDTFG8DzLHzFyB`}
                              layout="fill"
                              objectFit="cover"
                              alt="files"
                              className="absolute w-full h-full"
                              draggable={false}
                            />
                            <div className="relative w-fit h-fit col-start-1 place-self-center flex">
                              <Image
                                alt="files"
                                src={`${INFURA_GATEWAY}/ipfs/${uri}`}
                                width={25}
                                height={25}
                                draggable={false}
                              />
                            </div>
                            <div className="relative w-fit h-full gap-1 col-start-2 grid grid-flow-row auto-rows-auto place-self-center">
                              <div className="relative row-start-1 h-2 w-2 rounded-full border border-offBlack self-center"></div>
                              <div className="relative row-start-2 h-2 w-2 rounded-full border border-offBlack self-center"></div>
                              <div className="relative row-start-3 h-2 w-2 rounded-full border border-offBlack self-center"></div>
                            </div>
                          </div>
                        );
                      },
                    )}
                  </div>
                  <div
                    className={`relative w-fit h-fit col-start-2 grid hover:opacity-80 active:scale-95 cursor-pointer place-self-center z-2 grid-flow-col auto-cols-auto`}
                    onClick={() => setOpen(!open)}
                  >
                    <div
                      className={`relative w-fit place-self-center h-fit col-start-1`}
                    >
                      <Image
                        width={12}
                        height={12}
                        alt="leftArrow"
                        src={`${INFURA_GATEWAY}/ipfs/QmeeHhyUcz1SM8KJB2SrY7b7r9uhYFEWuMx45b2a2VgoLB`}
                        draggable={false}
                      />
                    </div>
                    <div
                      className={`relative w-fit h-fit col-start-2 place-self-center`}
                    >
                      <Image
                        width={12}
                        height={12}
                        alt="centerDot"
                        src={`${INFURA_GATEWAY}/ipfs/QmZSpwDjU9YYru6g44RVPaeeoLAu5YnCkXTCaNfEULzZ3i`}
                        draggable={false}
                      />
                    </div>
                    <div
                      className={`relative w-fit h-fit place-self-center col-start-3`}
                    >
                      <Image
                        width={12}
                        height={12}
                        alt="rightArrow"
                        src={`${INFURA_GATEWAY}/ipfs/QmXfG8mpaHad7rVnbqUtGrnCsm9vkXZT3zNa8mugndUS72`}
                        draggable={false}
                      />
                    </div>
                  </div>

                  <div className="relative w-1 h-full col-start-3 bg-bluey/30"></div>
                </div>
                <div className="relative w-fit h-fit row-start-2 md:row-start-1 col-start-1 md:col-start-2 grid grid-flow-col auto-cols-auto justify-self-start md:justify-self-end self-center text-black text-xl font-dosis text-left md:text-right md:pr-10">
                  {selectedPanel == 2
                    ? "Quiltoide"
                    : dict?.[PANEL_KEY[selectedPanel]]}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scan;
