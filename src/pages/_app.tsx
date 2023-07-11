import 'src/globals.css'
import type { AppProps } from 'next/app'
import { WindowsLayout } from 'shared/xarv/modules/taskmanager'

export default function App({ Component, pageProps }: AppProps) {
  return <>
    <WindowsLayout>
      <Component {...pageProps} />
    </WindowsLayout>
  </>
}
