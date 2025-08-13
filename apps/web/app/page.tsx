'use client'

import dynamic from "next/dynamic"

const Home = dynamic(() => import("./demo"), { ssr: false });

export default function Page() {
  return <Home />;
}
