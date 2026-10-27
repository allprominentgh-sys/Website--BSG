
"use client";

import dynamic from "next/dynamic";
import type { Coordinates } from "./LiveDeliveryMap";

type Props = {
  riderLocation: Coordinates | null;
  destination: Coordinates | null;
  riderName?: string;
};

const LiveDeliveryMap = dynamic<Props>(
  () => import("./LiveDeliveryMap"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[420px] w-full items-center justify-center rounded-xl bg-slate-100 text-slate-600">
        Loading delivery map…
      </div>
    ),
  }
);

export default LiveDeliveryMap;
