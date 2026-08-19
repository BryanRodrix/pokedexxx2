const listaPokemon = document.querySelector("#listaPokemon");
const navFilter = document.querySelector("#navFilter");
const searchInput = document.querySelector("#searchInput");

// =====================================================
// ELEMENTOS DEL MODAL PRINCIPAL
// =====================================================

const modalOverlay = document.querySelector("#modalOverlay");
const closeModal = document.querySelector("#closeModal");
const modalImg = document.querySelector("#modalImg");
const modalId = document.querySelector("#modalId");
const modalTitle = document.querySelector("#modalTitle");
const modalTypes = document.querySelector("#modalTypes");
const modalStats = document.querySelector("#modalStats");

let todosLosPokemones = [];


// =====================================================
// FAVORITOS
// =====================================================

// Recuperar favoritos guardados
let favoritos =
    JSON.parse(localStorage.getItem("pokemonFavoritos")) || [];

// Botón Favoritos
const btnFavoritos =
    document.querySelector("#btnFavoritos");

// Elementos del modal de favoritos
const favoritesOverlay =
    document.querySelector("#favoritesOverlay");

const favoritesModal =
    document.querySelector("#favoritesModal");

const closeFavorites =
    document.querySelector("#closeFavorites");

const favoritesList =
    document.querySelector("#favoritesList");

const favoritesCount =
    document.querySelector("#favoritesCount");

const noFavorites =
    document.querySelector("#noFavorites");

// Pokémon que actualmente se están mostrando
let pokemonesMostrados = [];


// =====================================================
// COMPROBAR SI UN POKÉMON ES FAVORITO
// =====================================================

function esFavorito(id) {

    return favoritos.includes(id);

}


// =====================================================
// GUARDAR FAVORITOS
// =====================================================

function guardarFavoritos() {

    localStorage.setItem(
        "pokemonFavoritos",
        JSON.stringify(favoritos)
    );

}


// =====================================================
// AGREGAR / QUITAR FAVORITO
// =====================================================

function toggleFavorito(id) {

    if (favoritos.includes(id)) {

        // Quitar de favoritos
        favoritos = favoritos.filter(
            favoritoId => favoritoId !== id
        );

    } else {

        // Agregar a favoritos
        favoritos.push(id);

    }

    // Guardar en LocalStorage
    guardarFavoritos();

    // Actualizar tarjetas principales
    mostrarPokemones(pokemonesMostrados);

    // Actualizar favoritos
    mostrarFavoritos();

}


// =====================================================
// PAGINACIÓN
// =====================================================

let paginaActual = 1;

const pokemonesPorPagina = 20;


// =====================================================
// TRADUCIR TIPOS
// =====================================================

function traducirTipo(tipo) {

    const traducciones = {

        normal: "normal",
        fire: "fuego",
        water: "agua",
        grass: "planta",
        electric: "eléctrico",
        ice: "hielo",
        fighting: "lucha",
        poison: "veneno",
        ground: "tierra",
        flying: "volador",
        psychic: "psíquico",
        bug: "bicho",
        rock: "roca",
        ghost: "fantasma",
        dragon: "dragón",
        steel: "acero",
        fairy: "hada"

    };

    return traducciones[tipo] || tipo;

}


// =====================================================
// TRADUCIR ESTADÍSTICAS
// =====================================================

function traducirStat(stat) {

    const traducciones = {

        hp: "PS",
        attack: "Ataque",
        defense: "Defensa",
        "special-attack": "At. Especial",
        "special-defense": "Def. Especial",
        speed: "Velocidad"

    };

    return traducciones[stat] || stat;

}


// =====================================================
// CARGAR LOS PRIMEROS 60 POKÉMON
// =====================================================

async function cargarPokemones() {

    try {

        const peticiones = [];

        for (let i = 1; i <= 60; i++) {

            peticiones.push(
                fetch(
                    `https://pokeapi.co/api/v2/pokemon/${i}`
                ).then(res => res.json())
            );

        }

        todosLosPokemones =
            await Promise.all(peticiones);

        paginaActual = 1;

        mostrarPokemones(todosLosPokemones);

        mostrarFavoritos();

    } catch (error) {

        console.error(
            "Error al cargar los pokémones:",
            error
        );

    }

}


// =====================================================
// MOSTRAR POKÉMON
// =====================================================

function mostrarPokemones(pokemones) {

    if (!listaPokemon) return;

    // Guardar los Pokémon actuales
    pokemonesMostrados = pokemones;

    listaPokemon.innerHTML = "";


    // =================================================
    // CALCULAR PÁGINA
    // =================================================

    const inicio =
        (paginaActual - 1) * pokemonesPorPagina;

    const fin =
        inicio + pokemonesPorPagina;

    const pokemonesPagina =
        pokemones.slice(inicio, fin);


    // =================================================
    // CREAR TARJETAS
    // =================================================

    pokemonesPagina.forEach(pokemon => {

        const tipos =
            pokemon.types
                .map(t =>
                    `<span class="${t.type.name}">
                        ${traducirTipo(t.type.name)}
                    </span>`
                )
                .join("");


        const pokeId =
            String(pokemon.id).padStart(3, "0");


        const nombreCapitalizado =
            pokemon.name.charAt(0).toUpperCase() +
            pokemon.name.slice(1);


        const imagen =
            pokemon.sprites.other["official-artwork"].front_default ||
            pokemon.sprites.front_default;


        const div =
            document.createElement("div");


        div.classList.add("card-pokemon");


        // =================================================
        // FAVORITO
        // =================================================

        const esFav =
            esFavorito(pokemon.id);


        const corazon =
            esFav ? "❤️" : "🤍";


        div.innerHTML = `

            <button
                class="boton-favorito ${esFav ? "favorito" : ""}"
                title="${
                    esFav
                        ? "Quitar de favoritos"
                        : "Agregar a favoritos"
                }">

                ${corazon}

            </button>


            <div class="card-img">

                <img
                    src="${imagen}"
                    alt="${pokemon.name}">

            </div>


            <div class="card-info">

                <span class="pokemon-id">
                    N° ${pokeId}
                </span>

                <h3>
                    ${nombreCapitalizado}
                </h3>

                <div class="card-types">
                    ${tipos}
                </div>

            </div>

        `;


        // =================================================
        // BOTÓN FAVORITO
        // =================================================

        const botonFavorito =
            div.querySelector(".boton-favorito");


        if (botonFavorito) {

            botonFavorito.addEventListener(
                "click",
                (e) => {

                    e.stopPropagation();

                    toggleFavorito(pokemon.id);

                }
            );

        }


        // =================================================
        // ABRIR MODAL
        // =================================================

        div.addEventListener(
            "click",
            () => {

                abrirModal(pokemon);

            }
        );


        listaPokemon.appendChild(div);

    });


    // Actualizar paginación
    actualizarPaginacion(pokemones);

}


// =====================================================
// PAGINACIÓN
// =====================================================

function actualizarPaginacion(pokemones) {

    const paginacion =
        document.querySelector("#paginacion");


    if (!paginacion) return;


    paginacion.innerHTML = "";

    const totalPaginas =
        Math.ceil(
            pokemones.length /
            pokemonesPorPagina
        );


    if (totalPaginas <= 1) {

        paginacion.style.display = "none";

        return;

    }


    paginacion.style.display = "flex";


    // =================================================
    // ANTERIOR
    // =================================================

    const botonAnterior =
        document.createElement("button");


    botonAnterior.textContent = "‹";


    botonAnterior.disabled =
        paginaActual === 1;


    botonAnterior.addEventListener(
        "click",
        () => {

            if (paginaActual > 1) {

                paginaActual--;

                mostrarPokemones(pokemones);

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

            }

        }
    );


    paginacion.appendChild(
        botonAnterior
    );


    // =================================================
    // NÚMEROS
    // =================================================

    for (
        let pagina = 1;
        pagina <= totalPaginas;
        pagina++
    ) {

        const boton =
            document.createElement("button");


        boton.textContent = pagina;


        if (pagina === paginaActual) {

            boton.classList.add("active");

        }


        boton.addEventListener(
            "click",
            () => {

                paginaActual = pagina;

                mostrarPokemones(pokemones);

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

            }
        );


        paginacion.appendChild(boton);

    }


    // =================================================
    // SIGUIENTE
    // =================================================

    const botonSiguiente =
        document.createElement("button");


    botonSiguiente.textContent = "›";


    botonSiguiente.disabled =
        paginaActual === totalPaginas;


    botonSiguiente.addEventListener(
        "click",
        () => {

            if (paginaActual < totalPaginas) {

                paginaActual++;

                mostrarPokemones(pokemones);

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

            }

        }
    );


    paginacion.appendChild(
        botonSiguiente
    );

}


// =====================================================
// MODAL PRINCIPAL
// =====================================================

function abrirModal(pokemon) {

    if (!modalOverlay) return;


    // Imagen
    if (modalImg) {

        modalImg.src =
            pokemon.sprites.other["official-artwork"].front_default ||
            pokemon.sprites.front_default;

    }


    // ID
    if (modalId) {

        modalId.textContent =
            `N° ${String(pokemon.id).padStart(3, "0")}`;

    }


    // Nombre
    if (modalTitle) {

        modalTitle.textContent =
            pokemon.name.charAt(0).toUpperCase() +
            pokemon.name.slice(1);

    }


    // Tipos
    if (modalTypes) {

        modalTypes.innerHTML =
            pokemon.types
                .map(t =>
                    `<span class="${t.type.name}">
                        ${traducirTipo(t.type.name)}
                    </span>`
                )
                .join("");

    }


    // Estadísticas
    if (modalStats) {

        modalStats.innerHTML = "";


        pokemon.stats.forEach(stat => {

            const nombreStat =
                traducirStat(
                    stat.stat.name
                );


            const valorStat =
                stat.base_stat;


            modalStats.innerHTML += `

                <div class="stat-row">

                    <span>
                        ${nombreStat}
                    </span>

                    <span>
                        ${valorStat}
                    </span>

                </div>


                <div class="stat-bar-container">

                    <div
                        class="stat-bar"
                        style="width: ${
                            Math.min(
                                valorStat,
                                100
                            )
                        }%;">
                    </div>

                </div>

            `;

        });

    }


    modalOverlay.classList.add("active");

}


// =====================================================
// ABRIR MODAL POR ID
// =====================================================

async function abrirModalPorId(id) {

    const pokemonEnMemoria =
        todosLosPokemones.find(
            p => p.id === Number(id)
        );


    if (pokemonEnMemoria) {

        abrirModal(
            pokemonEnMemoria
        );

        return;

    }


    try {

        const response =
            await fetch(
                `https://pokeapi.co/api/v2/pokemon/${id}`
            );


        const pokemon =
            await response.json();


        abrirModal(pokemon);


    } catch (error) {

        console.error(
            "No se pudo abrir el modal por ID:",
            error
        );

    }

}


// =====================================================
// CERRAR MODAL PRINCIPAL
// =====================================================

if (closeModal) {

    closeModal.addEventListener(
        "click",
        () => {

            modalOverlay.classList.remove(
                "active"
            );

        }
    );

}


if (modalOverlay) {

    modalOverlay.addEventListener(
        "click",
        (e) => {

            if (e.target === modalOverlay) {

                modalOverlay.classList.remove(
                    "active"
                );

            }

        }
    );

}


// =====================================================
// FILTROS DEL NAV
// =====================================================

if (navFilter) {

    navFilter.addEventListener(
        "click",
        (e) => {

            if (
                !e.target.classList.contains(
                    "btn-header"
                )
            ) {

                return;

            }


            const botones =
                navFilter.querySelectorAll(
                    ".btn-header"
                );


            botones.forEach(btn =>
                btn.classList.remove(
                    "active"
                )
            );


            e.target.classList.add(
                "active"
            );


            const tipoSeleccionado =
                e.target.getAttribute(
                    "data-type"
                );


            paginaActual = 1;


            if (
                tipoSeleccionado === "all"
            ) {

                mostrarPokemones(
                    todosLosPokemones
                );

            } else {

                const filtrados =
                    todosLosPokemones.filter(
                        pokemon =>
                            pokemon.types.some(
                                t =>
                                    t.type.name ===
                                    tipoSeleccionado
                            )
                    );


                mostrarPokemones(
                    filtrados
                );

            }

        }
    );

}


// =====================================================
// CHECKBOX DE TIPOS
// =====================================================

const checkboxesTipos = [

    "grass",
    "poison",
    "fire",
    "flying",
    "water",
    "bug",
    "normal",
    "electric",
    "ground",
    "fairy"

];


// =====================================================
// OBTENER TIPOS SELECCIONADOS
// =====================================================

function obtenerTiposSeleccionados() {

    const tiposSeleccionados = [];


    checkboxesTipos.forEach(tipo => {

        const checkbox =
            document.getElementById(tipo);


        if (
            checkbox &&
            checkbox.checked
        ) {

            tiposSeleccionados.push(
                tipo
            );

        }

    });


    return tiposSeleccionados;

}


// =====================================================
// APLICAR FILTROS
// =====================================================

function aplicarFiltros() {

    paginaActual = 1;


    const tiposSeleccionados =
        obtenerTiposSeleccionados();


    const termino =
        searchInput
            ? searchInput.value
                .toLowerCase()
                .trim()
            : "";


    let filtrados =
        todosLosPokemones;


    // =================================================
    // FILTRO POR TIPO
    // =================================================

    if (
        tiposSeleccionados.length > 0
    ) {

        filtrados =
            filtrados.filter(
                pokemon => {

                    return pokemon.types.some(
                        tipoPokemon =>
                            tiposSeleccionados.includes(
                                tipoPokemon.type.name
                            )
                    );

                }
            );

    }


    // =================================================
    // FILTRO POR BÚSQUEDA
    // =================================================

    if (termino !== "") {

        filtrados =
            filtrados.filter(
                pokemon => {

                    const nombre =
                        pokemon.name.toLowerCase();


                    const id =
                        String(pokemon.id);


                    return (
                        nombre.includes(termino) ||
                        id.includes(termino)
                    );

                }
            );

    }


    // Mostrar resultados
    mostrarPokemones(
        filtrados
    );

}


// =====================================================
// ACTIVAR CHECKBOX
// =====================================================

checkboxesTipos.forEach(tipo => {

    const checkbox =
        document.getElementById(tipo);


    if (checkbox) {

        checkbox.addEventListener(
            "change",
            () => {

                aplicarFiltros();

            }
        );

    }

});


// =====================================================
// BARRA DE BÚSQUEDA
// =====================================================

if (searchInput) {

    searchInput.addEventListener(
        "input",
        () => {

            aplicarFiltros();

        }
    );

}


// =====================================================
// ABRIR MODAL DE FAVORITOS
// =====================================================

if (btnFavoritos) {

    btnFavoritos.addEventListener(
        "click",
        () => {

            if (!favoritesOverlay) return;


            // Actualizar antes de abrir
            mostrarFavoritos();


            // Abrir modal
            favoritesOverlay.classList.add(
                "active"
            );

        }
    );

}


// =====================================================
// CERRAR MODAL DE FAVORITOS
// =====================================================

if (closeFavorites) {

    closeFavorites.addEventListener(
        "click",
        () => {

            favoritesOverlay.classList.remove(
                "active"
            );

        }
    );

}


// =====================================================
// CERRAR FAVORITOS AL HACER CLIC AFUERA
// =====================================================

if (favoritesOverlay) {

    favoritesOverlay.addEventListener(
        "click",
        (e) => {

            if (
                e.target === favoritesOverlay
            ) {

                favoritesOverlay.classList.remove(
                    "active"
                );

            }

        }
    );

}


// =====================================================
// MOSTRAR LISTA DE FAVORITOS
// =====================================================

function mostrarFavoritos() {

    if (!favoritesList) return;


    // Limpiar lista
    favoritesList.innerHTML = "";


    // =================================================
    // BUSCAR POKÉMON FAVORITOS
    // =================================================

    const pokemonesFavoritos =
        todosLosPokemones.filter(
            pokemon =>
                favoritos.includes(
                    pokemon.id
                )
        );


    // =================================================
    // ACTUALIZAR CONTADOR
    // =================================================

    if (favoritesCount) {

        favoritesCount.textContent =
            `${pokemonesFavoritos.length} favoritos`;

    }


    // =================================================
    // MOSTRAR / OCULTAR MENSAJE
    // =================================================

    if (noFavorites) {

        noFavorites.style.display =
            pokemonesFavoritos.length === 0
                ? "block"
                : "none";

    }


    // =================================================
    // SI NO HAY FAVORITOS
    // =================================================

    if (
        pokemonesFavoritos.length === 0
    ) {

        return;

    }


    // =================================================
    // CREAR TARJETAS
    // =================================================

    pokemonesFavoritos.forEach(
        pokemon => {

            const tarjeta =
                document.createElement(
                    "div"
                );


            tarjeta.classList.add(
                "tarjeta-favorito"
            );


            const nombreCapitalizado =
                pokemon.name
                    .charAt(0)
                    .toUpperCase() +
                pokemon.name.slice(1);


            const pokeId =
                String(
                    pokemon.id
                ).padStart(3, "0");


            const imagen =
                pokemon.sprites.other[
                    "official-artwork"
                ].front_default ||
                pokemon.sprites.front_default;


            tarjeta.innerHTML = `

                <button
                    class="boton-favorito favorito"
                    title="Quitar de favoritos">

                    ❤️

                </button>


                <img
                    src="${imagen}"
                    alt="${pokemon.name}">


                <span class="pokemon-id">
                    N° ${pokeId}
                </span>


                <h3>
                    ${nombreCapitalizado}
                </h3>

            `;


            // =================================================
            // QUITAR FAVORITO
            // =================================================

            const boton =
                tarjeta.querySelector(
                    ".boton-favorito"
                );


            boton.addEventListener(
                "click",
                (e) => {

                    e.stopPropagation();

                    toggleFavorito(
                        pokemon.id
                    );

                }
            );


            // =================================================
            // ABRIR MODAL
            // =================================================

            tarjeta.addEventListener(
                "click",
                () => {

                    abrirModal(
                        pokemon
                    );

                }
            );


            favoritesList.appendChild(
                tarjeta
            );

        }
    );

}


// =====================================================
// INICIALIZAR APLICACIÓN
// =====================================================

cargarPokemones();


// =====================================================
// FORMULARIO DE BÚSQUEDA
// =====================================================

if (searchInput) {

    const form =
        searchInput.closest("form");


    if (form) {

        form.addEventListener(
            "submit",
            (e) => {

                e.preventDefault();

            }
        );

    }

}