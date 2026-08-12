document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("addRecipeForm");
  const message = document.getElementById("message");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    message.textContent = "";

    const recipeName = document.getElementById("recipeName").value.trim();
    const category = document.getElementById("category").value;
    const ingredients = document.getElementById("ingredients").value.trim();
    const instructions = document.getElementById("instructions").value.trim();
    const cookingTime = document.getElementById("cookingTime").value.trim();
    const image = document.getElementById("image").value.trim();

    if (
      !recipeName ||
      !category ||
      !ingredients ||
      !instructions ||
      !cookingTime
    ) {
      showMessage("Please fill in all required fields.", "error");
      return;
    }

    try {
      const response = await fetch("/api/addRecipe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipeName,
          category,
          ingredients,
          instructions,
          cookingTime,
          image,
        }),
      });

      const data = await response.json();

      if (data.success) {
        showMessage("Recipe added successfully!", "success");
        form.reset();
      } else {
        showMessage(data.message, "error");
      }
    } catch (error) {
      console.error(error);
      showMessage("Could not connect to the server.", "error");
    }
  });

  function showMessage(text, type) {
    message.textContent = text;
    message.style.color = type === "error" ? "#d63031" : "#27ae60";
    message.style.fontWeight = "bold";
    message.style.marginTop = "15px";
  }
});