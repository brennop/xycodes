import { useState, useMemo } from 'react';
import Head from 'next/head'

import Art from "../components/art";
import gallery from "../lib/gallery";
import { decode } from "../lib/decode"
import Decoded from '../components/decoded';

const websiteUrl = "https://xycodes.vercel.app";

export default function Expression() {
  const [expression, setExpression] = useState<string>("xy+")

  const decoded = useMemo(() => {
    if (expression === undefined) return undefined
    return decode(expression)
  }, [expression])

  return <div>
    <Head>
      <title>{expression}</title>
      <meta property="og:title" content={expression} key="title" />
      <meta property="og:image" content={`${websiteUrl}/api/og?expr=${encodeURIComponent(expression)}`} key="image" />
    </Head>
    <div className="h-screen grid place-items-center">
      <div className="flex flex-col items-center p-4">
        <Art expression={expression} />
        <input
          value={expression}
          onChange={e => setExpression(e.target.value)}
          maxLength={16}
          className="px-2 py-1 text-lg tracking-widest mt-2 w-full outline-none border-b-2 border-gray-900 shadow-md invalid:border-pink-500 invalid:bg-pink-100"
        />
        <div className="text-gray-500 mt-3 max-w-xs cursor-default">
          {decoded && <Decoded expression={decoded} />}
        </div>
      </div>
    </div>
  </div>
}

