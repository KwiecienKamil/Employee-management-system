// Changing content based on button click
const navLinks = document.querySelectorAll(".navigation a");
const mainDashboard = document.querySelector(".main_dashboard");

function loadContent(section, addToHistory = true) {
  fetch(`pages/${section}.html`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Page not found");
      }
      return response.text();
    })
    .then((html) => {
      mainDashboard.innerHTML = html;
      if (addToHistory) {
        history.pushState({ section }, "", `?page=${section}`);
      }
    })
    .catch(() => {
      mainDashboard.innerHTML = "<h2>Błąd ładowania strony</h2>";
    });
}

navLinks.forEach((link) => {
  link.addEventListener("click", function (event) {
    event.preventDefault();
    const section = this.getAttribute("data-section");
    loadContent(section);
  });
});

async function fetchUsers() {
  try {
    const response = await fetch("http://localhost:8081/recipes");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const recipes = await response.json();

    console.log(recipes);
  } catch (error) {
    console.error("Error fetching recipes:", error);
  }
}

fetchUsers();
