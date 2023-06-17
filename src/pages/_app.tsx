import 'src/styles/globals.css'
import type { AppProps } from 'next/app'
import { WindowsLayout } from 'src/xarv/modules/taskmanager/index'

export default function App({ Component, pageProps }: AppProps) {
  return <>
    <WindowsLayout>
      <Component {...pageProps} />
    </WindowsLayout>
  </>
}
