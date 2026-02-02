import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Stats from './pages/Stats'
import Schedule from './pages/Schedule'
import Roster from './pages/Roster'
import Coaches from './pages/Coaches'
import SupportTeam from './pages/SupportTeam'
import TeamInfo from './pages/TeamInfo'
import History from './pages/History'
import Photos from './pages/Photos'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/roster" element={<Roster />} />
        <Route path="/coaches" element={<Coaches />} />
        <Route path="/support-team" element={<SupportTeam />} />
        <Route path="/team-info" element={<TeamInfo />} />
        <Route path="/history" element={<History />} />
        <Route path="/photos" element={<Photos />} />
      </Routes>
    </Layout>
  )
}

export default App
