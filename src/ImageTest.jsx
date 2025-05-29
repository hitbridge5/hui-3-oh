import React, { useState } from 'react';

export default function ImageTest() {
  const [images, setImages] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);

    const response = await fetch("https://crevsaromipwyvuaqonh.functions.supabase.co/generate-images", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        hero_image: "A stylish cafe storefront with modern signage, people walking by, and warm lighting at sunset",
        services_image: "A barista using a sleek espresso machine in a cozy coffee shop",
        about_image: "Three friendly employees behind a wooden cafe counter, smiling at the camera",
        contact_image: "A coffee cup with a company logo, next to a smartphone and notebook on a rustic table"
      })
    });

    const data = await response.json();
    setImages(data);
    setLoading(false);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Generate Website Section Images</h1>
      <button onClick={handleGenerate} disabled={loading}>
        {loading ? "Generating..." : "Generate Images"}
      </button>

      {images && (
        <div style={{ marginTop: "2rem", display: "grid", gap: "1rem" }}>
          {Object.entries(images).map(([label, url]) => (
            <div key={label}>
              <h3>{label.replace("_", " ")}</h3>
              <img src={url} alt={label} style={{ width: "400px", border: "1px solid #ccc" }} />
              <p style={{ wordWrap: "break-word" }}>
                <a href={url} target="_blank" rel="noopener noreferrer">{url}</a>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
