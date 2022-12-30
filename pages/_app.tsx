import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { Space_Mono } from "@next/font/google"

const font = Space_Mono({
  subsets: ["latin"],
  weight: ['400', '700'],
})

export default function App({ Component, pageProps }: AppProps) {
  return <main className={font.className}>
    <Component {...pageProps} />
  </main>
}
