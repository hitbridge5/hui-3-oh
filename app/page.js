"use client";
import { useState } from "react";

export default function Home() {
  const [formData, setFormData] = useState({
    businessType: "",
    websiteGoal: "",
    designStyle: "",
    customNotes: "",
  });
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult("");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      setResult(data.code || "No output received.");
    } catch (err) {
      setResult("Error generating site.");
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-white text-black p-8 max-w-3xl mx-auto font-sans">
      <h1 className="text-3xl font-bold mb-6 text-center">HUI — Internal Website Builder</h1>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block font-medium mb-1">Business Type</label>
          <select
            name="businessType"
            className="w-full border border-gray-300 rounded px-3 py-2"
            onChange={handleChange}
          >
            <option value="">Select...</option>
            <option>HVAC</option>
            <option>Restaurant</option>
            <option>Plumber</option>
            <option>Electrician</option>
            <option>General Service</option>
          </select>
        </div>

        <div>
          <label className="block font-medium mb-1">Website Goal</label>
          <input
            type="text"
            name="websiteGoal"
            className="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="Lead generation, bookings, credibility..."
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Design Style</label>
          <select
            name="designStyle"
            className="w-full border border-gray-300 rounded px-3 py-2"
            onChange={handleChange}
          >
            <option value="">Select...</option>
            <option>Clean & Professional</option>
            <option>Bold & Modern</option>
            <option>Elegant & Soft</option>
            <option>Dark & Techy</option>
            <option>Minimal</option>
          </select>
        </div>

        <div>
          <label className="block font-medium mb-1">Custom Notes (Optional)</label>
          <textarea
            name="customNotes"
            className="w-full border border-gray-300 rounded px-3 py-2"
            rows="4"
            placeholder="Anything specific to include in the site?"
            onChange={handleChange}
          ></textarea>
        </div>

        <button
          type="submit"
          className="bg-black text-white px-5 py-2 rounded hover:bg-gray-800 w-full"
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate Website"}
        </button>
      </form>

      <div className="mt-10 border-t pt-6">
        <h2 className="text-xl font-semibold mb-2">Generated Output</h2>
        <pre className="bg-gray-100 p-4 rounded text-sm text-gray-700 font-mono whitespace-pre-wrap">
          {result || "Nothing generated yet."}
        </pre>
      </div>
    </main>
  );
}

