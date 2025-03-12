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
    mainDashboard.style.justifyContent = "center";

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
        mainDashboard.style.background =
          "linear-gradient(to bottom,rgba(255, 255, 255, 0.5) 0%,rgba(0, 0, 0, 0.5) 100%),radial-gradient(at 50% 0%,rgba(255, 255, 255, 0.1) 0%,rgba(0, 0, 0, 0.5) 50%)";
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

    const mappedTasks = userInfo
      .filter((info) => info.task_description) // Ensure only tasks with descriptions are mapped
      .map((info) => [info.task_description, info.task_status]);

    const loadTasks = document.querySelector(".my-tasks");
    if (!loadTasks) {
      console.error("Element with class 'my-tasks' not found.");
    } else {
      mappedTasks.forEach(([description, status]) => {
        const taskDiv = document.createElement("div");
        taskDiv.innerHTML = `<p><strong>Opis:</strong> ${description}</p> 
      <span><strong>Status:</strong> ${status}</span>`;
        taskDiv.classList.add("task-item");
        loadTasks.appendChild(taskDiv);
      });
    }

    // Display work log details
    const workLogContainer = document.querySelector(".work-log");
    if (workLogContainer && userInfo[0].work_date) {
      const { work_date, work_hours, work_end_time } = userInfo[0];
      workLogContainer.innerHTML = `<p><strong>Data:</strong> ${work_date}</p>
      <p><strong>Godziny pracy:</strong> ${work_hours}</p>
      <p><strong>Koniec pracy:</strong> ${work_end_time || "Brak danych"}</p>`;
    }

    // Display damage reports
    const damageReportsContainer = document.querySelector(".damage-reports");
    if (damageReportsContainer) {
      const mappedDamageReports = userInfo
        .filter((info) => info.damage_product) // Filter out undefined values
        .map((info) => [
          info.damage_product,
          info.damage_description,
          info.damage_report_date,
        ]);

      mappedDamageReports.forEach(([product, description, date]) => {
        const reportDiv = document.createElement("div");
        reportDiv.innerHTML = `<p><strong>Produkt:</strong> ${product}</p> 
      <p><strong>Opis:</strong> ${description}</p>
      <p><strong>Data zgłoszenia:</strong> ${date}</p>`;
        reportDiv.classList.add("damage-report-item");
        damageReportsContainer.appendChild(reportDiv);
      });
    }

    // Profile details
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
        localStorage.setItem("inventory", JSON.stringify(data));
        renderInventory(data);
      } catch (error) {
        console.error("Error fetching inventory:", error);
        alert("Something went wrong, please try again.");
      }
    } else {
      renderInventory(inventory);
    }
  }

  function renderInventory(inventory) {
    const inventoryContainer = document.querySelector(".inventory_wrapper");

    inventory.forEach((item) => {
      const itemDiv = document.createElement("div");
      itemDiv.classList.add("inventory-item");
      itemDiv.innerHTML = `
        <h5>${item.nazwa}</h5>
        <div>
        <p>Ilość: ${item.ilosc}</p>
        <p>QR Code: ${item.qr_code}</p>
        </div>
      `;
      inventoryContainer.appendChild(itemDiv);
    });
  }

  async function getEmployees() {
    let employees = JSON.parse(localStorage.getItem("employees"));

    if (!employees) {
      try {
        const response = await fetch("http://localhost:8081/getEmployees", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch employee data");
        }

        const data = await response.json();
        localStorage.setItem("employees", JSON.stringify(data));
        renderEmployees(data);
      } catch (error) {
        console.error("Error fetching employees:", error);
        alert("Something went wrong, please try again.");
      }
    } else {
      renderEmployees(employees);
    }
  }

  function renderEmployees(employees) {
    const employeesContainer = document.querySelector(".employees_wrapper");

    employeesContainer.innerHTML = "";

    const table = document.createElement("table");
    table.classList.add("employee-table");

    const thead = document.createElement("thead");
    thead.innerHTML = `
      <tr>
        <th>Imię Nazwisko</th>
        <th>Stanowisko</th>
        <th>Numer Telefonu</th>
        <th>Działanie</th>
      </tr>
    `;

    const tbody = document.createElement("tbody");

    employees.forEach((employee) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${employee.name} ${employee.surname}</td>
        <td>${employee.position}</td>
        <td>${employee.phone_number}</td>
         <td><button class="delete-btn" data-index="${employee.id}">Delete</button></td>
      `;
      tbody.appendChild(row);
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    employeesContainer.appendChild(table);
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

        if (section === "pracownicy") {
          getEmployees();
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
