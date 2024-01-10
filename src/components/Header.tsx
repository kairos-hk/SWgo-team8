import { FC } from "react"
import components from './components.module.scss'
import { Link } from "react-router-dom"

interface Prop {
  name: string
}

const Header: FC<Prop> = (props) => {
  return (
    <div className={components.Header}>
      <Link to={'/'}>
        <br></br>
      </Link>
    </div>
  )
}

export default Header;