import components from './components.module.scss'

const Loading = () => {
  return (
    <div className={components.LoadingBody}>
      <div>
        <div className={components.TitleComponents}>
          <p className={components.blue}>Safe</p>
          <p>Road</p>
          <p className={components.blue}>Finder!</p>
        </div>
        <div className={components.IconComponents} />
      </div>
    </div>
  )
}

export default Loading;