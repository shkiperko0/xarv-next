import styles from './testing.module.scss'
import { ScriptTestComponent } from './node-system-test'
import { cl } from '../tools/tools'

export const Menu = () => {
  return <div className={cl(styles.testing_menu)}>
    <ScriptTestComponent/>
  </div>
}



