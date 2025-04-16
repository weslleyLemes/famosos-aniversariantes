import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Certifique-se de que está importado corretamente
import './App.css'; // Onde estão as animações personalizadas
import { db } from './firebase';
import { collection, addDoc } from 'firebase/firestore';

function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [famousList, setFamousList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [profession, setProfession] = useState('');
  const [country, setCountry] = useState('');
  const [peculiarTaste, setPeculiarTaste] = useState('');

  const navigate = useNavigate(); // Aqui o hook useNavigate está correto

  const goToHistorico = () => {
    navigate('/historico');
  };

  const handleLogin = async (e) => {

    e.preventDefault();
    if (!username.trim() || !birthDate || loading) return;
  
    setLoading(true);
  
    const prompt = `
    Liste 5 pessoas famosas com o nome "${username}". Para cada uma, siga este formato:
    
    1. 
    Nome: ...
    Profissão: ...
    País: ...
    Ano de nascimento: ...
    Resumo: ...
    
    Dados do usuário:
    - Nome: ${username}
    - Data de nascimento: ${birthDate}
    - Profissão: ${profession}
    - País de nascimento: ${country}
    ${peculiarTaste ? `- Gosto peculiar: ${peculiarTaste}` : ''}
    No final, diga com qual dessas o usuários tem mais afinidade com base nos dados anteriores, em uma única frase. obrigatoriamente alguem deve ser selecionado`;
  
    try {
      const response = await fetch("https://backend-famosos.onrender.com/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt: { text: prompt },
          temperature: 0.7,
          candidateCount: 1
        })
      });
  
      if (!response.ok) throw new Error("Resposta inválida do backend");
  
      const data = await response.json();
      const reply = data?.candidates?.[0]?.output || "";

      await addDoc(collection(db, "pesquisas"), {
        username,
        birthDate,
        profession,
        country,
        peculiarTaste,
        resposta: reply,
        createdAt: new Date().toISOString()
      });
  
      // 🔍 Se não tiver Nome: no texto, avisa e para
      if (!/Nome:/i.test(reply)) {
        alert("Não foi possível encontrar pessoas famosas com esse nome. Tente outro nome mais comum.");
        setLoading(false);
        return;
      }
  
      // ⚙️ Extrai os blocos 1 a 5 com Nome:...
      const matches = reply.match(/\d+\.\s*Nome:.*?(?=\n\d+\.|Com base|Dessa lista|$)/gs) || [];
  
      // ✂️ Extrai afinidade final
      // 🔍 Tenta encontrar a mensagem final de afinidade
      const matchAfinidade = reply.match(/(Com base.*|Dessa lista.*)$/s);
      const afinidade = matchAfinidade ? matchAfinidade[0].trim() : "Nenhuma correspondência exata foi encontrada com base nos critérios do usuário.";

      setFamousList([...matches.map(b => b.trim()), afinidade]);
      setIsLoggedIn(true);
  
    } catch (error) {
      console.error("Erro com o backend:", error);
      alert("Erro ao consultar o backend. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-200 p-4">
       <form onSubmit={handleLogin} className="bg-white p-6 rounded shadow-md w-80 space-y-4">
  <h2 className="text-xl font-bold">Descubra seus aniversariantes famosos</h2>

  <input
    type="text"
    placeholder="Seu nome"
    className="border p-2 w-full rounded"
    value={username}
    onChange={(e) => setUsername(e.target.value)}
    required
  />

  <input
    type="date"
    className="border p-2 w-full rounded"
    value={birthDate}
    onChange={(e) => setBirthDate(e.target.value)}
    required
  />

  <input
    type="text"
    placeholder="Sua profissão"
    className="border p-2 w-full rounded"
    value={profession}
    onChange={(e) => setProfession(e.target.value)}
    required
  />

  <input
    type="text"
    placeholder="Seu país de nascimento"
    className="border p-2 w-full rounded"
    value={country}
    onChange={(e) => setCountry(e.target.value)}
    required
  />

  <input
    type="text"
    placeholder="Gosto peculiar (opcional)"
    className="border p-2 w-full rounded"
    value={peculiarTaste}
    onChange={(e) => setPeculiarTaste(e.target.value)}
  />

  <button
    type="submit"
    className={`w-full py-2 rounded text-white ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
    disabled={loading}
  >
    {loading ? 'Carregando...' : 'Ver famosos'}
  </button>
  <div>
      {/* Botão para ir ao histórico */}
      <button onClick={goToHistorico}
      className="w-full py-2 rounded text-white bg-blue-500 hover:bg-blue-600 mt-2"
      >Ver Histórico</button> 

  </div>
</form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-blue-100 flex flex-col items-center p-6">
      <div className="bg-white w-full max-w-4xl p-6 rounded-2xl shadow-lg space-y-6 animate-fade-in">
        <h2 className="text-2xl font-bold text-blue-700">👋 Olá, {username}!</h2>
        <p className="text-gray-700">
          Veja quais pessoas famosas compartilham o seu nome e com quem você tem mais em comum:
        </p>

        <div className="grid md:grid-cols-2 gap-6 w-full">
        {famousList.slice(0, 5).map((block, idx) => {
  const nome = block.match(/Nome:\s*(.+)/)?.[1] || "Desconhecido";
  const profissao = block.match(/Profissão:\s*(.+)/)?.[1] || "N/A";
  const pais = block.match(/País:\s*(.+)/)?.[1] || "N/A";
  const nascimento = block.match(/Ano de nascimento:\s*(.+)/)?.[1] || "N/A";
  const resumo = block.match(/Resumo:\s*([\s\S]*)/)?.[1]?.trim() || "";

  return (
              <div
                key={idx}
                className="bg-white p-4 rounded-lg shadow-md mb-4 transition-all duration-500 ease-in-out animate-fade-in"
              >
                <h3 className="text-xl font-semibold mb-2">{nome}</h3>
                <p><strong>Profissão:</strong> {profissao}</p>
                <p><strong>País:</strong> {pais}</p>
                <p><strong>Ano de nascimento:</strong> {nascimento}</p>
                {resumo && <p className="mt-2 text-gray-700">{resumo}</p>}
              </div>
            );
          })}
        </div>


        {/* ✅ Mostra a afinidade aqui */}
{famousList.at(-1) && (
  <div className="mt-6 bg-green-100 border-l-4 border-green-500 text-green-800 p-4 rounded shadow">
    <strong>Afinidade:</strong> {famousList.at(-1)}
  </div>
)}

        <button
          onClick={() => window.location.reload()}
          className="mt-6 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md font-semibold transition transform hover:scale-105"
        >
          Refazer análise
        </button>
        <button
        onClick={goToHistorico}
        className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md font-semibold transition transform hover:scale-105"
      >
        Ver Histórico
      </button>
      </div>
    </div>
  );
}

export default HomePage;
