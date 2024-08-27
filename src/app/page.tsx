"use client";

import BuySellComponent from "@/components/BuySellComponent";

export default function Home() {
  return (
    <main className="flex flex-col py-10 px-12">
      <div className="flex flex-row justify-between">
        <BuySellComponent />
        {/* <BuySellComponent /> */}
      </div>
      {/* <div className="flex flex-row justify-between mt-9">
        <BuySellComponent />
        <BuySellComponent />
      </div> */}
    </main>
  );
}
