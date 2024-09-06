import { useState, useEffect, useRef } from "react";
import { useWebSocket } from "./WebSocketComponent";

import BallImage from "../pictures/Ball.png";
import BearImage from "../pictures/Bear.png";
import DanceImage from "../pictures/Dance.png";
import FrogImage from "../pictures/Frog.png";
import SquareImage from "../pictures/Square.png";

function ShowPictureComponent() {
    const images = [BallImage, BearImage, DanceImage, FrogImage, SquareImage];
    const [currentImage, setCurrentImage] = useState<string | null>(null); // Start with no image
    const stompClient = useWebSocket();
    const imageIndexRef = useRef(0); // Store current image index in a ref

    const showNextImage = () => {
        // Get the next image index, cycling back to 0 after reaching the last image
        imageIndexRef.current = (imageIndexRef.current + 1) % images.length;
        const selectedImage = images[imageIndexRef.current];
        setCurrentImage(selectedImage);

        if (stompClient) {
            console.log("Publishing image: " + selectedImage);
            stompClient.publish({
                destination: "/app/showImage",
                body: JSON.stringify({ image: selectedImage }),
            });
        }
    };

    useEffect(() => {
        if (stompClient) {
            const onConnect = () => {
                console.log("Connected to WebSocket");

                // Subscribe to WebSocket topic
                const subscription = stompClient.subscribe("/topic/showImage", (message) => {
                    const { image } = JSON.parse(message.body);
                    console.log("Received image from ws: " + image);
                    setCurrentImage(image);
                });

                return () => subscription.unsubscribe();
            };

            if (stompClient.connected) {
                onConnect();
            } else {
                stompClient.onConnect = onConnect;
            }
        }
    }, [stompClient]); // Depend on stompClient to update the image when the component renders

    return (
        <div>
            <button onClick={showNextImage}>Start</button>
            {currentImage ? (
                <img src={currentImage} alt="Sequential Image" />
            ) : (
                <p>No image available</p>
            )}
        </div>
    );
}

export default ShowPictureComponent;










