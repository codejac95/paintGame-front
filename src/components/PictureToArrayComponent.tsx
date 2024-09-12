import React, { useState, useEffect } from 'react';
import UPNG from 'upng-js';

import frog from '/src/pictures/Frog.png'; 

const PictureToArrayComponent: React.FC = () => {
  const [pixelArray, setPixelArray] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const fetchImage = async () => {
      try {
        const response = await fetch(frog);
        const arrayBuffer = await response.arrayBuffer();

        const png = UPNG.decode(arrayBuffer); 
        const rgba = UPNG.toRGBA8(png)[0];   

        
        

        setPixelArray(Array.from(new Uint8Array(rgba))); 
        console.log("Array: ", png);
      } catch (e) {
        console.error('Error during PNG conversion:', e);
        setError("Error during PNG conversion");
      }
    };

    fetchImage();
  }, []);

  return (
    <div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {pixelArray.length > 0 && (
        <div>
          <h4>Array:</h4>
          <pre>{JSON.stringify(pixelArray.slice(0, 1000), null, 2)}...</pre>
        </div>
      )}
    </div>
  );
};

export default PictureToArrayComponent;
