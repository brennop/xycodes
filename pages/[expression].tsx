import { useState } from 'react';
import { useRouter } from 'next/router'
import Art from "../components/art";
import { getPage } from "../lib/fauna";

export async function getServerSideProps() {
  const expressions = await getPage();
  return {
    props: {
      expressions,
    },
  };
}

export default function Home({ expressions }: { expressions: string[] }) {
  const router = useRouter()
  const { expression: inital } = router.query

  const [expression, setExpression] = useState<string>(inital as string || "xy+")

  return <div>
    <div className="h-screen grid place-items-center">
      <div className="flex flex-col items-center w-min p-4">
        <Art expression={expression} />
        <input
          value={expression}
          onChange={e => setExpression(e.target.value)}
          className="px-2 py-1 text-lg tracking-widest mt-2 w-full outline-none border-b-2 border-gray-900 shadow-md"
        />
      </div>
    </div>
    <div className="bg-gray-100">
      <div className="flex gap-4 justify-items-center p-8">
        {expressions.map((expression) => <Art expression={expression} key={expression} />)}
      </div>
    </div>
  </div>
}

