
import { useState, useRef, useEffect } from "react";
import { useWebSocket } from "./WebSocketComponent";

function RastaDrawingComponent() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);
    const [currentColor, setCurrentColor] = useState<string>("#000000");
    const stompClient = useWebSocket();

    const gridSize = 16; // 16x16 grids
    const squareSize = 20; // Smaller squares to fit four grids

    // Define four separate grids with proper offsets
    const grids = [
        { id: 0, offsetX: 50, offsetY: 50 },
        { id: 1, offsetX: 400, offsetY: 50 },
        { id: 2, offsetX: 50, offsetY: 400 },
        { id: 3, offsetX: 400, offsetY: 400 },
    ];

    // Generate squares for each grid
    const squares = grids.flatMap((grid) =>
        Array.from({ length: gridSize * gridSize }, (_, i) => ({
            id: grid.id * gridSize * gridSize + i,
            x: grid.offsetX + (i % gridSize) * squareSize,
            y: grid.offsetY + Math.floor(i / gridSize) * squareSize,
            width: squareSize,
            height: squareSize,
        }))
    );

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

        // Adjust canvas size to fit the four grids
        canvas.width = 800; 
        canvas.height = 800;
        canvas.style.width = `${canvas.width}px`;
        canvas.style.height = `${canvas.height}px`;

        const context = canvas.getContext("2d");
        if (!context) return;
        context.scale(1, 1);
        contextRef.current = context;

        // Clear the canvas and draw the grids
        context.clearRect(0, 0, canvas.width, canvas.height);

        context.strokeStyle = "#808080";
        context.lineWidth = 1;
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
                stompClient.onConnect = () => {};
            }
        };
    }, [stompClient]);

    const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentColor(event.target.value);
    };

    const fillSquare = (event: React.MouseEvent<HTMLCanvasElement>) => {
        const { offsetX, offsetY } = event.nativeEvent;
        const squareId = getSquareId(offsetX, offsetY);
        if (squareId !== null) {
            const square = squares.find((sq) => sq.id === squareId);
            if (square && contextRef.current) {
                contextRef.current.fillStyle = currentColor;
                contextRef.current.fillRect(
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
            }
        }
    };

    return (
        <div>
            <input type="color" value={currentColor} onChange={handleColorChange} />
            <canvas onClick={fillSquare} ref={canvasRef} />
        </div>
    );
}

export default RastaDrawingComponent;
