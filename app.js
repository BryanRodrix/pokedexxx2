const listaPokemon = document.querySelector("#listaPokemon");
const navFilter = document.querySelector("#navFilter");
const searchInput = document.querySelector("#searchInput");

// Elementos del Modal
const modalOverlay = document.querySelector("#modalOverlay");
const closeModal = document.querySelector("#closeModal");
const modalImg = document.querySelector("#modalImg");
const modalId = document.querySelector("#modalId");
const modalTitle = document.querySelector("#modalTitle");
const modalTypes = document.querySelector("#modalTypes");
const modalStats = document.querySelector("#modalStats");

let todosLosPokemones = [];

// Traducción de tipos al español
function traducirTipo(tipo) {
    const traducciones = {
        normal: "normal", fire: "fuego", water: "agua", grass: "planta",
        electric: "eléctrico", ice: "hielo", fighting: "lucha", poison: "veneno",
        ground: "tierra", flying: "volador", psychic: "psíquico", bug: "bicho",
        rock: "roca", ghost: "fantasma", dragon: "dragón", steel: "acero", fairy: "hada"
    };
    return traducciones[tipo] || tipo;
}

// Traducción de estadísticas al español
function traducirStat(stat) {
    const traducciones = {
        "hp": "PS",
        "attack": "Ataque",
        "defense": "Defensa",
        "special-attack": "At. Especial",
        "special-defense": "Def. Especial",
        "speed": "Velocidad"
    };
    return traducciones[stat] || stat;
}

// Cargar los primeros 40 Pokémon en paralelo para mayor velocidad
async function cargarPokemones() {
    try {
        const peticiones = [];
        for (let i = 1; i <= 40; i++) {
            peticiones.push(
                fetch(`https://pokeapi.co/api/v2/pokemon/${i}`).then(res => res.json())
            );
        }
        todosLosPokemones = await Promise.all(peticiones);
        mostrarPokemones(todosLosPokemones);
    } catch (error) {
        console.error("Error al cargar los pokémones:", error);
    }
}

// Renderizar las tarjetas en el DOM
function mostrarPokemones(pokemones) {
    if (!listaPokemon) return;
    listaPokemon.innerHTML = "";
    
    pokemones.forEach(pokemon => {
        const tipos = pokemon.types.map(t => `<span class="${t.type.name}">${traducirTipo(t.type.name)}</span>`).join('');
        const pokeId = String(pokemon.id).padStart(3, '0');
        const nombreCapitalizado = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);

        const div = document.createElement("div");
        div.classList.add("card-pokemon");
        div.innerHTML = `
            <div class="card-img">
                <img src="${pokemon.sprites.other["official-artwork"].front_default || pokemon.sprites.front_default}" alt="${pokemon.name}">
            </div>
            <div class="card-info">
                <span class="pokemon-id">N° ${pokeId}</span>
                <h3>${nombreCapitalizado}</h3>
                <div class="card-types">
                    ${tipos}
                </div>
            </div>
        `;

        // Evento para abrir el modal al hacer clic en la tarjeta
        div.addEventListener("click", () => {
            abrirModal(pokemon);
        });

        listaPokemon.append(div);
    });
}

// Rellenar y mostrar el modal con los datos del Pokémon
function abrirModal(pokemon) {
    if (!modalOverlay) return;

    if (modalImg) modalImg.src = pokemon.sprites.other["official-artwork"].front_default || pokemon.sprites.front_default;
    if (modalId) modalId.textContent = `N° ${String(pokemon.id).padStart(3, '0')}`;
    if (modalTitle) modalTitle.textContent = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
    
    if (modalTypes) {
        modalTypes.innerHTML = pokemon.types.map(t => `<span class="${t.type.name}">${traducirTipo(t.type.name)}</span>`).join('');
    }

    if (modalStats) {
        modalStats.innerHTML = "";
        pokemon.stats.forEach(stat => {
            const nombreStat = traducirStat(stat.stat.name);
            const valorStat = stat.base_stat;
            
            modalStats.innerHTML += `
                <div class="stat-row">
                    <span>${nombreStat}</span>
                    <span>${valorStat}</span>
                </div>
                <div class="stat-bar-container">
                    <div class="stat-bar" style="width: ${Math.min(valorStat, 100)}%;"></div>
                </div>
            `;
        });
    }

    modalOverlay.classList.add("active");
}

// Función global por si deseas abrir el modal pasando directamente un ID (ej: desde HTML estático)
async function abrirModalPorId(id) {
    const pokemonEnmemoria = todosLosPokemones.find(p => p.id === Number(id));
    if (pokemonEnmemoria) {
        abrirModal(pokemonEnmemoria);
        return;
    }
    
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        const pokemon = await response.json();
        abrirModal(pokemon);
    } catch (error) {
        console.error("No se pudo abrir el modal por ID:", error);
    }
}

// Eventos para cerrar el modal
if (closeModal) {
    closeModal.addEventListener("click", () => {
        modalOverlay.classList.remove("active");
    });
}

if (modalOverlay) {
    modalOverlay.addEventListener("click", (e) => {
        if (e.target === modalOverlay) {
            modalOverlay.classList.remove("active");
        }
    });
}

// Filtros por tipo (botones superiores)
if (navFilter) {
    navFilter.addEventListener("click", (e) => {
        if (!e.target.classList.contains("btn-header")) return;

        const botones = navFilter.querySelectorAll(".btn-header");
        botones.forEach(btn => btn.classList.remove("active"));
        e.target.classList.add("active");

        const tipoSeleccionado = e.target.getAttribute("data-type");

        if (tipoSeleccionado === "all") {
            mostrarPokemones(todosLosPokemones);
        } else {
            const filtrados = todosLosPokemones.filter(pokemon => 
                pokemon.types.some(t => t.type.name === tipoSeleccionado)
            );
            mostrarPokemones(filtrados);
        }
    });
}

// Barra de búsqueda en tiempo real
if (searchInput) {
    searchInput.addEventListener("input", (e) => {
        const termino = e.target.value.toLowerCase().trim();

        const filtrados = todosLosPokemones.filter(pokemon => {
            const nombre = pokemon.name.toLowerCase();
            const id = String(pokemon.id);
            return nombre.includes(termino) || id.includes(termino);
        });

        mostrarPokemones(filtrados);
    });
}

// Inicializar la aplicación
cargarPokemones();