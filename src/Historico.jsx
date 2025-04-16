import { useEffect, useState } from 'react';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

function Historico() {
  const navigate = useNavigate(); // ← Isso define a função navigate
  const [registros, setRegistros] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, "pesquisas"));
      const dados = querySnapshot.docs.map(doc => doc.data());
      setRegistros(dados.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    };

    fetchData();
  }, []);

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">📜 Histórico de Pesquisas</h1>
      <div className="space-y-6">
        {registros.map((item, i) => (
          <div key={i} className="bg-white shadow p-4 rounded-lg">
            <p className="text-sm text-gray-500">⏰ {new Date(item.createdAt).toLocaleString()}</p>
            <p><strong>👤 Nome:</strong> {item.username}</p>
            <p><strong>🎂 Nascimento:</strong> {item.birthDate}</p>
            <p><strong>🧑‍💼 Profissão:</strong> {item.profession}</p>
            <p><strong>🌎 País:</strong> {item.country}</p>
            {item.peculiarTaste && <p><strong>🎯 Gosto:</strong> {item.peculiarTaste}</p>}
            <hr className="my-2" />
            <pre className="whitespace-pre-line text-sm bg-gray-50 p-2 rounded">{item.resposta}</pre>
          </div>
        ))}
      </div>
      <div className="min-h-screen bg-gray-100 p-6">
      <button
        onClick={() => navigate('/')}
        className="mb-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-semibold transition transform hover:scale-105"
      >
        Voltar para Início
      </button>

      {/* Aqui vem o resto do seu histórico */}
    </div>
    </div>
  );
}

export default Historico;