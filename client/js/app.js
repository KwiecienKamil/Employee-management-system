document.addEventListener("DOMContentLoaded", function () {
  const navBar = document.querySelector("nav");
  const mainDashboard = document.querySelector(".main_dashboard");
  const logoutBtn = document.getElementById("logoutBtn");
  const navLinks = document.querySelectorAll(".navigation a");

  /*** 🔹 Authentication Functions ***/

  function isLoggedIn() {
    return localStorage.getItem("loggedInUser") !== null;
  }

  function loadLoginPage() {
    navBar.style.display = "none";
    mainDashboard.style.backgroundColor = "transparent";
    fetch("pages/auth/login.html")
      .then((response) => response.text())
      .then((html) => {
        mainDashboard.innerHTML = html;

        document
          .getElementById("loginBtn")
          .addEventListener("click", loginUser);
        document
          .getElementById("registerLink")
          .addEventListener("click", loadRegisterPage);
      })
      .catch((error) => console.error("Error loading the login page:", error));
  }

  function loadRegisterPage() {
    mainDashboard.style.backgroundColor = "transparent";

    fetch("pages/auth/register.html")
      .then((response) => response.text())
      .then((html) => {
        mainDashboard.innerHTML = html;

        document
          .getElementById("registerBtn")
          .addEventListener("click", registerUser);
        document
          .getElementById("loginLink")
          .addEventListener("click", loadLoginPage);
      })
      .catch((error) =>
        console.error("Error loading the register page:", error)
      );
  }

  // Handle login
  function loginUser() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // Dummy login check
    if (username === "admin" && password === "1234") {
      localStorage.setItem("loggedInUser", username);
      mainDashboard.style.backgroundColor = "white";
      loadDashboard();
    } else {
      alert("Invalid username or password!");
    }
  }

  // Handle registration
  function registerUser() {
    const newUsername = document.getElementById("newUsername").value;
    const newPassword = document.getElementById("newPassword").value;

    if (newUsername && newPassword) {
      localStorage.setItem(newUsername, newPassword);
      alert("Registration successful! Please log in.");
      loadLoginPage();
    } else {
      alert("Please fill all fields.");
    }
  }

  // Logout user
  function logoutUser() {
    localStorage.removeItem("loggedInUser");
    loadLoginPage();
  }

  /*** 🔹 Dashboard & Navigation ***/

  // Show dashboard after login
  function loadDashboard() {
    navBar.style.display = "flex";
    loadContent("start");
  }

  // Load content dynamically
  function loadContent(section, addToHistory = true) {
    if (!isLoggedIn()) {
      loadLoginPage();
      return;
    }

    fetch(`pages//mainDashboard/${section}.html`)
      .then((response) => {
        if (!response.ok) throw new Error("Page not found");
        return response.text();
      })
      .then((html) => {
        mainDashboard.innerHTML = html;
        updateActiveLink(section);

        if (addToHistory) {
          history.pushState({ section }, "", `?page=${section}`);
        }
      })
      .catch(() => {
        mainDashboard.innerHTML = "<h2>Error loading page</h2>";
      });
  }

  function updateActiveLink(activeSection) {
    navLinks.forEach((link) => {
      link.classList.toggle(
        "active",
        link.getAttribute("data-section") === activeSection
      );
    });
  }

  /*** 🔹 Event Listeners ***/

  navLinks.forEach((link) => {
    link.addEventListener("click", function (event) {
      event.preventDefault();
      const section = this.getAttribute("data-section");
      loadContent(section);
    });
  });

  if (logoutBtn) {
    logoutBtn.addEventListener("click", logoutUser);
  }

  // Handle back/forward navigation
  window.addEventListener("popstate", (event) => {
    if (event.state && event.state.section) {
      loadContent(event.state.section, false);
    }
  });

  /*** 🔹 Initialize App ***/

  if (isLoggedIn()) {
    loadDashboard();
  } else {
    loadLoginPage();
  }
});
