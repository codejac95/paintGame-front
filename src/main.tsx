import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'

import { WebSocketProvider} from './components/WebSocketComponent.tsx'
import RastaDrawingComponent from './components/DrawingComponent.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WebSocketProvider>
      <App />
      <RastaDrawingComponent />
    </WebSocketProvider>
  </StrictMode>,
)
