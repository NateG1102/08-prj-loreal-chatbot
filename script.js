const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Replace this with your actual deployed Cloudflare Worker URL
const CLOUDFLARE_WORKER_URL = "https://your-worker-name.your-subdomain.workers.dev";

// Initial greeting
addMessage("assistant", "👋 Hello! I'm your L’Oréal beauty assistant. Ask me anything about makeup, skincare, haircare, or fragrance!");

// Handle form submission
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const message = userInput.value.trim();
  if (!message) return;

  addMessage("user", message);
  userInput.value = "";

  const systemPrompt = {
    role: "system",
    content: `You are a friendly L’Oréal beauty assistant. Only answer questions related to L’Oréal’s products, routines, or general beauty advice (makeup, skincare, haircare, fragrance). If the question is unrelated, politely respond that you can only help with L’Oréal beauty topics.`,
  };

  const messages = [
    systemPrompt,
    { role: "user", content: message }
  ];

  try {
    const res = await fetch(CLOUDFLARE_WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });

    const data = await res.json();

    const reply = data.choices?.[0]?.message?.content || "I'm sorry, I couldn't generate a response.";
    addMessage("assistant", reply);

  } catch (err) {
    console.error("Error:", err);
    addMessage("assistant", "⚠️ Sorry, I had trouble connecting. Please try again later.");
  }
});

function addMessage(role, text) {
  const msgDiv = document.createElement("div");
  msgDiv.className = `message ${role}`;
  msgDiv.textContent = (role === "user" ? "🧑 " : "🤖 ") + text;
  chatWindow.appendChild(msgDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}
