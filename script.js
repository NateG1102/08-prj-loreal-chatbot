const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

const CLOUDFLARE_WORKER_URL = "https://loreal-beauty-assistant.loreal-ai.workers.dev";

addMessage("assistant", "👋 Hello! I'm your L’Oréal beauty assistant. Ask me anything about makeup, skincare, haircare, or fragrance!");

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = userInput.value.trim();
  if (!message) return;
  addMessage("user", message);
  userInput.value = "";

  const messages = [
    {
      role: "system",
      content: `You are a friendly L’Oréal beauty assistant. Only answer questions related to L’Oréal’s products, routines, or general beauty advice.`,
    },
    { role: "user", content: message },
  ];

  try {
    const res = await fetch(CLOUDFLARE_WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });

    const data = await res.json();
    console.log("OpenAI API response:", data);
    if (data.error) {
  console.error("❌ OpenAI Error:", data.error);
}
    const reply = data.choices?.[0]?.message?.content || "No response.";
    addMessage("assistant", reply);
  } catch {
    addMessage("assistant", "⚠️ Error connecting to L'Oréal AI.");
  }
});

function addMessage(role, text) {
  const msgDiv = document.createElement("div");
  msgDiv.className = `message ${role}`;
  msgDiv.textContent = (role === "user" ? "🧑 " : "🤖 ") + text;
  chatWindow.appendChild(msgDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}
