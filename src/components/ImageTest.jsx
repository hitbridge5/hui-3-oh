async function generateImagesFromPrompts(prompts) {
    const response = await fetch("https://crevsaromipwyvuaqonh.functions.supabase.co/generate-images", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(prompts)
    });
  
    const data = await response.json();
    return data;
  }
  import React, { useState } from 'react';

  export default function ImageTest() {
    const [images, setImages] = useState(null);
  
    const handleGenerate = async () => {
      const prompts = {
        hero_image: "A cozy cafe with modern decor and warm lighting",
        services_image: "Barista making espresso in a clean, stylish coffee shop",
        about_image: "Friendly team of baristas smiling behind the counter",
        contact_image: "Coffee cup with logo next to a smartphone and business card"
      };
  
      const result = await generateImagesFromPrompts(prompts);
      setImages(result);
    };
  
    return (
      <div>
        <button onClick={handleGenerate}>Generate Images</button>
  
        {images && (
          <div>
            <img src={images.hero} alt="Hero" width="300" />
            <img src={images.services} alt="Services" width="300" />
            <img src={images.about} alt="About" width="300" />
            <img src={images.contact} alt="Contact" width="300" />
          </div>
        )}
      </div>
    );
  }
    