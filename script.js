let map;
let tileLayer;

function updateTileLayer() {
    const provider = document.getElementById('provider-select')?.value || 'osm';
    if (tileLayer) {
        map.removeLayer(tileLayer);
    }
    if (provider === 'stamen') {
        tileLayer = L.tileLayer('https://stamen-tiles.a.ssl.fastly.net/toner/{z}/{x}/{y}.png', {
            attribution: 'Map tiles by Stamen Design, CC BY 3.0 &mdash; Map data &copy; OpenStreetMap-Mitwirkende'
        });
    } else {
        tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap-Mitwirkende'
        });
    }
    tileLayer.addTo(map);
}

function initMap() {
    map = L.map('map').setView([54.3094, 13.0884], 14);
    updateTileLayer();
    document.getElementById('provider-select')?.addEventListener('change', updateTileLayer);

    establishments.forEach(est => {
        est.marker = L.marker([est.lat, est.lng]).addTo(map)
            .bindPopup(`<b>${est.name}</b><br><a href="detail.html?id=${est.id}">Details</a>`);
    });

    updateList();
    setupFilters();
}

function updateList() {
    const list = document.getElementById('list');
    if (!list) return;
    list.innerHTML = '';
    const filtered = filterEstablishments();
    filtered.forEach(est => {
        const li = document.createElement('li');
        const link = document.createElement('a');
        link.href = `detail.html?id=${est.id}`;
        link.textContent = est.name;
        li.appendChild(link);
        list.appendChild(li);
        if (est.marker) {
            est.marker.setOpacity(1);
        }
    });
    establishments.forEach(est => {
        if (!filtered.includes(est) && est.marker) {
            est.marker.setOpacity(0.3);
        }
    });
}

function setupFilters() {
    const inputs = document.querySelectorAll('.filters input, #search');
    inputs.forEach(inp => inp.addEventListener('input', updateList));
}

function filterEstablishments() {
    const search = document.getElementById('search')?.value.toLowerCase() || '';
    const showRestaurant = document.getElementById('filter-restaurant')?.checked;
    const showDelivery = document.getElementById('filter-delivery')?.checked;
    const showRetail = document.getElementById('filter-retail')?.checked;
    const vegan = document.getElementById('filter-vegan')?.checked;
    const family = document.getElementById('filter-family')?.checked;
    const delivers = document.getElementById('filter-delivers')?.checked;

    return establishments.filter(est => {
        if (search && !est.name.toLowerCase().includes(search)) return false;
        if (vegan && !est.vegan) return false;
        if (family && !est.family) return false;
        if (delivers && !est.delivery) return false;
        const catRestaurant = est.categories.includes('restaurant');
        const catDelivery = est.categories.includes('delivery');
        const catRetail = est.categories.includes('retail');
        if (!((showRestaurant && catRestaurant) || (showDelivery && catDelivery) || (showRetail && catRetail))) {
            return false;
        }
        return true;
    });
}

function loadDetail() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const est = establishments.find(e => e.id === id);
    if (!est) {
        document.getElementById('detail-content').textContent = 'Nicht gefunden.';
        return;
    }
    document.getElementById('detail-name').textContent = est.name;
    const div = document.getElementById('detail-content');
    div.innerHTML = `
        <p><strong>Adresse:</strong> ${est.address}</p>
        <p><strong>Öffnungszeiten:</strong> ${est.hours}</p>
        <p>${est.description}</p>
        <p><strong>Lieferservice:</strong> ${est.delivery ? 'Ja' : 'Nein'}</p>
    `;
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('map')) {
        initMap();
    } else {
        loadDetail();
    }
});
