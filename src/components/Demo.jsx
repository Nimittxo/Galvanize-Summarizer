import { useState, useEffect } from "react";

const API_URL = "http://localhost:8000/summarize";

const Demo = () => {
  const [inputType, setInputType] = useState("url"); // "url" or "text"
  const [inputValue, setInputValue] = useState("");
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [isUrlDisabled] = useState(true);

  // Note: Using in-memory storage instead of localStorage for Claude.ai compatibility
  useEffect(() => {
    // In a real app, you would load from localStorage here
    // const saved = JSON.parse(localStorage.getItem("summaries") || "[]");
    // setHistory(saved);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSummary("");

    let payload = {};
    if (inputType === "url") payload.url = inputValue;
    else payload.text = inputValue;

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Summarization failed");
      setSummary(data.summary);

      // Save to history (in-memory for demo)
      const entry = { 
        type: inputType, 
        value: inputValue, 
        summary: data.summary,
        timestamp: new Date().toISOString()
      };
      const updatedHistory = [entry, ...history.slice(0, 9)]; // Keep only 10 most recent
      setHistory(updatedHistory);
      
      // In a real app, you would save to localStorage here
      // localStorage.setItem("summaries", JSON.stringify(updatedHistory));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFromHistory = (item) => {
    setInputType(item.type);
    setInputValue(item.value);
    setSummary(item.summary);
    setError("");
  };

  const clearHistory = () => {
    setHistory([]);
    // In a real app: localStorage.removeItem("summaries");
  };

  return (
    <>
      {/* Main Content */}
      <section className="mt-16 w-full max-w-2xl mx-auto px-4">
        <div className="flex flex-col w-full">
          <form className="flex flex-col" onSubmit={handleSubmit}>
            {/* Toggle Switch */}
            <div className="toggle_container">
              <div className="toggle_wrapper">
                <div className={`toggle_slider ${inputType === 'text' ? 'right' : ''}`}></div>
                <div  
      className={`toggle_option ${inputType === 'url' ? 'active' : ''} opacity-50 cursor-not-allowed`}
      title="URL input is currently disabled"
    >
      🔗 URL
          </div>
          <div 
            className={`toggle_option ${inputType === 'text' ? 'active' : ''}`}
            onClick={() => { setInputType("text"); setInputValue(""); setError(""); }}
          >
            📝 Text
          </div>
        </div>
      </div>

            {/* Input Field */}
            <div className="input_container">
              {inputType === "url" ? (
                <input
                  type="url"
                  placeholder="🌐 Enter a URL to summarize..."
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  required
                  className="url_input"
                />
              ) : (
                <textarea
                  placeholder="✍️ Paste or type your text here to get a summary..."
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  required
                  className="textarea_input"
                  rows={6}
                />
              )}
            </div>

            {/* Submit Button */}
            <button type="submit" className="submit_btn" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="loading_spinner w-5 h-5 mr-2"></div>
                  Summarizing...
                </>
              ) : (
                <>
                  ✨ Summarize
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results Display */}
        <div className="summary_container">
          {error && (
            <div className="error_container">
              <p className="error_text">❌ {error}</p>
            </div>
          )}
          
          {summary && !error && (
            <div className="summary_container">
              <div className="summary_header">
                <h2 className="summary_title">
                  ✨ Summary
                </h2>
              </div>
              <div className="summary_box">
                <div className="summary_list">
                  {summary.split('\n').filter(point => point.trim()).map((point, idx) => (
                    <div key={idx} className="summary_item">
                      <div className="summary_bullet"></div>
                      <p className="summary_text">
                        {point.replace(/^- /, "").trim()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {isLoading && (
            <div className="loading_container">
              <div className="loading_spinner"></div>
              <p className="loading_text">Processing your content...</p>
            </div>
          )}
        </div>
      </section>

      {/* History Sidebar */}
      <div className="history_container">
        <div className="history_header">
          <h3 className="history_title">📚 Recent Summaries</h3>
          <p className="history_subtitle">Click to reload</p>
          {history.length > 0 && (
            <button 
              onClick={clearHistory}
              className="mt-2 text-xs text-red-400 hover:text-red-300 transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
        
        <div className="history_list">
          {history.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">No summaries yet</p>
              <p className="text-gray-600 text-xs mt-1">Your history will appear here</p>
            </div>
          ) : (
            history.map((item, idx) => (
              <div
                key={idx}
                className="link_card"
                onClick={() => loadFromHistory(item)}
              >
                <div className={`link_card_type ${item.type}`}>
                  {item.type === "url" ? "🔗 URL" : "📝 Text"}
                </div>
                <div className="link_card_content">
                  {item.type === "url" 
                    ? item.value 
                    : item.value.length > 60 
                      ? item.value.slice(0, 60) + "..." 
                      : item.value
                  }
                </div>
                <div className="link_card_summary">
                  {item.summary.split('\n')[0]?.replace(/^- /, "").slice(0, 100)}
                  {item.summary.length > 100 ? "..." : ""}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default Demo;