import { useState, useRef, useEffect, useCallback } from "react";
import { useWebSocket } from "./WebSocketComponent";

import BallImage from "../pictures/Ball.png";
import BearImage from "../pictures/Bear.png";
import DanceImage from "../pictures/Dance.png";
import FrogImage from "../pictures/Frog.png";
import SquareImage from "../pictures/Square.png";

interface ShowPictureComponentProps {
  onPaintTimeout: () => void;
  imageIndex: number;

}

function ShowPictureComponent({ onPaintTimeout, imageIndex }: ShowPictureComponentProps) {
  const images = [BallImage, BearImage, DanceImage, FrogImage, SquareImage];
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(10);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [paintVisible, setPaintVisible] = useState<boolean>(false);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const stompClient = useWebSocket();
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

          // Notify the parent to show the next image
          onPaintTimeout();
          return 0;
        }
      });
    }, 1000);
  }, [stompClient, onPaintTimeout]);



  const showNextImage = useCallback(() => {
    const selectedImage = images[imageIndex];
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
    setGameStarted(true);
  }, [images, imageIndex, stompClient, startLocalCountdown]);


  useEffect(() => {
    if (gameStarted) {
      setCurrentImage(images[imageIndex]);
    }
  }, [imageIndex, images, gameStarted]);




  useEffect(() => {
    if (stompClient) {
      const onConnect = () => {
        const subscription = stompClient.subscribe("/topic/showImage", (message) => {
          const { image, action } = JSON.parse(message.body);

          if (action === 'startCountdown') {
            setCurrentImage(image);
            startLocalCountdown();
            setGameStarted(true);
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
        stompClient.onConnect = () => { };
      }
    };
  }, [stompClient, startLocalCountdown]);

  //testing
  useEffect(() => {
    if (countdown === 0) {
      setPaintVisible(true);
      const timer = setTimeout(() => {
        setPaintVisible(false);
      }, 1500); // Display "Paint" for 1.5 seconds

      return () => clearTimeout(timer);
    }
  }, [countdown]);


  return (
    <>
      <div>
        {!isRunning && countdown === 10 && !gameStarted && <button onClick={showNextImage}>Play Game</button>}

        {currentImage && !paintVisible ? <div>
          <img src={currentImage} alt="Current" />
          {isRunning && countdown > 0 && <p>Countdown: {countdown}</p>}
        </div>
          :
          paintVisible && <h1>Paint</h1>}
      </div>

    </>
  );
}

export default ShowPictureComponent;

