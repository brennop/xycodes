import { useState, useEffect, useMemo } from 'react';
import Head from 'next/head'
import { GetServerSideProps } from 'next'

import Art from "../components/art";
import gallery from "../lib/gallery";
import { decode } from "../lib/decode"
import { getString } from "../lib/compile"
import Decoded from '../components/decoded';

const websiteUrl = "https://xycodes.vercel.app";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { expression } = context.params!;

  return {
    props: {
      expression,
    },
  };
}

export default function Home({ expression: initial }: { expression: string }) {
  const [expression, setExpression] = useState<string>(initial as string || "xy+")

  useEffect(() => {
    setExpression(initial as string)
  }, [initial])

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
        <p>
          {getString(expression)}
        </p>
      </div>
    </div>
    <div className="bg-gray-100">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(256px,1fr))] justify-items-center gap-4 p-4">
        {gallery.map((expression) => <Art expression={expression} key={expression} dynamic={false} />)}
      </div>
    </div>
  </div>
}

