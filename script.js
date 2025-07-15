// Final script.js for L’Oréal Routine Builder with full functionality

const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");
const categoryFilter = document.getElementById("categoryFilter");
const productsContainer = document.getElementById("productsContainer");
const selectedProductsList = document.getElementById("selectedProductsList");
const generateBtn = document.getElementById("generateRoutine");
const clearBtn = document.getElementById("clearSelections");

const CLOUDFLARE_WORKER_URL = "https://loreal-beauty-assistant.loreal-ai.workers.dev";

let allProducts = [];
let selectedProducts = JSON.parse(localStorage.getItem("selectedProducts")) || [];
let chatHistory = [
  {
    role: "system",
    content:
      "You are a friendly L’Oréal beauty assistant. You help users choose routines using real L’Oréal products and answer beauty-related questions. Only answer questions about beauty, skincare, haircare, or makeup.",
  },
];

// Load products.json
fetch("products.json")
  .then((res) => res.json())
  .then((data) => {
    allProducts = data.products; // <-- Use data.products, the actual array
    renderProducts(allProducts); // render all products initially or choose to filter
  });


// Filter products by category
categoryFilter.addEventListener("change", () => {
  const category = categoryFilter.value;
  const filtered = allProducts.filter((p) => p.category === category);
  renderProducts(filtered);
});

function renderProducts(products) {
  productsContainer.innerHTML = "";
  products.forEach((product) => {
    const card = document.createElement("div");
    card.className = "product-card";
    if (selectedProducts.some((p) => p.name === product.name)) {
      card.classList.add("selected");
    }

    card.innerHTML = `
  <img src="${product.image}" alt="${product.name}" class="product-image" />
  <h3>${product.name}</h3>
  <p class="brand">${product.brand}</p>
  <button class="desc-toggle">Description</button>
  <p class="description" style="display: none;">${product.description}</p>
`;

    card.addEventListener("click", (e) => {
      if (e.target.classList.contains("desc-toggle")) {
        const desc = card.querySelector(".description");
        desc.style.display = desc.style.display === "none" ? "block" : "none";
        return;
      }

      const index = selectedProducts.findIndex((p) => p.name === product.name);
      if (index > -1) {
        selectedProducts.splice(index, 1);
        card.classList.remove("selected");
      } else {
        selectedProducts.push(product);
        card.classList.add("selected");
      }
      localStorage.setItem("selectedProducts", JSON.stringify(selectedProducts));
      renderSelected();
    });

    productsContainer.appendChild(card);
  });
}

function renderSelected() {
  selectedProductsList.innerHTML = "";
  selectedProducts.forEach((product, index) => {
    const item = document.createElement("div");
    item.className = "selected-item";
    item.innerHTML = `
      <span>${product.name}</span>
      <button data-index="${index}" class="remove-btn">&times;</button>
    `;

    item.querySelector(".remove-btn").addEventListener("click", () => {
      selectedProducts.splice(index, 1);
      renderSelected();
      // Don't re-render product cards here
      // renderProducts(allProducts.filter((p) => p.category === categoryFilter.value));
      // Instead, just remove selection class from the deselected card:
      // Find the card and remove 'selected' class manually:
      const cards = document.querySelectorAll(".product-card");
      cards.forEach(card => {
        if (card.querySelector("h3").textContent === product.name) {
          card.classList.remove("selected");
        }
      });
    });

    selectedProductsList.appendChild(item);
  });
}


clearBtn.addEventListener("click", () => {
  selectedProducts = [];
  localStorage.removeItem("selectedProducts");
  renderSelected();
  renderProducts(allProducts.filter((p) => p.category === categoryFilter.value));
});

// Chat greeting
addMessage("assistant", "👋 Hello! I'm your L’Oréal beauty assistant. Ask me anything about makeup, skincare, haircare, or fragrance!");

generateBtn.addEventListener("click", async () => {
  if (selectedProducts.length === 0) return alert("Please select products first.");

  const prompt = `Create a beauty routine using these products: ${selectedProducts
    .map((p) => `${p.name} by ${p.brand}`)
    .join(", ")}. Include skincare, makeup, and haircare tips.`;

  chatHistory.push({ role: "user", content: prompt });
  addMessage("user", prompt);

  const response = await sendToAI(chatHistory);
  const reply = response?.choices?.[0]?.message?.content || "No response.";
  chatHistory.push({ role: "assistant", content: reply });
  addMessage("assistant", reply);
});


chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = userInput.value.trim();
  if (!message) return;
  addMessage("user", message);
  userInput.value = "";
  chatHistory.push({ role: "user", content: message });
  const response = await sendToAI(chatHistory);
  const reply = response?.choices?.[0]?.message?.content || "No response.";
  chatHistory.push({ role: "assistant", content: reply });
  addMessage("assistant", reply);
});

function addMessage(role, text) {
  const msgDiv = document.createElement("div");
  msgDiv.className = `message ${role}`;
  msgDiv.textContent = (role === "user" ? "🧑 " : "🤖 ") + text;
  chatWindow.appendChild(msgDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

async function sendToAI(messages) {
  try {
    const res = await fetch(CLOUDFLARE_WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });
    return await res.json();
  } catch (err) {
    console.error("❌ OpenAI Error:", err);
    return { error: "⚠️ Failed to fetch from OpenAI" };
  }
}
