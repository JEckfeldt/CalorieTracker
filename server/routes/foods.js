const express = require("express");
const router = express.Router();
const https = require("https");

function fetchFoodDetails(fdcId, apiKey) {
  return new Promise((resolve, reject) => {
    const url = `https://api.nal.usda.gov/fdc/v1/food/${fdcId}?api_key=${apiKey}`;

    https.get(url, (apiRes) => {
      let data = "";

      apiRes.on("data", (chunk) => {
        data += chunk;
      });

      apiRes.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch (err) {
          reject(err);
        }
      });
    }).on("error", reject);
  });
}

router.get("/search", async (req, res) => {
  const query = req.query.query || "";
  const apiKey = "TNQIzT4MYgNnNr4PwlNbr1CUYvEEaGy1WRdvrHEh";

  if (!query) {
    return res.json({ query, results: [] });
  }

  const searchUrl = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&pageSize=5&api_key=${apiKey}`;

  https.get(searchUrl, async (apiRes) => {
    let data = "";

    apiRes.on("data", (chunk) => {
      data += chunk;
    });

    apiRes.on("end", async () => {
      try {
        const parsed = JSON.parse(data);
        const foods = parsed.foods || [];

        const results = await Promise.all(
          foods.map(async (food) => {
            try {
              const details = await fetchFoodDetails(food.fdcId, apiKey);

              return {
                id: food.fdcId,
                name: food.description,
                calories: food.foodNutrients?.find((n) => n.nutrientName === "Energy")?.value || null,
                protein: food.foodNutrients?.find((n) => n.nutrientName === "Protein")?.value || null,
                carbs: food.foodNutrients?.find((n) => n.nutrientName === "Carbohydrate, by difference")?.value || null,
                fat: food.foodNutrients?.find((n) => n.nutrientName === "Total lipid (fat)")?.value || null
              };
            } catch (err) {
              return {
                id: food.fdcId,
                name: food.description,
                calories: food.foodNutrients?.find((n) => n.nutrientName === "Energy")?.value || null,
                protein: food.foodNutrients?.find((n) => n.nutrientName === "Protein")?.value || null,
                carbs: food.foodNutrients?.find((n) => n.nutrientName === "Carbohydrate, by difference")?.value || null,
                fat: food.foodNutrients?.find((n) => n.nutrientName === "Total lipid (fat)")?.value || null
              };
            }
          })
        );

        res.json({ query, results });
      } catch (err) {
        res.status(500).json({ error: "Failed to parse USDA response" });
      }
    });
  }).on("error", () => {
    res.status(500).json({ error: "Failed to reach USDA API" });
  });
});

module.exports = router;