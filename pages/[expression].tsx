import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router'

import Art from "../components/art";
import gallery from "../lib/gallery";
import { decode } from "../lib/decode"
import Decoded from '../components/decoded';

export default function Home() {
  const router = useRouter()
  const { expression: initial } = router.query

  const [expression, setExpression] = useState<string>(initial as string || "xy+")

  useEffect(() => {
    setExpression(initial as string)
  }, [initial])

  const decoded = useMemo(() => {
    if (expression === undefined) return undefined
    return decode(expression)
  }, [expression])

  return <div>
    <div className="h-screen grid place-items-center">
      <div className="flex flex-col items-center p-4">
        <Art expression={expression} />
        <input
          value={expression}
          onChange={e => setExpression(e.target.value)}
          className="px-2 py-1 text-lg tracking-widest mt-2 w-full outline-none border-b-2 border-gray-900 shadow-md"
        />
        <p className="text-sm text-gray-500 mt-2">
          {decoded && <Decoded expression={decoded} />}
        </p>
      </div>
    </div>
    <div className="bg-gray-100">
      <div className="flex gap-4 justify-items-center p-8 overflow-x-scroll">
        {gallery.map((expression) => <Art expression={expression} key={expression} dynamic={false} />)}
      </div>
    </div>
  </div>
}

