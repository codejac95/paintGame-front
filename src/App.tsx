import {useState } from 'react'
import LoginForm from './Login/LoginForm'
import CreatePlayerForm from './CreatePlayer/CreatePlayerForm'
import './App.css'

function App() {
  
  const [loginStatus, setLoginStatus] = useState<boolean>(false);

  function handleLogOut(): void {
    localStorage.clear()
    setLoginStatus(false)
  }

  function handleLogin(): void {
    setLoginStatus(true);
  }


  return (
    <>
      <div className='header'>
        {loginStatus === true ?
          <div className='loggedInHeader'>
            <h1 className='loggedInHeaderText'>Paint Game</h1>
            <button onClick={handleLogOut} className='logoutBtn'>Logga ut</button>
          </div>
          :
          <div className='loggedOutHeader'>
            <h1 className='loggedOutHeaderText'>Paint Game</h1>
            {loginStatus === false ? <LoginForm onLogin={handleLogin} /> : null}
            {loginStatus === false ? <CreatePlayerForm onCreatePlayer={handleLogin} /> : null}
          </div>}
      </div>

    </>
  )
}

export default App
