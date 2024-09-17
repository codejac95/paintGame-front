import { useState, useRef, useEffect, useCallback } from "react";
import { useWebSocket } from "./WebSocketComponent";
import frogData from '../arraysOfPictures/frog.json';
import { StompSubscription } from '@stomp/stompjs';

interface DrawingComponentProps {
  assignedSquare: number | null;
  playerName: string | null;


}
interface SquareState {
  id: number;
  gridId: number;
  color: string;

}

function DrawingComponent({ assignedSquare, playerName }: DrawingComponentProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [currentColor, setCurrentColor] = useState<string>("#000000");
  const [squareStates, setSquareStates] = useState<SquareState[]>([]);
  const frogArray = frogData.colors;

  const [countdown, setCountdown] = useState<number>(10);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [showField, setShowField] = useState <string> ("drawing");


  const stompClient = useWebSocket();
  const gridSize = 16;
  const squareSize = 20;
  const strokeStyle = "#808080";
  const lineWidth = 1;

  const grids = [
    { id: 0, offsetX: 50, offsetY: 50 },
    { id: 1, offsetX: 400, offsetY: 50 },
    { id: 2, offsetX: 50, offsetY: 400 },
    { id: 3, offsetX: 400, offsetY: 400 },
  ];

  const squares = grids.flatMap((grid) =>
    Array.from({ length: gridSize * gridSize }, (_, i) => ({
      id: grid.id * gridSize * gridSize + i,
      gridId: grid.id,
      x: grid.offsetX + (i % gridSize) * squareSize,
      y: grid.offsetY + Math.floor(i / gridSize) * squareSize,
      width: squareSize,
      height: squareSize,
    }))
  );

  // Initialize the squareStates for all squares at the start
  useEffect(() => {
    const initialSquareStates = squares.map((square) => ({
      id: square.id,
      gridId: square.gridId,
      color: "#FFFFFF", // Default color is white for all squares
    }));
    setSquareStates(initialSquareStates);
  }, []);


  //------------------------------------------------
  const startLocalCountdown = useCallback(() => {
    setIsRunning(true);
    setCountdown(15);


    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    countdownIntervalRef.current = setInterval(() => {

      setCountdown((prevCountdown) => {
        if (prevCountdown > 0) {
          return prevCountdown - 1;
        } else {

          clearInterval(countdownIntervalRef.current as NodeJS.Timeout);
          setIsRunning(false);


          // Notify all clients when the countdown ends
          if (stompClient && stompClient.connected) {
            stompClient.publish({
              destination: "/app/countdownEndedDraw",
              body: JSON.stringify({ action: "countdownEndedDraw" }),
            });
          }

          // onDrawingComplete();

          setTimeout(() => {
            setCountdown(10);
          }, 1500);

          return 0;
        }
      });
    }, 1000);

  }, [stompClient]);


  const handleStartCountdown = useCallback(() => {
    startLocalCountdown(); // Start the countdown locally

    if (stompClient && stompClient.connected) {
      stompClient.publish({
        destination: "/app/countdownStartedDraw",
        body: JSON.stringify({ action: "startCountdownDraw" }),
      });
    }
  }, [stompClient, startLocalCountdown]);


  //------------------------------------------------
  // WebSocket communication and syncing across clients
  useEffect(() => {
    if (stompClient) {
      const onConnect = () => {
        console.log("Connected to WebSocket Countdown topic");
        const subscription = stompClient.subscribe(
          "/topic/drawingCountdown",
          (message) => {
            const { action } = JSON.parse(message.body);
            console.log("Received action:", action);

            if (action === "startCountdownDraw") {
              startLocalCountdown();
            }

            if (action === "countdownEndedDraw") {
              clearInterval(countdownIntervalRef.current as NodeJS.Timeout);
              setIsRunning(false);
              setShowField("scoreScreen");
            }
          }
        );

        return () => subscription.unsubscribe();
      };

      if (stompClient.connected) {
        onConnect();
      } else {
        stompClient.onConnect = onConnect;
      }
    }

    return () => {
      if (stompClient) {
        stompClient.onConnect = () => { };
      }
    };
  }, [stompClient, startLocalCountdown]);

  //Start the countdown when component mounts
  useEffect(() => {
    handleStartCountdown();
  }, [handleStartCountdown]);



  //------------------------------------------------

  const getSquareId = (x: number, y: number): number | null => {
    const square = squares.find(
      (square) =>
        x >= square.x &&
        x <= square.x + square.width &&
        y >= square.y &&
        y <= square.y + square.height
    );
    return square ? square.id : null;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = 800;
    canvas.height = 800;
    canvas.style.width = `${canvas.width}px`;
    canvas.style.height = `${canvas.height}px`;

    const context = canvas.getContext("2d");
    if (!context) return;
    context.scale(1, 1);
    contextRef.current = context;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = strokeStyle;
    context.lineWidth = lineWidth;

    squares.forEach((square) => {
      context.strokeRect(square.x, square.y, square.width, square.height);
    });

    if (stompClient) {
      const onConnect = () => {
        const subscription = stompClient.subscribe(
          "/topic/drawings",
          (message) => {
            const { squareId, color } = JSON.parse(message.body);
            const square = squares.find((sq) => sq.id === squareId);
            if (square && contextRef.current) {
              contextRef.current.fillStyle = color;
              contextRef.current.fillRect(
                square.x,
                square.y,
                square.width,
                square.height
              );
              contextRef.current.strokeStyle = strokeStyle;
              contextRef.current.lineWidth = lineWidth;
              contextRef.current.strokeRect(
                square.x,
                square.y,
                square.width,
                square.height
              );
              // Update the state with the new color
              setSquareStates((prev) =>
                prev.map((s) =>
                  s.id === squareId ? { ...s, color } : s
                )
              );
            }
          });

        return () => {
          subscription.unsubscribe();

        }

      };

      if (stompClient.connected) {
        onConnect();
      } else {
        stompClient.onConnect = onConnect;
      }
    }

    if (assignedSquare !== null) {
      const square = squares.find((sq) => sq.gridId === assignedSquare);
      if (square && context) {
        context.fillStyle = "#000";
        context.font = "16px Arial";
        context.textAlign = "center";
        context.textBaseline = "bottom";

        context.fillText(
          playerName!,
          square.x + square.width / 2,
          square.y - 5
        );
      }
    }
    return () => {
      if (stompClient) {
        stompClient.onConnect = () => { };
      }
    };

  }, [stompClient, assignedSquare, playerName]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault();
    };

    canvas.addEventListener("contextmenu", handleContextMenu);

    return () => {
      canvas.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  const fillSquare = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const { offsetX, offsetY } = event.nativeEvent;
    const squareId = getSquareId(offsetX, offsetY);
    console.log("Lägger till Square ID: ", squareId, "color: ", currentColor);

    const square = squares.find((sq) => sq.id === squareId);

    if (square && square.gridId === assignedSquare) {
      if (square && contextRef.current) {
        contextRef.current.fillStyle = currentColor;
        contextRef.current.fillRect(
          square.x,
          square.y,
          square.width,
          square.height
        );
        contextRef.current.strokeStyle = strokeStyle;
        contextRef.current.lineWidth = lineWidth;
        contextRef.current.strokeRect(
          square.x,
          square.y,
          square.width,
          square.height
        );

        if (stompClient) {
          stompClient.publish({
            destination: "/app/draw",
            body: JSON.stringify({ squareId, color: currentColor }),
          });
        }
        // Update the square color state
        setSquareStates((prev) =>
          prev.map((s) =>
            s.id === squareId ? { ...s, color: currentColor } : s
          )
        );
      }
    }
  };

  const clearSquare = (event: React.MouseEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const { offsetX, offsetY } = event.nativeEvent;
    const squareId = getSquareId(offsetX, offsetY);
    console.log("Tar bort Square ID: ", squareId, "color: ", currentColor);
    const square = squares.find((sq) => sq.id === squareId);

    if (square && square.gridId === assignedSquare) {
      if (square && contextRef.current) {
        contextRef.current.clearRect(
          square.x,
          square.y,
          square.width,
          square.height
        );

        contextRef.current.strokeStyle = strokeStyle;
        contextRef.current.lineWidth = lineWidth;
        contextRef.current.strokeRect(
          square.x,
          square.y,
          square.width,
          square.height
        );
        if (stompClient) {
          stompClient.publish({
            destination: "/app/draw",
            body: JSON.stringify({ squareId, color: "#FFFFFF" }),
          });
        }

        //reset the color to default (white) in state
        setSquareStates((prev) =>
          prev.map((s) =>
            s.id === squareId ? { ...s, color: "#FFFFFF" } : s
          )
        );
      }
    }
  };

  const handleColorSelect = (color: string) => {
    setCurrentColor(color);
  }

  useEffect(() => {
    let subscription: StompSubscription | undefined;
    console.log(subscription + ": subscription' is declared but its value is never read. *ERROR*");


    const onConnect = () => {
      subscription = stompClient!.subscribe("/topic/percent", (message) => {
        const data = JSON.parse(message.body);

        if (data.playerName && data.percent !== undefined) {
          console.log(`Player: ${data.playerName}, Percent Match: ${data.percent}%`);
        } else {
          console.log("Data does not contain the expected fields.");
        }
      });
    };

    if (stompClient) {
      if (stompClient.connected) {
        onConnect();
      } else {
        stompClient.onConnect = onConnect;
      }
    }
  }, [stompClient]);

  useEffect(() => {
    handleSave();
  })


  const handleSave = () => {
    const mySquaresColor = squareStates
      .filter(square => square.gridId === assignedSquare)
      .map(square => square.color);


    const minLength = Math.min(mySquaresColor.length, frogArray.length);
    let matchCount = 0;

    for (let i = 0; i < minLength; i++) {
      if (mySquaresColor[i] === frogArray[i]) {
        matchCount++;
      }
    }

    const percent = (matchCount / minLength) * 100;
    console.log(`Percentage match: ${percent}%`);


    if (stompClient) {
      stompClient.publish({
        destination: "/app/percentMatch",
        body: JSON.stringify({
          playerName,
          percent: percent,
        }),


      });
      console.log("percent: ", percent);
      localStorage.setItem("myScore", percent.toString())

    }
  };

  return (
    <div>
      {/* <button onClick={handleStartCountdown} disabled={isRunning}>
                {isRunning ? `Time Remaining: ${countdown}s` : "Start Countdown"}
            </button> */}
      {isRunning && (
        <div>
          <h2>Time Remaining: {countdown}s</h2>
        </div>
      )}
      {showField === "drawing" && <div>

        <br />
        <button style={{ backgroundColor: "black", width: 30, height: 30, margin: "1px" }} onClick={() => handleColorSelect("#000000")} />
        <button style={{ backgroundColor: "red", width: 30, height: 30, margin: "1px" }} onClick={() => handleColorSelect("#FF0000")} />
        <button style={{ backgroundColor: "blue", width: 30, height: 30, margin: "1px" }} onClick={() => handleColorSelect("#0000FF")} />
        <button style={{ backgroundColor: "yellow", width: 30, height: 30, margin: "1px" }} onClick={() => handleColorSelect("#FFFF00")} />
        <button style={{ backgroundColor: "green", width: 30, height: 30, margin: "1px" }} onClick={() => handleColorSelect("#008000")} />
      </div>}
      {showField === "scoreScreen" && <div>
          <h1>Score</h1>
        </div>}
      <canvas onClick={fillSquare} onContextMenu={clearSquare} ref={canvasRef} />
    </div>
  );
}

export default DrawingComponent;
