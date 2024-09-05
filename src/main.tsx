import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// import App from './App.tsx'
import DrawingComponent from './DrawingComponent.tsx'
import { WebSocketProvider} from './WebSocketComponent.tsx'
import RastaDrawingComponent from './RastaDrawingComponent.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
     <WebSocketProvider>
    {/* <App /> */}
    {/* <DrawingComponent /> */}
    <RastaDrawingComponent />
    </WebSocketProvider>
  </StrictMode>,
)
