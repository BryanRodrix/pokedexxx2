// =====================================================
// ELEMENTOS PRINCIPALES
// =====================================================

const listaPokemon = document.querySelector("#listaPokemon");
const searchInput = document.querySelector("#searchInput");
const searchForm = document.querySelector("#searchForm");


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


// =====================================================
// DATOS DE POKÉMON
// =====================================================

let todosLosPokemones = [];


// =====================================================
// FAVORITOS
// =====================================================

let favoritos =
    JSON.parse(localStorage.getItem("pokemonFavoritos")) || [];


// =====================================================
// ELEMENTOS DEL MODAL DE FAVORITOS
// =====================================================

const btnFavoritos =
    document.querySelector("#btnFavoritos");

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


// =====================================================
// POKÉMON ACTUALMENTE MOSTRADOS
// =====================================================

let pokemonesMostrados = [];


// =====================================================
// PAGINACIÓN
// =====================================================

let paginaActual = 1;

const pokemonesPorPagina = 20;


// =====================================================
// TIPOS DE POKÉMON
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
    "fairy",
    "ice",
    "fighting",
    "psychic",
    "rock",
    "ghost",
    "dragon",
    "steel"
];


// =====================================================
// COMPROBAR FAVORITO
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

        favoritos = favoritos.filter(
            favoritoId => favoritoId !== id
        );

    } else {

        favoritos.push(id);

    }

    guardarFavoritos();

    // Actualizar tarjetas principales
    mostrarPokemones(pokemonesMostrados);

    // Actualizar ventana de favoritos
    mostrarFavoritos();

}


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
// CAPITALIZAR NOMBRE
// =====================================================

function capitalizarNombre(nombre) {

    return nombre.charAt(0).toUpperCase() +
        nombre.slice(1);

}


// =====================================================
// OBTENER IMAGEN
// =====================================================

function obtenerImagen(pokemon) {

    return (
        pokemon.sprites?.other?.["official-artwork"]?.front_default ||
        pokemon.sprites?.front_default ||
        ""
    );

}


// =====================================================
// CARGAR TODOS LOS POKÉMON
// =====================================================

async function cargarPokemones() {

    try {

        console.log("Cargando todos los Pokémon...");

        const respuesta =
            await fetch(
                "https://pokeapi.co/api/v2/pokemon?limit=2000"
            );

        if (!respuesta.ok) {

            throw new Error(
                "No se pudo obtener la lista de Pokémon."
            );

        }

        const datos =
            await respuesta.json();

        console.log(
            `Se encontraron ${datos.results.length} Pokémon.`
        );


        // =================================================
        // CARGAR INFORMACIÓN COMPLETA
        // =================================================

        const peticiones =
            datos.results.map(
                pokemon =>
                    fetch(pokemon.url)
                        .then(res => {

                            if (!res.ok) {

                                throw new Error(
                                    `Error cargando ${pokemon.name}`
                                );

                            }

                            return res.json();

                        })
            );


        todosLosPokemones =
            await Promise.all(peticiones);


        // =================================================
        // ORDENAR POR ID
        // =================================================

        todosLosPokemones.sort(
            (a, b) => a.id - b.id
        );


        // =================================================
        // PRIMERA PÁGINA
        // =================================================

        paginaActual = 1;


        mostrarPokemones(
            todosLosPokemones
        );


        mostrarFavoritos();


        console.log(
            "Todos los Pokémon fueron cargados correctamente."
        );


    } catch (error) {

        console.error(
            "Error al cargar los Pokémon:",
            error
        );


        if (listaPokemon) {

            listaPokemon.innerHTML = `

                <div class="error-pokemon">

                    <h2>
                        No se pudieron cargar los Pokémon
                    </h2>

                    <p>
                        Revisa tu conexión a Internet
                        y vuelve a cargar la página.
                    </p>

                </div>

            `;

        }

    }

}


// =====================================================
// MOSTRAR POKÉMON
// =====================================================

function mostrarPokemones(pokemones) {

    if (!listaPokemon) return;


    // Guardar Pokémon actuales
    pokemonesMostrados = pokemones;


    // Limpiar
    listaPokemon.innerHTML = "";


    // =================================================
    // SIN RESULTADOS
    // =================================================

    if (pokemones.length === 0) {

        listaPokemon.innerHTML = `

            <div class="sin-resultados">

                <h2>
                    No se encontraron Pokémon
                </h2>

                <p>
                    Intenta cambiar la búsqueda o los filtros.
                </p>

            </div>

        `;

        actualizarPaginacion(pokemones);

        return;

    }


    // =================================================
    // CALCULAR PÁGINA
    // =================================================

    const inicio =
        (paginaActual - 1) *
        pokemonesPorPagina;


    const fin =
        inicio +
        pokemonesPorPagina;


    const pokemonesPagina =
        pokemones.slice(
            inicio,
            fin
        );


    // =================================================
    // CREAR TARJETAS
    // =================================================

    pokemonesPagina.forEach(
        pokemon => {

            // =================================================
            // TIPOS
            // =================================================

            const tipos =
                pokemon.types
                    .map(
                        t => `

                            <span class="${t.type.name}">
                                ${traducirTipo(t.type.name)}
                            </span>

                        `
                    )
                    .join("");


            // =================================================
            // ID
            // =================================================

            const pokeId =
                String(
                    pokemon.id
                ).padStart(
                    3,
                    "0"
                );


            // =================================================
            // NOMBRE
            // =================================================

            const nombreCapitalizado =
                capitalizarNombre(
                    pokemon.name
                );


            // =================================================
            // IMAGEN
            // =================================================

            const imagen =
                obtenerImagen(
                    pokemon
                );


            // =================================================
            // CREAR TARJETA
            // =================================================

            const div =
                document.createElement(
                    "div"
                );


            div.classList.add(
                "card-pokemon"
            );


            // =================================================
            // FAVORITO
            // =================================================

            const esFav =
                esFavorito(
                    pokemon.id
                );


            const corazon =
                esFav
                    ? "❤️"
                    : "🤍";


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
                        alt="${nombreCapitalizado}"
                        loading="lazy">

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
                div.querySelector(
                    ".boton-favorito"
                );


            if (botonFavorito) {

                botonFavorito.addEventListener(
                    "click",
                    e => {

                        e.stopPropagation();

                        toggleFavorito(
                            pokemon.id
                        );

                    }
                );

            }


            // =================================================
            // ABRIR MODAL
            // =================================================

            div.addEventListener(
                "click",
                () => {

                    abrirModal(
                        pokemon
                    );

                }
            );


            // =================================================
            // AGREGAR TARJETA
            // =================================================

            listaPokemon.appendChild(
                div
            );

        }
    );


    // =================================================
    // ACTUALIZAR PAGINACIÓN
    // =================================================

    actualizarPaginacion(
        pokemones
    );

}


// =====================================================
// ACTUALIZAR PAGINACIÓN
// =====================================================

function actualizarPaginacion(pokemones) {

    const paginacion =
        document.querySelector(
            "#paginacion"
        );


    if (!paginacion) return;


    paginacion.innerHTML = "";


    const totalPaginas =
        Math.ceil(
            pokemones.length /
            pokemonesPorPagina
        );


    // =================================================
    // OCULTAR SI SOLO HAY UNA
    // =================================================

    if (totalPaginas <= 1) {

        paginacion.style.display =
            "none";

        return;

    }


    paginacion.style.display =
        "flex";


    // =================================================
    // BOTÓN ANTERIOR
    // =================================================

    const botonAnterior =
        document.createElement(
            "button"
        );


    botonAnterior.textContent =
        "‹";


    botonAnterior.disabled =
        paginaActual === 1;


    botonAnterior.addEventListener(
        "click",
        () => {

            if (paginaActual > 1) {

                paginaActual--;

                mostrarPokemones(
                    pokemones
                );

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
    // NÚMEROS DE PÁGINA
    // =================================================

    const paginasAMostrar =
        obtenerPaginasPaginacion(
            totalPaginas
        );


    paginasAMostrar.forEach(
        pagina => {

            if (pagina === "...") {

                const puntos =
                    document.createElement(
                        "span"
                    );

                puntos.textContent =
                    "...";

                puntos.classList.add(
                    "puntos-paginacion"
                );

                paginacion.appendChild(
                    puntos
                );

                return;

            }


            const boton =
                document.createElement(
                    "button"
                );


            boton.textContent =
                pagina;


            if (
                pagina ===
                paginaActual
            ) {

                boton.classList.add(
                    "active"
                );

            }


            boton.addEventListener(
                "click",
                () => {

                    paginaActual =
                        pagina;

                    mostrarPokemones(
                        pokemones
                    );

                    window.scrollTo({
                        top: 0,
                        behavior: "smooth"
                    });

                }
            );


            paginacion.appendChild(
                boton
            );

        }
    );


    // =================================================
    // BOTÓN SIGUIENTE
    // =================================================

    const botonSiguiente =
        document.createElement(
            "button"
        );


    botonSiguiente.textContent =
        "›";


    botonSiguiente.disabled =
        paginaActual === totalPaginas;


    botonSiguiente.addEventListener(
        "click",
        () => {

            if (
                paginaActual <
                totalPaginas
            ) {

                paginaActual++;

                mostrarPokemones(
                    pokemones
                );

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
// PÁGINAS INTELIGENTES
// =====================================================

function obtenerPaginasPaginacion(
    totalPaginas
) {

    const paginas = [];


    if (totalPaginas <= 7) {

        for (
            let i = 1;
            i <= totalPaginas;
            i++
        ) {

            paginas.push(i);

        }

        return paginas;

    }


    paginas.push(1);


    if (paginaActual > 4) {

        paginas.push("...");

    }


    const inicio =
        Math.max(
            2,
            paginaActual - 2
        );


    const fin =
        Math.min(
            totalPaginas - 1,
            paginaActual + 2
        );


    for (
        let i = inicio;
        i <= fin;
        i++
    ) {

        paginas.push(i);

    }


    if (
        paginaActual <
        totalPaginas - 3
    ) {

        paginas.push("...");

    }


    paginas.push(
        totalPaginas
    );


    return paginas;

}


// =====================================================
// MODAL PRINCIPAL
// =====================================================

function abrirModal(pokemon) {

    if (!modalOverlay) return;


    // =================================================
    // IMAGEN
    // =================================================

    if (modalImg) {

        modalImg.src =
            obtenerImagen(
                pokemon
            );

        modalImg.alt =
            capitalizarNombre(
                pokemon.name
            );

    }


    // =================================================
    // ID
    // =================================================

    if (modalId) {

        modalId.textContent =
            `N° ${
                String(
                    pokemon.id
                ).padStart(
                    3,
                    "0"
                )
            }`;

    }


    // =================================================
    // NOMBRE
    // =================================================

    if (modalTitle) {

        modalTitle.textContent =
            capitalizarNombre(
                pokemon.name
            );

    }


    // =================================================
    // TIPOS
    // =================================================

    if (modalTypes) {

        modalTypes.innerHTML =
            pokemon.types
                .map(
                    t => `

                        <span class="${t.type.name}">
                            ${traducirTipo(t.type.name)}
                        </span>

                    `
                )
                .join("");

    }


    // =================================================
    // ESTADÍSTICAS
    // =================================================

    if (modalStats) {

        modalStats.innerHTML = "";


        pokemon.stats.forEach(
            stat => {

                const nombreStat =
                    traducirStat(
                        stat.stat.name
                    );


                const valorStat =
                    stat.base_stat;


                const porcentaje =
                    Math.min(
                        valorStat,
                        100
                    );


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
                            style="width: ${porcentaje}%;">
                        </div>

                    </div>

                `;

            }
        );

    }


    // =================================================
    // MOSTRAR MODAL
    // =================================================

    modalOverlay.classList.add(
        "active"
    );

}


// =====================================================
// ABRIR MODAL POR ID
// =====================================================

async function abrirModalPorId(id) {

    const pokemonEnMemoria =
        todosLosPokemones.find(
            pokemon =>
                pokemon.id ===
                Number(id)
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


        if (!response.ok) {

            throw new Error(
                "Pokémon no encontrado"
            );

        }


        const pokemon =
            await response.json();


        abrirModal(
            pokemon
        );


    } catch (error) {

        console.error(
            "No se pudo abrir el modal:",
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
        e => {

            if (
                e.target ===
                modalOverlay
            ) {

                modalOverlay.classList.remove(
                    "active"
                );

            }

        }
    );

}


// =====================================================
// ESC PARA CERRAR MODALES
// =====================================================

document.addEventListener(
    "keydown",
    e => {

        if (e.key !== "Escape") return;


        if (
            modalOverlay &&
            modalOverlay.classList.contains(
                "active"
            )
        ) {

            modalOverlay.classList.remove(
                "active"
            );

        }


        if (
            favoritesOverlay &&
            favoritesOverlay.classList.contains(
                "active"
            )
        ) {

            favoritesOverlay.classList.remove(
                "active"
            );

        }

    }
);


// =====================================================
// OBTENER TIPOS SELECCIONADOS
// =====================================================

function obtenerTiposSeleccionados() {

    const tiposSeleccionados = [];


    checkboxesTipos.forEach(
        tipo => {

            const checkbox =
                document.getElementById(
                    tipo
                );


            if (
                checkbox &&
                checkbox.checked
            ) {

                tiposSeleccionados.push(
                    tipo
                );

            }

        }
    );


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
    // FILTRO POR NOMBRE O ID
    // =================================================

    if (
        termino !== ""
    ) {

        filtrados =
            filtrados.filter(
                pokemon => {

                    const nombre =
                        pokemon.name.toLowerCase();


                    const id =
                        String(
                            pokemon.id
                        );


                    return (
                        nombre.includes(
                            termino
                        ) ||
                        id.includes(
                            termino
                        )
                    );

                }
            );

    }


    // =================================================
    // MOSTRAR RESULTADOS
    // =================================================

    mostrarPokemones(
        filtrados
    );

}


// =====================================================
// ACTIVAR CHECKBOX
// =====================================================

checkboxesTipos.forEach(
    tipo => {

        const checkbox =
            document.getElementById(
                tipo
            );


        if (checkbox) {

            checkbox.addEventListener(
                "change",
                () => {

                    aplicarFiltros();

                }
            );

        }

    }
);


// =====================================================
// BÚSQUEDA EN TIEMPO REAL
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
// FORMULARIO DE BÚSQUEDA
// =====================================================

if (searchForm) {

    searchForm.addEventListener(
        "submit",
        e => {

            e.preventDefault();

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


            mostrarFavoritos();


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
        e => {

            if (
                e.target ===
                favoritesOverlay
            ) {

                favoritesOverlay.classList.remove(
                    "active"
                );

            }

        }
    );

}


// =====================================================
// MOSTRAR FAVORITOS
// =====================================================

function mostrarFavoritos() {

    if (!favoritesList) return;


    // =================================================
    // LIMPIAR
    // =================================================

    favoritesList.innerHTML = "";


    // =================================================
    // BUSCAR FAVORITOS
    // =================================================

    const pokemonesFavoritos =
        todosLosPokemones.filter(
            pokemon =>
                favoritos.includes(
                    pokemon.id
                )
        );


    // =================================================
    // CONTADOR
    // =================================================

    if (favoritesCount) {

        favoritesCount.textContent =
            `${pokemonesFavoritos.length} favoritos`;

    }


    // =================================================
    // MENSAJE SIN FAVORITOS
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
    // CREAR TARJETAS DE FAVORITOS
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
                capitalizarNombre(
                    pokemon.name
                );


            const pokeId =
                String(
                    pokemon.id
                ).padStart(
                    3,
                    "0"
                );


            const imagen =
                obtenerImagen(
                    pokemon
                );


            tarjeta.innerHTML = `

                <button
                    class="boton-favorito favorito"
                    title="Quitar de favoritos">

                    ❤️

                </button>


                <img
                    src="${imagen}"
                    alt="${nombreCapitalizado}"
                    loading="lazy">


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


            if (boton) {

                boton.addEventListener(
                    "click",
                    e => {

                        e.stopPropagation();

                        toggleFavorito(
                            pokemon.id
                        );

                    }
                );

            }


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