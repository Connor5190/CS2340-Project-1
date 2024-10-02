
// const restaurantList = document.getElementById('restaurant-list');
// const placesContainer = document.getElementById('detailsPage');
// placesContainer.innerHTML = "";
// const { places } =

document.addEventListener('DOMContentLoaded', () => {
    const restaurantList = document.getElementById('restaurant-list');

    // Function to fetch favorite restaurants and display them
    async function fetchFavoriteRestaurants() {
        try {
            const response = await fetch('/api/user-favorites/', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const data = await response.json();
                const placeIds = data.place_ids;

                if (placeIds.length > 0) {
                    placeIds.forEach(place => {
                        // Dynamically create a list item for each favorite restaurant
                        const restaurantItem = document.createElement('div');
                        restaurantItem.classList.add('favorite-restaurant-item');
                        restaurantItem.innerHTML = `
                        <h3>${place.name}</h3>
                        <p>Address: ${place.address}</p>
                        <p>Rating: ${place.address}</p>
                        
                `;

                        // Append each favorite restaurant to the list
                        restaurantList.appendChild(restaurantItem);
                    });
                } else {
                    restaurantList.innerHTML = '<p>You have no favorite restaurants yet.</p>';
                }
            } else {
                console.error('Failed to fetch favorite restaurants.');
                restaurantList.innerHTML = '<p>Unable to load favorites at this time.</p>';
            }
        } catch (error) {
            console.error('Error fetching favorite restaurants:', error);
            restaurantList.innerHTML = '<p>Error loading favorites.</p>';
        }
    }
    fetchFavoriteRestaurants();
});
