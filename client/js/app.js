document.addEventListener("DOMContentLoaded", function () {
  const navBar = document.querySelector("nav");
  const mainDashboard = document.querySelector(".main_dashboard");
  const logoutBtn = document.getElementById("logoutBtn");
  const navLinks = document.querySelectorAll(".navigation a");
  const profileUserName = document.querySelector(".profile_user_info h3");
  const profileUserPosition = document.querySelector(".profile_user_info p");

  /*** 🔹 Authentication Functions ***/

  const isLoggedIn = () => localStorage.getItem("loggedInUser") !== null;

  function loadLoginPage() {
    navBar.style.display = "none";
    mainDashboard.style.backgroundColor = "transparent";

    fetch("pages/auth/login.html")
      .then((response) => response.text())
      .then((html) => {
        mainDashboard.innerHTML = html;
        document
          .getElementById("loginBtn")
          ?.addEventListener("click", loginUser);
        document
          .getElementById("registerLink")
          ?.addEventListener("click", loadRegisterPage);
      })
      .catch((error) => console.error("Error loading the login page:", error));
  }

  async function loginUser() {
    const email = document.getElementById("email")?.value;
    const password = document.getElementById("password")?.value;
    localStorage.clear();

    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8081/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        mainDashboard.style.background = "#FEFEFE";
        mainDashboard.style.justifyContent = "start";
        loadDashboard();
      }
    } catch (error) {
      alert("Something went wrong, please try again.");
    }
  }

  function logoutUser() {
    localStorage.removeItem("loggedInUser");
    loadLoginPage();
  }

  /*** 🔹 Dashboard & Navigation ***/

  async function getUserInfo() {
    const user = JSON.parse(localStorage.getItem("loggedInUser"));

    if (!user) return;

    let userInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (!userInfo) {
      try {
        const response = await fetch("http://localhost:8081/userInfo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: user.id }),
        });

        const data = await response.json();
        if (data.message) {
          alert(data.message);
          return;
        }

        localStorage.setItem("userInfo", JSON.stringify(data));
        userInfo = data;
      } catch (error) {
        alert("Something went wrong, please try again.");
        return;
      }
    }

    const mapped = userInfo.map((info) => {
      return [info.task_description, info.task_status];
    });

    const loadTasks = document.querySelector(".my-tasks");
    if (!loadTasks) {
      console.error("Element with class 'my-tasks' not found.");
      return;
    }

    mapped.forEach(([description, status]) => {
      const taskDiv = document.createElement("div");
      taskDiv.innerHTML = `<strong>Opis:</strong> ${description} <br> <strong>Status:</strong> ${status}`;
      taskDiv.classList.add("task-item");
      loadTasks.appendChild(taskDiv);
    });

    profileUserName.textContent = `${user.imie} ${user.nazwisko}`;
    profileUserPosition.textContent = user.stanowisko;
  }

  async function getInventory() {
    let inventory = JSON.parse(localStorage.getItem("inventory"));

    if (!inventory) {
      try {
        const response = await fetch("http://localhost:8081/getInventory", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch inventory data");
        }

        const data = await response.json();
        console.log("Inventory Data:", data);

        // Store data in localStorage
        localStorage.setItem("inventory", JSON.stringify(data));

        // Render inventory data
        renderInventory(data);
      } catch (error) {
        console.error("Error fetching inventory:", error);
        alert("Something went wrong, please try again.");
      }
    } else {
      // Render inventory from localStorage
      renderInventory(inventory);
    }
  }

  function renderInventory(inventory) {
    const inventoryContainer = document.querySelector(".inventory_wrapper");

    if (!inventoryContainer) {
      console.error("Inventory container not found.");
      return;
    }

    inventoryContainer.innerHTML = ""; // Clear previous content

    inventory.forEach((item) => {
      const itemDiv = document.createElement("div");
      itemDiv.classList.add("inventory-item");
      itemDiv.innerHTML = `
        <strong>${item.nazwa}</strong> <br>
        Ilość: ${item.ilosc} <br>
        QR Code: ${item.qr_code}
      `;
      inventoryContainer.appendChild(itemDiv);
    });
  }

  function loadDashboard() {
    navBar.style.display = "flex";
    loadContent("start");
  }

  function loadContent(section, addToHistory = true) {
    if (!isLoggedIn()) {
      loadLoginPage();
      return;
    }

    fetch(`pages/mainDashboard/${section}.html`)
      .then((response) =>
        response.ok ? response.text() : Promise.reject("Page not found")
      )
      .then((html) => {
        mainDashboard.innerHTML = html;
        updateActiveLink(section);

        if (section === "start") {
          getUserInfo();
        }

        if (section === "magazyn") {
          getInventory();
        }

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
      loadContent(this.getAttribute("data-section"));
    });
  });

  logoutBtn?.addEventListener("click", logoutUser);

  window.addEventListener("popstate", (event) => {
    if (event.state?.section) {
      loadContent(event.state.section, false);
    }
  });

  /*** 🔹 Initialize App ***/

  isLoggedIn() ? loadDashboard() : loadLoginPage();
});
