import {useState } from 'react'
import LoginForm from './Login/LoginForm'
import CreatePlayerForm from './CreatePlayer/CreatePlayerForm'
import GameComponent from './components/GameComponent';
import ScoreCalculator from './types/ScoreCalculator';

function App() {
  
  const [loginStatus, setLoginStatus] = useState<boolean>(false);
  const [loggedInPlayerId] = useState<string | null>(null);
  

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
            {loginStatus === false ? <CreatePlayerForm onCreatePlayer={handleLogin} /> : null}
            {loginStatus === false ? <LoginForm onLogin={handleLogin} /> : null}
          </div>}   
      </div>
      <div>
         {/* Display LoginAndPassComponent until the user logs in */}
         {loginStatus === true ? <GameComponent loginStatus={loginStatus} /> : null}
         </div>

         <div>
        {/* Only show the score form if the user is logged in */}
        {loginStatus && loggedInPlayerId && <ScoreCalculator playerId={loggedInPlayerId} />}
      </div>
    </>
  );
}


export default App
