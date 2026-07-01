console.log("App loaded!");

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.querySelector("input[placeholder='Search for food...']");
  const resultsContainer = document.querySelector(".bg-white.p-4.rounded-xl.shadow:nth-of-type(2)");

  if (!searchInput || !resultsContainer) return;

  searchInput.addEventListener("keydown", async (event) => {
    if (event.key !== "Enter") return;

    const query = searchInput.value.trim();
    if (!query) return;

    const response = await fetch(`/api/foods/search?query=${encodeURIComponent(query)}`);
    const data = await response.json();

    let html = `
      <h2 class="font-semibold mb-2">Search Results</h2>
    `;

    if (!data.results || data.results.length === 0) {
      html += `<p class="text-slate-400">No results found</p>`;
    } else {
      html += data.results.map((food) => `
        <div class="mt-3 border rounded-lg p-3 flex justify-between items-start gap-3">
          <div>
            <p class="font-medium">${food.name}</p>
            <p class="text-sm text-slate-500">
              Calories: ${food.calories ?? "n/a"} • Protein: ${food.protein ?? "n/a"}g
            </p>
            <p class="text-sm text-slate-500">
              Carbs: ${food.carbs ?? "n/a"}g • Fat: ${food.fat ?? "n/a"}g
            </p>
          </div>
          <button class="bg-green-500 text-white px-3 py-1 rounded-lg text-sm">
            Add
          </button>
        </div>
      `).join("");
    }

    resultsContainer.innerHTML = html;
  });
});