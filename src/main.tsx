import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import GameComponent from './components/GameComponent.tsx'
import { WebSocketProvider} from './components/WebSocketComponent.tsx'



createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WebSocketProvider>
      <App />
     
      <GameComponent />
      
    </WebSocketProvider>
  </StrictMode>,
)
