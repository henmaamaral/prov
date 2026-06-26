const DATABASE_URL = "postgresql://usuario:senha@host/banco?sslmode=require";
const host = new URL(DATABASE_URL).host;
const neonHttpEndpoint = `'https://${host}/sql`;

async function executarQueryNeon(querySQL, parametros = []) {
    try {
        const resposta = await fetch(neonHttpEndpoint, {
            method: 'POST',
            headers: {
                'Neon-Connection-String': DATABASE_URL,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: querySQL,
                params: parametros 
            })
        });

        if (!resposta.ok) {
            const erroTexto = await resposta.text();
            throw new Error(`Erro HTTP ${resposta.status}: ${erroTexto}`);
        }

    
        const dados = await resposta.json();
        return dados.rows;

    } catch (erro) {
        console.error("Falha ao comunicar com o banco de dados:", erro);
        return null; 
    }
}

'INSET INTO ranking (nome_jogador, pontuacao, tempo_segundos) VALUES ($1, $2, $3) RETURNING *'
params: [nomeJogador, pontuacao, tempo_segundos]