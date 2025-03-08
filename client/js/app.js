document.addEventListener("DOMContentLoaded", function () {
  const navBar = document.querySelector("nav");
  const mainDashboard = document.querySelector(".main_dashboard");
  const logoutBtn = document.getElementById("logoutBtn");
  const loginFormSubmitBtn = document.getElementById("loginBtn");
  const navLinks = document.querySelectorAll(".navigation a");
  const profileUserName = document.querySelector(".profile_user_info h3");
  const profileUserPosition = document.querySelector(".profile_user_info p");

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

        const loginFormSubmitBtn = document.getElementById("loginBtn");
        const registerLink = document.getElementById("registerLink");

        if (loginFormSubmitBtn) {
          loginFormSubmitBtn.addEventListener("click", loginUser);
        }

        if (registerLink) {
          registerLink.addEventListener("click", loadRegisterPage);
        }
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

  async function loginUser() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    localStorage.clear();
    try {
      const response = await fetch("http://localhost:8081/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (data.message) {
        alert(data.message);
      } else {
        localStorage.setItem(
          "loggedInUser",
          JSON.stringify({
            id: data[0].id_pracownika,
            imie: data[0].imie,
            nazwisko: data[0].nazwisko,
            stanowisko: data[0].stanowisko,
          })
        );
        mainDashboard.style.backgroundColor = "white";
        loadDashboard();
      }
    } catch (error) {
      alert("Something went wrong, please try again.");
    }
  }

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

  function logoutUser() {
    localStorage.removeItem("loggedInUser");
    loadLoginPage();
  }

  /*** 🔹 Dashboard & Navigation ***/

  async function getUserInfo() {
    const user = JSON.parse(localStorage.getItem("loggedInUser"));
    const user_id = user.id;
    try {
      const response = await fetch("http://localhost:8081/userInfo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id }),
      });
      const data = await response.json();

      if (data.message) {
        alert(data.message);
      } else {
        localStorage.setItem("userInfo", JSON.stringify(data));
      }
    } catch (error) {
      alert("Something went wrong, please try again.");
    }
    profileUserName.textContent = `${user.imie} ${user.nazwisko}`;
    profileUserPosition.textContent = user.stanowisko;
  }

  function loadDashboard() {
    navBar.style.display = "flex";
    loadContent("start");
    getUserInfo();
  }

  function loadContent(section, addToHistory = true) {
    if (!isLoggedIn()) {
      loadLoginPage();
      return;
    }

    fetch(`pages/mainDashboard/${section}.html`)
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
