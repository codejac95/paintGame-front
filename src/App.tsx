import { useEffect, useRef, useState } from 'react'
import './App.css'
import React from 'react'

function App() {

const canvasRef = useRef<HTMLCanvasElement | null>(null);
const contextRef = useRef<CanvasRenderingContext2D | null>(null);
const [isDrawing, setIsDrawing] = useState(false);

const square = {
  x: 200, 
  y: 200, 
  width: 500,
  height: 500
};

useEffect(()=> {
  const canvas = canvasRef.current;
  if(!canvas)return;
  canvas.width = window.innerWidth*2;
  canvas.height = window.innerHeight*2;
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height= `${window.innerHeight}px`;
  
  const context = canvas.getContext("2d")
  if (!context) return;
  context.scale(2,2)
  context.lineCap="round";
  context.strokeStyle="black";
  context.lineWidth=5;
  contextRef.current = context;

  context.strokeStyle = 'grey';
  context.lineWidth = 2;
  context.strokeRect(square.x, square.y, square.width, square.height);
 
},[])

const startDrawing = (event: React.MouseEvent<HTMLCanvasElement>) => {
  const {offsetX, offsetY} = event.nativeEvent;
  if(isWithinSquare(offsetX, offsetY)) {
    contextRef.current?.beginPath();
    contextRef.current?.moveTo(offsetX,offsetY)
    setIsDrawing(true);
  }
}

const finishDrawing = () => {
  contextRef.current?.closePath();
  setIsDrawing(false);
}

const drawing = (event: React.MouseEvent<HTMLCanvasElement>) => {
  if (!isDrawing) return;
  const {offsetX, offsetY} = event.nativeEvent;
  if(isWithinSquare(offsetX, offsetY))
  contextRef.current?.lineTo(offsetX, offsetY);
  contextRef.current?.stroke();
  
}
const isWithinSquare = (x: number, y: number) => {
  return x >= square.x && x <= square.x + square.width && y >= square.y && y <= square.y + square.height;
};

  return (
    <div>
      <canvas
      onMouseDown={startDrawing}
      onMouseUp={finishDrawing} 
      onMouseMove={drawing} 
      ref={canvasRef}/>
    </div>

  )
}

export default App
