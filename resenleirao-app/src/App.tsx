import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Tabela } from './pages/Tabela';
import { Jogos } from './pages/Jogos';
import { Artilharia } from './pages/Artilharia';
import { Estatisticas } from './pages/Estatisticas';
import { Transferencias } from './pages/Transferencias';
import { Elenco } from './pages/Elenco';
import { MeuClube } from './pages/MeuClube';
import { Admin } from './pages/Admin';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="tabela" element={<Tabela />} />
            <Route path="jogos" element={<Jogos />} />
            <Route path="artilharia" element={<Artilharia />} />
            <Route path="estatisticas" element={<Estatisticas />} />
            <Route path="transferencias" element={<Transferencias />} />
            <Route path="elenco/:clubeId" element={<Elenco />} />
            <Route path="meu-clube" element={<MeuClube />} />
            <Route path="admin" element={<Admin />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;