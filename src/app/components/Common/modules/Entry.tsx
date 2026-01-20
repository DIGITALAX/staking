"use client";

import { FunctionComponent, JSX, useState } from "react";
import Badges from "./Badges";
import Scan from "./Scan";
import Unstake from "./Unstake";
import Stats from "./Stats";
import PoolSearch from "./PoolSearch";
import Recuts from "./Recuts";
import Quiltoide from "./Quiltoide";

const Entry: FunctionComponent<{ dict: any }> = ({ dict }): JSX.Element => {
  const [panelIndex, setPanelIndex] = useState<number>(0);

  return (
    <div className="relative w-full flex flex-col h-fit min-h-screen">
      <Scan
        dict={dict}
        selectedPanel={panelIndex}
        onPanelSelect={setPanelIndex}
      />

      <div className="relative -top-3 w-full h-full flex flex-col bg-shame py-3 px-3 md:py-10 md:px-10 gap-10">
        <div className="relative w-full justify-center h-fit">
          {panelIndex === 0 ? (
            <Stats dict={dict} />
          ) : panelIndex === 1 ? (
            <Unstake dict={dict} />
          ) : panelIndex === 2 ? (
            <Quiltoide dict={dict} />
          ) : panelIndex === 3 ? (
            <PoolSearch dict={dict} />
          ) : (
            <Recuts dict={dict} />
          )}
        </div>
        <div className="flex relative w-full items-center justify-center py-10"></div>
      </div>
      <div className="relative w-full h-20"></div>
      <Badges dict={dict} />
    </div>
  );
};

export default Entry;
