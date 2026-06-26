const btnPortal = document.getElementById('btn-portal');
const loader = document.getElementById('loader');
const resultados = document.getElementById('resultados');
const errosSpan = document.getElementById('erros');
const tempoSpan = document.getElementById('tempo');
const telaInicial = document.getElementById('tela-inicial');
const inputNome = document.getElementById('input-nome');
const btnIniciar = document.getElementById('btn-iniciar');
let primeiraCarta = null;
let segundaCarta = null;
let bloqueado = false;
let movimentos = 0;
let paresEncontrados = 0;
let erros = 0;
let tempo = 0;
let intervalo;
let nomeJogador = "";

btnIniciar.addEventListener('click', () => {
    if (inputNome.value.trim() === "") {
        alert("Por favor, digite seu nome!"); 
        return;
    }
    
    nomeJogador = inputNome.value;
    telaInicial.classList.add('hidden'); 
});

btnPortal.addEventListener('click', async () => {

    resultados.innerHTML = "";
    tempo = 0;
    tempoSpan.textContent = 0;

    clearInterval(intervalo);

    intervalo = setInterval(() => {
        tempo++;
        tempoSpan.textContent = tempo;
    }, 1000);
    paresEncontrados = 0;
    erros = 0;
    errosSpan.textContent = 0;

    loader.classList.remove('hidden');



    try {

    let personagens = await carregarPersonagem()  


        resultados.innerHTML = "";

        personagens.forEach((pokemon) => {

            resultados.innerHTML += `
                 <div class="card" data-id="${pokemon.id}">
                    <div class="card-inner">

                        <div class="card-verso">
                             ?
                        </div>

                        <div class="card-frente">

                            <img src="${pokemon.image}" alt="${pokemon.name}">

                            <div class="char-info">
                                <h3>${pokemon.name}</h3>
                                <p>Tipo: ${pokemon.tipo}</p>
                            </div>
                        </div>    
                    </div>
                </div>    
            `;

});


        const cartas = document.querySelectorAll('.card');

cartas.forEach(carta => {

    carta.addEventListener('click', () => {
    if (bloqueado) return;
    if (carta === primeiraCarta) return;

    carta.classList.add('card-virada');
    
    if (primeiraCarta === null) {

        primeiraCarta = carta;

    } else {

        segundaCarta = carta;
        movimentos++;
        console.log("Movimentos:", movimentos);

        if (primeiraCarta.dataset.id === segundaCarta.dataset.id) {

            console.log("Acertou!");
            
            console.log("Pares:", paresEncontrados);
            primeiraCarta.classList.add('card-acertada');
            segundaCarta.classList.add('card-acertada');
            paresEncontrados++;
            if (paresEncontrados === 10) {
                clearInterval(intervalo);
                console.log("Você venceu!");
                alert(`Você venceu em ${tempo} segundos!`);
                
            }

            primeiraCarta = null;
            segundaCarta = null;
            
        } else {

            console.log("Errou!");
            erros++;
            errosSpan.textContent = erros;
            console.log("Erros:", erros);
            bloqueado = true;
            setTimeout(() => {

                primeiraCarta.classList.remove('card-virada');
                segundaCarta.classList.remove('card-virada');

                primeiraCarta = null;
                segundaCarta = null;
                bloqueado = false;
            }, 1000);
            }
        } 

});
});


        loader.classList.add('hidden')

    } catch (erro) {
        loader.classList.add('hidden');
        resultados.innerHTML += '<p class="text-red-500">Erro no portal. Tente novamente!</p>';
        console.error(erro);
    }


async function carregarPersonagem() {
    const data = []

    for (let i = 0; i < 10; i++){
        const idAleatorio = Math.floor(Math.random() * 1025) + 1;
        const resposta = await fetch(`https://pokeapi.co/api/v2/pokemon/${idAleatorio}`);
        const dados = await resposta.json();
        const pokemon = {
            id: dados.id,
            name: dados.name,
            image: dados.sprites.other['official-artwork'].front_default,
            tipo: dados.types[0].type.name  // "fire", "water", "grass"...
        };   
        data.push(pokemon)
        data.push(pokemon) 
       
    }
        data.sort(() => Math.random() - 0.5);
    return data;
}

}); 