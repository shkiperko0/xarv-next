import { useRef, useState } from "react"
import styles from "./styles.module.scss"
import { useWebsocket } from "../../hooks/useWebsocket"
import { Button } from "src/xarv/components/button"
export { styles as CLIStyles }

// const openBuilderCLI = () => {
//     windows.open(<BuilderCLI url={'ws://127.0.0.1:8080/ws'}/>, {
//       w: "50vw",
//       h: "50vh",
//       title: "Builder CLI",
//     });
//   }

// <Button className={styles.button_logout} onClick={openBuilderCLI}>
// Builder CLI
// </Button>

export function BuilderCLI({ url }: { url: string }) {
	const [messages, setMessages] = useState<MessageEvent<any>[]>([])
	const ref = useRef<HTMLInputElement | null>(null)
	const [state, setState] = useState<{
		cli?: string,
		list?: string[]
	}>({})

	const { send, isOnline } = useWebsocket(url, (msg: MessageEvent<string>) => {
		const { data } = msg

		if (data.startsWith("cli ")) {
			if (state.list === undefined) {
				setState(state => ({ ...state, list: data.substring(4).split(",") }))
			}
			return
		}

		setMessages(messages => [...messages, msg])
	})

	const execCommand = () => {
		const { current: cmd } = ref
		if (!cmd) return
		const { value } = cmd
		send(value)
	}

	return <>
		{
			state.cli ? (<div className={styles.currentCLI}>{state.cli}</div>) :
				state.list ? state.list.map(
					cli => <Button
						key={cli}
						className={styles.optionCLI}
						onClick={() => {
							send(cli)
							setState(state => ({ ...state, cli }))
						}}
					>
						{cli}
					</Button>
				) : (<div className={styles.noCLI}>Empty CLI list</div>)
		}

		{messages.map(msg => <><span>{msg.data}</span><br /></>)}

		{state.cli && <input
			className={styles.inputCLI}
			style={{ backgroundColor: isOnline ? 'green' : 'red' }}
			ref={ref}
			disabled={!isOnline}
			placeholder={isOnline ? 'Type commands' : 'Service offline'}
			type="text"
			onKeyUp={event => {
				if (event.code == 'Enter') {
					execCommand()
					if (ref.current) {
						ref.current.value = ''
					}
				}
				console.log(event);
			}}
		/>}
	</>
}