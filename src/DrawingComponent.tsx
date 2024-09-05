// import { useState, useRef, useEffect } from "react";
// import { useWebSocket } from "./WebSocketComponent";

// function DrawingComponent() {
//     const canvasRef = useRef<HTMLCanvasElement | null>(null);
//     const contextRef = useRef<CanvasRenderingContext2D | null>(null);
//     const [currentSquareId, setCurrentSquareId] = useState<number | null>(null);
//     const [isDrawing, setIsDrawing] = useState(false);
//     const stompClient = useWebSocket();

// const squares = [
// {id: 0,x: 50, y: 50, width: 200,height: 200},
// {id: 1,x: 300, y: 50, width: 200,height: 200},
// {id: 2,x: 50, y: 300, width: 200,height: 200},
// {id: 3,x: 300, y: 300, width: 200,height: 200}
// ];

// const getSquareId = (x: number, y: number): number | null => {
//     const square = squares.find(square =>
//         x >= square.x && x <= square.x + square.width &&
//         y >= square.y && y <= square.y + square.height
//       );
//       return square ? square.id : null;
//     };

// // const getAdjustedCoordinates = (x: number, y: number, square: {x: number, y: number}) => {
// //     return { x: x - square.x, y: y - square.y };
// // }
// useEffect(()=> {
//   const canvas = canvasRef.current;
//   if(!canvas)return;
//   canvas.width = window.innerWidth * 2;
//   canvas.height = window.innerHeight * 2;
//   canvas.style.width = `${window.innerWidth}px`;
//   canvas.style.height = `${window.innerHeight}px`;
  
//   const context = canvas.getContext("2d")
//   if (!context) return;
//   context.scale(2,2)
//   context.lineCap="round";
//   context.strokeStyle="#000000";
//   context.lineWidth=5;
//   contextRef.current = context;

//   context.clearRect(0, 0, canvas.width, canvas.height);

//   context.strokeStyle = '#808080';
//   context.lineWidth = 2;
//   squares.forEach(square => {
//     context.strokeRect(square.x, square.y, square.width, square.height);
//   });
  

//   if(stompClient) {
//     const onConnect = () =>{
//         const subscription = stompClient.subscribe('/topic/drawings', (message) => {
//             const { squareId, x, y } = JSON.parse(message.body);
//             const square = squares.find(sq => sq.id === squareId);
//             if(square && contextRef.current){
//               const absoluteX = x + square.x;
//               const absoluteY = y + square.y;
              
//                 contextRef.current.lineTo(absoluteX, absoluteY);
//                 contextRef.current.stroke();

//             }
            
//         });
//         return () => subscription.unsubscribe();
//       };

//       if(stompClient.connected) {
//         onConnect();
//       } else {
//         stompClient.onConnect = onConnect;
//       }

//     }
//    return () => {
//     if(stompClient) {
//         stompClient.onConnect = () => {};
//     }
//    };
 
// },[stompClient])

// const startDrawing = (event: React.MouseEvent<HTMLCanvasElement>) => {
//   const {offsetX, offsetY} = event.nativeEvent;
//   const squareId = getSquareId(offsetX, offsetY);
//   if (squareId !== null) {
//     setCurrentSquareId(squareId);
//     contextRef.current?.beginPath();
//     contextRef.current?.moveTo(offsetX,offsetY)
//     setIsDrawing(true);
//   }   
    
// }

// const finishDrawing = () => {
//   contextRef.current?.closePath();
//   setIsDrawing(false);
//   setCurrentSquareId(null);
// }

// const drawing = (event: React.MouseEvent<HTMLCanvasElement>) => {
//   if (!isDrawing) return;
//   const { offsetX, offsetY } = event.nativeEvent;
//   const squareId = getSquareId(offsetX, offsetY);
//   if (squareId !== null && squareId === currentSquareId) {
//     const square = squares.find(sq => sq.id === squareId);
//     if (!square) return;
//     const relativeX = offsetX - square.x;
//     const relativeY = offsetY - square.y;
//     contextRef.current?.lineTo(offsetX, offsetY);
//     contextRef.current?.stroke();
 
//      if(stompClient){
//         stompClient.publish({
//         destination:'/app/draw',
//         body: JSON.stringify({squareId,x:relativeX, y:relativeY}) 
  
//         });
//     }
//   }else if(squareId !== currentSquareId){
//     finishDrawing();
//   if(squareId !== null){
//     startDrawing(event);
//   }
    
//   } 
// };

//   return (
//     <div>
//       <canvas
//       onMouseDown={startDrawing}
//       onMouseUp={finishDrawing} 
//       onMouseMove={drawing} 
//       ref={canvasRef}/>
//     </div>

//   )
// }

// export default DrawingComponent