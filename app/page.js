// ✅ app/page.js
"use client";
import { useState, useEffect } from "react";

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
  const [selectedEl, setSelectedEl] = useState(null);
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [mobileButtons, setMobileButtons] = useState([
    { label: "Call", type: "tel", value: "" },
    { label: "Directions", type: "map", value: "" },
    { label: "Custom", type: "custom", value: "" },
  ]);

  const handleMobileButtonChange = (index, field, value) => {
    const updated = [...mobileButtons];
    updated[index][field] = value;
    setMobileButtons(updated);
  };

  const renderMobileButtons = () => {
    return `
      <div style="position: fixed; bottom: 10px; left: 0; right: 0; display: flex; justify-content: center; gap: 10px; z-index: 1000;">
        ${mobileButtons
          .filter((btn) => btn.value)
          .map((btn) => {
            let href = "#";
            if (btn.type === "tel") href = `tel:${btn.value}`;
            else if (btn.type === "map") href = `https://www.google.com/maps/search/?api=1&query=${btn.value}`;
            else href = btn.value;
            return `<a href="${href}" target="_blank" style="padding: 10px 16px; background: #2563eb; color: white; border-radius: 8px; font-weight: bold; text-decoration: none;">${btn.label}</a>`;
          })
          .join("\n")}
      </div>`;
  };

  const applyMobileButtons = () => {
    const preview = document.getElementById("preview");
    if (!preview) return;
    const wrapper = document.createElement("div");
    wrapper.innerHTML = renderMobileButtons();
    preview.appendChild(wrapper);
    setHtml(preview.innerHTML);
    setHistory((prev) => [...prev, preview.innerHTML]);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setHtml("");
    setHistory([]);
    setRedoStack([]);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      const content = data.code || data.choices?.[0]?.message?.content || "No output.";
      setHtml(content);
      setHistory([content]);
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
      setHistory((prev) => [...prev, updated]);
      setRedoStack([]);
      setHtml(updated);
      setChatInput("");
    } catch (err) {
      console.error("Edit error:", err);
    }

    setEditing(false);
  };

  const handleUndo = () => {
    if (history.length < 2) return;
    const newRedo = history[history.length - 1];
    const newHistory = history.slice(0, -1);
    setHtml(newHistory[newHistory.length - 1]);
    setHistory(newHistory);
    setRedoStack((prev) => [newRedo, ...prev]);
  };

  const handleRedo = () => {
    if (!redoStack.length) return;
    const next = redoStack[0];
    setHtml(next);
    setHistory((prev) => [...prev, next]);
    setRedoStack(redoStack.slice(1));
  };

  const handleExport = () => {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "website.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (!html) return;
    const container = document.getElementById("preview");
    if (!container) return;

    const clickHandler = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const target = e.target;
      if (target !== container) {
        setSelectedEl(target);
        target.style.outline = "2px solid #0070f3";
      }
    };

    const all = container.querySelectorAll("*");
    all.forEach((el) => {
      el.addEventListener("click", clickHandler);
    });

    return () => {
      all.forEach((el) => {
        el.removeEventListener("click", clickHandler);
        el.style.outline = "none";
      });
    };
  }, [html]);

  const applyStyle = (styleProp, value) => {
    if (!selectedEl) return;
    selectedEl.style[styleProp] = value;
    const updated = document.getElementById("preview").innerHTML;
    setHtml(updated);
    setHistory((prev) => [...prev, updated]);
    setRedoStack([]);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen font-sans text-gray-900">
      <div className="bg-white p-6 md:p-10 border-r border-gray-200">
        <h1 className="text-2xl font-bold mb-6">HUI — Internal Website Builder</h1>

        <div className="flex gap-2 mb-4">
          <button onClick={handleUndo} className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300">Undo</button>
          <button onClick={handleRedo} className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300">Redo</button>
          <button onClick={handleExport} className="ml-auto bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">Export HTML</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Business Type</label>
            <select name="businessType" className="w-full border border-gray-300 rounded px-3 py-2" onChange={handleChange} required>
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
            <input type="text" name="websiteGoal" className="w-full border border-gray-300 rounded px-3 py-2" placeholder="e.g., lead generation, bookings..." onChange={handleChange} required />
          </div>

          <div>
            <label className="block font-medium mb-1">Design Style</label>
            <select name="designStyle" className="w-full border border-gray-300 rounded px-3 py-2" onChange={handleChange} required>
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
            <textarea name="customNotes" className="w-full border border-gray-300 rounded px-3 py-2" rows="4" placeholder="Anything specific to include in the site?" onChange={handleChange}></textarea>
          </div>

          <button type="submit" className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 w-full" disabled={loading}>
            {loading ? "Generating..." : "Generate Website"}
          </button>
        </form>

        <div className="mt-10">
          <h2 className="text-lg font-semibold mb-2">Mobile Button Manager</h2>
          {mobileButtons.map((btn, idx) => (
            <div key={idx} className="mb-4">
              <label className="block text-sm font-medium mb-1">{btn.label} Button</label>
              <input
                type="text"
                placeholder={`Enter ${btn.type === "tel" ? "phone number" : btn.type === "map" ? "address" : "URL"}`}
                value={btn.value}
                onChange={(e) => handleMobileButtonChange(idx, "value", e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
          ))}
          <button onClick={applyMobileButtons} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Apply Mobile Buttons</button>
        </div>

        {html && (
          <>
            <form onSubmit={handleEditSubmit} className="mt-10 space-y-4">
              <h2 className="text-lg font-semibold">Edit Site with Instructions</h2>
              <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" placeholder="e.g., Add a testimonials section" />
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full" disabled={editing}>
                {editing ? "Applying..." : "Apply Change"}
              </button>
            </form>

            {selectedEl && (
              <div className="mt-6 space-y-3">
                <h3 className="text-sm font-medium">Selected Element Styling</h3>
                <div className="flex flex-col gap-2">
                  <label className="text-sm">Background Color</label>
                  <input type="color" onChange={(e) => applyStyle("backgroundColor", e.target.value)} />
                  <label className="text-sm">Text Color</label>
                  <input type="color" onChange={(e) => applyStyle("color", e.target.value)} />
                  <label className="text-sm">Font Size</label>
                  <select onChange={(e) => applyStyle("fontSize", e.target.value)}>
                    <option value="">Default</option>
                    <option value="12px">12px</option>
                    <option value="14px">14px</option>
                    <option value="16px">16px</option>
                    <option value="20px">20px</option>
                    <option value="24px">24px</option>
                    <option value="32px">32px</option>
                  </select>
                  <label className="text-sm">Padding</label>
                  <select onChange={(e) => applyStyle("padding", e.target.value)}>
                    <option value="">Default</option>
                    <option value="4px">4px</option>
                    <option value="8px">8px</option>
                    <option value="12px">12px</option>
                    <option value="16px">16px</option>
                  </select>
                  <label className="text-sm">Border Radius</label>
                  <select onChange={(e) => applyStyle("borderRadius", e.target.value)}>
                    <option value="">None</option>
                    <option value="4px">4px</option>
                    <option value="8px">8px</option>
                    <option value="12px">12px</option>
                    <option value="16px">16px</option>
                  </select>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="bg-gray-50 overflow-auto p-6">
        <h2 className="text-lg font-semibold mb-4">Live Preview</h2>
        <div id="preview" className="border border-gray-300 rounded-lg bg-white p-4 min-h-[90vh] text-black text-base font-sans" dangerouslySetInnerHTML={{ __html: html }}></div>
      </div>
    </div>
  );
}