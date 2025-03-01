


async function fetchUsers() {
    try {
        const response = await fetch('http://localhost:8081/recipes');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const recipes = await response.json();

        console.log(recipes);

    } catch (error) {
        console.error('Error fetching recipes:', error);
    }
}


fetchUsers();