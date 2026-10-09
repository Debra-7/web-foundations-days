const loadUsersButton = document.querySelector("#load-users");
const filterInput = document.querySelector("#filter-input");
const statusMessage = document.querySelector("#status");
const usersList = document.querySelector("#users-list");

let users = [];

function renderUsers(list) {
  usersList.textContent = "";

  if (list.length === 0) {
    const message = document.createElement("li");
    message.textContent = "No users match your filter.";
    usersList.appendChild(message);
    return;
  }

  list.forEach((user) => {
    const listItem = document.createElement("li");

    const name = document.createElement("h3");
    name.textContent = user.name;

    const email = document.createElement("p");
    email.textContent = user.email;

    const city = document.createElement("p");
    city.textContent = user.address.city;

    const company = document.createElement("p");
    company.textContent = user.company.name;

    listItem.append(name, email, city, company);
    usersList.appendChild(listItem);
  });
}

async function loadUsers() {
  loadUsersButton.disabled = true;
  statusMessage.textContent = "Loading users...";

  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/users");

    if (!response.ok) {
      throw new Error("Failed to load users.");
    }

    users = await response.json();

    renderUsers(users);
    statusMessage.textContent = `Successfully loaded ${users.length} users.`;
  } catch (error) {
    statusMessage.textContent = "Unable to load users. Please try again.";
    console.error(error);
  } finally {
    loadUsersButton.disabled = false;
  }
}

loadUsersButton.addEventListener("click", loadUsers);

filterInput.addEventListener("input", () => {
  const searchTerm = filterInput.value.toLowerCase();

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm),
  );

  renderUsers(filteredUsers);
});
