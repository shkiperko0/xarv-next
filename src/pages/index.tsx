// import { EventerTestGUI } from "src/xarv/eventer/howto"
// import { WSRpcTestGUI } from "src/xarv/wsrpc/howto"
import Head from "next/head";
import { MouseEventHandler } from "react";
import { Button } from "src/xarv/components/button";
import { ScriptTestComponent } from "src/xarv/modules/nodescripts/gui/test";
import { IWindowProps, useWindows } from "src/xarv/modules/taskmanager";
import { statics } from "src/xarv/statics";

export default function IndexPage(){
  const windows = useWindows()

  const onClick: MouseEventHandler = event => {
    windows.open({
      title: 'Window title',
      Render: ({window}) => {
        return <div style={{backgroundColor: 'white'}}>
          <span>Content</span>
          <input type="text" />
          <button type="button" onClick={() => windows.close(window.id) }>Close</button>
        </div>
      }
    })
  }

	return <>
		<Head>
			<title>Ugh, yeah {statics.env.mode}</title>
		</Head>
    <Button onClick={onClick}>Open window</Button>
    <ScriptTestComponent/>
	</>
}

