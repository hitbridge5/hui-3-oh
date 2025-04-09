// ✅ app/page.js
"use client";
import { useState } from "react";

export default function Home() {
  const [formData, setFormData] = useState({
    businessType: "",
    websiteGoal: "",
    designStyle: "",
    customNotes: "",
  });
  const [html, setHtml] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setHtml("");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      const content = data.code || data.choices?.[0]?.message?.content || "No output.";
      setHtml(content);
    } catch (err) {
      setHtml("Error generating site.");
    }

    setLoading(false);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !html) return;

    setEditing(true);

    try {
      const res = await fetch("/api/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instruction: chatInput, html }),
      });

      const data = await res.json();
      const updated = data.code || "No changes made.";
      setHtml(updated);
      setChatInput("");
    } catch (err) {
      console.error("Edit error:", err);
    }

    setEditing(false);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen">
      {/* Left Panel: Form + Chat */}
      <div className="bg-white p-6 md:p-10 border-r border-gray-200">
        <h1 className="text-2xl font-bold mb-6">HUI — Internal Website Builder</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Business Type</label>
            <select
              name="businessType"
              className="w-full border border-gray-300 rounded px-3 py-2"
              onChange={handleChange}
              required
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
              placeholder="e.g., lead generation, bookings..."
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Design Style</label>
            <select
              name="designStyle"
              className="w-full border border-gray-300 rounded px-3 py-2"
              onChange={handleChange}
              required
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
            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 w-full"
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate Website"}
          </button>
        </form>

        {html && (
          <form onSubmit={handleEditSubmit} className="mt-10 space-y-4">
            <h2 className="text-lg font-semibold">Edit Site with Instructions</h2>
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="e.g., Add a testimonials section"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
              disabled={editing}
            >
              {editing ? "Applying..." : "Apply Change"}
            </button>
          </form>
        )}
      </div>

      {/* Right Panel: Preview */}
      <div className="bg-gray-50 overflow-auto p-6">
        <h2 className="text-lg font-semibold mb-4">Live Preview</h2>
        <div
          className="border border-gray-300 rounded-lg bg-white p-4 min-h-[90vh] text-black text-base"
          dangerouslySetInnerHTML={{ __html: html }}
        ></div>
      </div>
    </div>
  );
}
