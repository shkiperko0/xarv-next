import 'src/styles/globals.css'
import type { AppProps } from 'next/app'
import { WindowsLayout } from 'src/xarv/modules/taskmanager/index'
import { statics } from 'src/xarv/statics'

export default function App({ Component, pageProps }: AppProps) {

  
console.log(statics)

  return <>
    <WindowsLayout>
      <Component {...pageProps} />
    </WindowsLayout>
  </>
}
