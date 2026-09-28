import { Route, Routes, Navigate } from 'react-router-dom'
import { Layout } from './componentes/Layout'
import { Inicio } from './telas/Inicio'
import { Semanas } from './telas/Semanas'
import { Rotina } from './telas/Rotina'
import { Atrasos } from './telas/Atrasos'
import { Dashboard } from './telas/Dashboard'
import { Provas } from './telas/Provas'
import { Leituras } from './telas/Leituras'
import { Conteudo } from './telas/Conteudo'
import { Trabalho } from './telas/Trabalho'
import { Configuracoes } from './telas/Configuracoes'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Inicio />} />
        <Route path="semanas" element={<Semanas />} />
        <Route path="rotina" element={<Rotina />} />
        <Route path="atrasos" element={<Atrasos />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="provas" element={<Provas />} />
        <Route path="leituras" element={<Leituras />} />
        <Route path="conteudo" element={<Conteudo />} />
        <Route path="trabalho" element={<Trabalho />} />
        <Route path="config" element={<Configuracoes />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
