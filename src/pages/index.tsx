// import { EventerTestGUI } from "src/xarv/eventer/howto"
// import { WSRpcTestGUI } from "src/xarv/wsrpc/howto"
import Head from "next/head";
import { Button } from "src/xarv/components/button";
import { ScriptTestComponent } from "src/xarv/modules/nodescripts/gui/test";
import { IWindowProps, useWindows } from "src/xarv/modules/taskmanager";

export default function IndexPage(){
  const windows = useWindows()

	return <>
		<Head>
			<title>Ugh, yeah</title>
		</Head>
    <Button onClick={event => {
      windows.open({
        title: 'Window title',

        // Caption({window: { title }}){ 
        //   return <>Caption of {title}</>
        // },

        // Task({window: { title }}){ 
        //   return <>Task of {title}</>
        // },

        Render: ({window}) => {
          return <div style={{backgroundColor: 'white'}}>
            <span>Content</span>
            <input type="text" />
            <button type="button" onClick={() => windows.close(window.id) }>Close</button>
          </div>
        }
      })
    }}>Open window</Button>
    {/* <EventerTestGUI/> */}
    {/* <WSRpcTestGUI/> */}
    <ScriptTestComponent/>
	</>
}

