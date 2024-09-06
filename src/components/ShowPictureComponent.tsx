import { useState, useEffect, useRef } from "react";
import { useWebSocket } from "./WebSocketComponent";

import BallImage from "../pictures/Ball.png";
import BearImage from "../pictures/Bear.png";
import DanceImage from "../pictures/Dance.png";
import FrogImage from "../pictures/Frog.png";
import SquareImage from "../pictures/Square.png";

function ShowPictureComponent() {
    const images = [BallImage, BearImage, DanceImage, FrogImage, SquareImage];
    const [currentImage, setCurrentImage] = useState<string | null>(null);
    const [showStartButton, setShowStartButton] = useState(true);
    const [countdown, setCountdown] = useState<number | null>(null);
    const stompClient = useWebSocket();
    const imageIndexRef = useRef(0);

    const showNextImage = () => {
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

        setShowStartButton(false);
        setCountdown(20);

        // Start the countdown
        if (stompClient) {
            stompClient.publish({
                destination: "/app/startCountdown",
                body: JSON.stringify({ countdown: 20 }),
            });
        }
    };

    useEffect(() => {
        if (stompClient) {
            const onConnect = () => {
                console.log("Connected to WebSocket");

                // Subscribe to WebSocket topics
                const imageSubscription = stompClient.subscribe("/topic/showImage", (message) => {
                    const { image } = JSON.parse(message.body);
                    console.log("Received image from ws: " + image);
                    setCurrentImage(image);
                });

                const countdownSubscription = stompClient.subscribe("/topic/countdown", (message) => {
                    const { countdown } = JSON.parse(message.body);
                    console.log("Received countdown from ws: " + countdown);
                    setCountdown(countdown);
                });

                return () => {
                    imageSubscription.unsubscribe();
                    countdownSubscription.unsubscribe();
                };
            };

            if (stompClient.connected) {
                onConnect();
            } else {
                stompClient.onConnect = onConnect;
            }
        }
    }, [stompClient]);

    useEffect(() => {
        if (countdown !== null && countdown > 0) {
            const timerId = setInterval(() => {
                setCountdown(prev => (prev ? prev - 1 : null));
            }, 1000);

            return () => clearInterval(timerId);
        } else if (countdown === 0) {
            setShowStartButton(true);
            setCurrentImage(null);
        }
    }, [countdown]);

    return (
        <div>
            {showStartButton && <button onClick={showNextImage}>Start</button>}
            {currentImage && <img src={currentImage} alt="Sequential Image" />}
            {countdown !== null && countdown > 0 && <p>Time remaining: {countdown} seconds</p>}
        </div>
    );
}

export default ShowPictureComponent;








