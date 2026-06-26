import { salvarPontuacao, buscarLeaderboard } from './script_db.js';


let paresEncontrados = 0;
const totalPares = 10;
let timer = null;
let tempoDecorrido = 0;
let nomeJogador = "";

let carta1 = null;
let carta2 = null;
let bloqueado = false;


const btnIniciar = document.getElementById('btn-iniciar');
const btnReiniciar = document.getElementById('btn-reiniciar');
const inputNome = document.getElementById('input-nome');
const gridCartas = document.getElementById('grid-cartas');


function formatarTempo(segundos) {
    const mins = Math.floor(segundos / 60).toString().padStart(2, '0');
    const secs = (segundos % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
}


function mostrarToast(mensagem, tipo) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    toast.textContent = mensaje; 
    toast.textContent = mensagem;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}


btnIniciar.addEventListener('click', iniciarJogo);
btnReiniciar.addEventListener('click', reiniciarJogo);

function iniciarJogo() {
    const nome = inputNome.value.trim();
    if (!nome) {
        mostrarToast("Por favor, preencha o seu nome!", "error");
        return;
    }
    
    nomeJogador = nome;
    document.getElementById('hud-nome').textContent = nomeJogador;
    document.getElementById('tela-inicial').classList.add('hidden');
    document.getElementById('hud').classList.remove('hidden');

    tempoDecorrido = 0;
    timer = setInterval(() => {
        tempoDecorrido++;
        document.getElementById('hud-timer').textContent = formatarTempo(tempoDecorrido);
    }, 1000);
    

    gridCartas.addEventListener('click', tratarCliqueCarta);
    
    buscarPokemonsAleatorios(10);
}


async function buscarPokemonsAleatorios(quantidade) {
    try {
        const ids = new Set();
        while (ids.size < quantidade) {
           
            ids.add(Math.floor(Math.random() * 151) + 1);
        }
        
        const pokemons = [];
        for (const id of ids) {
            const resp = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
            const dados = await resp.json();
            
            pokemons.push({
                id: dados.id,
                name: dados.name,
                image: dados.sprites.other['official-artwork'].front_default,
                tipo: dados.types[0].type.name
            });
        }
        
        renderizarCartas(pokemons);
    } catch (erro) {
        console.error(erro);
        mostrarToast("Erro ao carregar dados da PokéAPI.", "error");
    }
}

function renderizarCartas(pokemons) {
 
    const cartasDuplicadas = [...pokemons, ...pokemons].sort(() => Math.random() - 0.5);
    
    gridCartas.innerHTML = "";
    
    cartasDuplicadas.forEach(pokemon => {
        const elementoCard = document.createElement('div');
        elementoCard.className = 'card';
        elementoCard.setAttribute('data-key', pokemon.id); 
        
        elementoCard.innerHTML = `
            <div class="card-inner">
                <div class="card-verso">?</div>
                <div class="card-frente">
                    <img src="${pokemon.image}" alt="${pokemon.name}" loading="lazy">
                    <p>${pokemon.name}</p>
                    <span class="badge-tipo">${pokemon.tipo}</span>
                </div>
            </div>
        `;
        gridCartas.appendChild(elementoCard);
    });
}


function tratarCliqueCarta(e) {
    const cardClicado = e.target.closest('.card');
    if (!cardClicado || bloqueado) return;
    if (cardClicado.classList.contains('card-acertada') || cardClicado.classList.contains('card-virada')) return;
    
    cardClicado.classList.add('card-virada');
    
    if (!carta1) {
        carta1 = cardClicado;
    } else {
        carta2 = cardClicado;
        bloqueado = true;
        
      
        if (carta1.dataset.key === carta2.dataset.key) {
            carta1.classList.add('card-acertada');
            carta2.classList.add('card-acertada');
            paresEncontrados++;
            document.getElementById('hud-pares').textContent = `${paresEncontrados} / ${totalPares}`;
            
            carta1 = null;
            carta2 = null;
            bloqueado = false;
            
            if (paresEncontrados === totalPares) {
                verificarVitoria();
            }
        } else {
      
            setTimeout(() => {
                carta1.classList.remove('card-virada');
                carta2.classList.remove('card-virada');
                carta1 = null;
                carta2 = null;
                bloqueado = false;
            }, 1000);
        }
    }
}


async function verificarVitoria() {
    clearInterval(timer);
    

    const pontuacao = Math.max(0, Math.floor(5000 - tempoDecorrido * 10));
    
    await encerrarJogo(nomeJogador, pontuacao, tempoDecorrido);
}

async function encerrarJogo(nome, pontuacao, tempo) {
    mostrarToast(`Sucesso! Você fez ${pontuacao.toLocaleString('pt-BR')} pontos!`, "success");
    
    document.getElementById('pontuacao-final').textContent = pontuacao.toLocaleString('pt-BR');
    document.getElementById('tempo-final').textContent = formatarTempo(tempo);
    

    const salvoComSucesso = await salvarPontuacao(nome, pontuacao, tempo);
    if (salvoComSucesso) {
        mostrarToast("Pontuação sincronizada na nuvem!", "success");
    } else {
        mostrarToast("Não foi possível salvar os dados online.", "error");
    }
    
    document.getElementById('tela-final').classList.remove('hidden');
    
   
    const ranking = await buscarLeaderboard();
    renderizarLeaderboard(ranking);
}

function renderizarLeaderboard(ranking) {
    const tbody = document.getElementById('corpo-ranking');
    tbody.innerHTML = "";
    
    const medalhas = ['🥇', '🥈', '🥉'];
    
    ranking.forEach((r, i) => {
  
        const destaque = r.nome_jogador === nomeJogador ? 'class="linha-destaque"' : '';
        
        tbody.innerHTML += `
            <tr ${destaque}>
                <td>${medalhas[i] ?? (i + 1)}</td>
                <td>${r.nome_jogador}</td>
                <td>${r.pontuacao.toLocaleString('pt-BR')} pts</td>
                <td>${formatarTempo(r.tempo_segundos)}</td>
            </tr>
        `;
    });
}

function reiniciarJogo() {
    paresEncontrados = 0;
    tempoDecorrido = 0;
    carta1 = null;
    carta2 = null;
    bloqueado = false;
    
    document.getElementById('hud-pares').textContent = "0 / 10";
    document.getElementById('hud-timer').textContent = "00:00";
    gridCartas.innerHTML = "";
    document.getElementById('corpo-ranking').innerHTML = "";
    
    document.getElementById('tela-final').classList.add('hidden');
    document.getElementById('hud').classList.add('hidden');
    document.getElementById('tela-inicial').classList.remove('hidden');
    inputNome.value = "";
}