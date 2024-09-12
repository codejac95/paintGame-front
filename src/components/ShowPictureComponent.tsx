import { useState, useRef, useEffect, useCallback } from "react";
import { useWebSocket } from "./WebSocketComponent";

import BallImage from "../pictures/Ball.png";
import BearImage from "../pictures/Bear.png";
import DanceImage from "../pictures/Dance.png";
import FrogImage from "../pictures/Frog.png";
import SquareImage from "../pictures/Square.png";

function ShowPictureComponent() {
    const images = [BallImage, BearImage, DanceImage, FrogImage, SquareImage];
    const [currentImage, setCurrentImage] = useState<string | null>(null);
    const [countdown, setCountdown] = useState<number>(10);
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const stompClient = useWebSocket();
    const imageIndexRef = useRef(0);
    const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const startLocalCountdown = useCallback(() => {
        setIsRunning(true);
        setCountdown(10);

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
                    

                    // Publish countdown end message
                    if (stompClient && stompClient.connected) {
                        stompClient.publish({
                            destination: "/app/showImage",
                            body: JSON.stringify({ action: 'countdownEnded' }),
                        });
                    }
                  
                    setTimeout(() => {
                        
                        setCountdown(10);
                    },1500)
                    setCurrentImage(null);
                    return 0;
                }
            });
        }, 1000);
    }, [stompClient]);

    const showNextImage = useCallback(() => {
        imageIndexRef.current = (imageIndexRef.current + 1) % images.length;
        const selectedImage = images[imageIndexRef.current];
        setCurrentImage(selectedImage);

        if (stompClient && stompClient.connected) {
            stompClient.publish({
                destination: "/app/broadcastImage",
                body: JSON.stringify({
                    image: selectedImage,
                    action: 'startCountdown',
                }),
            });
        }

        startLocalCountdown();
    }, [stompClient, images, startLocalCountdown]);

    useEffect(() => {
        if (stompClient) {
            const onConnect = () => {
                const subscription = stompClient.subscribe("/topic/showImage", (message) => {
                    const { image, action } = JSON.parse(message.body);

                    if (image) {
                        setCurrentImage(image);
                    }

                    if (action === 'startCountdown') {
                        startLocalCountdown();
                    }

                    if (action === 'countdownEnded') {
                        // Stop countdown and hide image when countdown ends
                        clearInterval(countdownIntervalRef.current as NodeJS.Timeout);
                        setIsRunning(false);
                        setCurrentImage(null);
                    }
                });

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
    }, [stompClient, startLocalCountdown]);

    return (
        <div>
            {!isRunning && countdown !== 0 && (
                <button onClick={showNextImage}>Start</button>
            )}

            {currentImage ? (
                <div>
                    <img src={currentImage} alt="Current" />
                    {isRunning && countdown > 0 && <p>Countdown: {countdown}</p>}
                
                </div>
            ):(countdown === 0 &&<h1>Paint</h1>)}
        </div>
    );
}

export default ShowPictureComponent;
