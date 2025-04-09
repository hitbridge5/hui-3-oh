"use client";
import { useState } from "react";

export default function Home() {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult("");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const data = await res.json();
      setResult(JSON.stringify(data, null, 2)); // 🔥 show full response
    } catch (err) {
      setResult("Fetch error: " + err.message);
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen p-10 font-sans max-w-3xl mx-auto text-black">
      <h1 className="text-2xl font-bold mb-6">DEBUG MODE: GPT Output</h1>
      <form onSubmit={handleSubmit}>
        <button
          type="submit"
          className="bg-black text-white px-5 py-2 rounded"
          disabled={loading}
        >
          {loading ? "Generating..." : "Submit Test Prompt"}
        </button>
      </form>

      <pre className="mt-6 bg-gray-100 p-4 rounded text-sm whitespace-pre-wrap">
        {result || "Waiting for response..."}
      </pre>
    </main>
  );
}
