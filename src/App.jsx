import { Routes, Route } from 'react-router-dom'
import { useVersionCheck } from './hooks/useVersionCheck'
import PushOptIn from './components/PushOptIn'
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
import Recaps from './pages/Recaps'

function App() {
  useVersionCheck()
  return (
    <>
    <PushOptIn />
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/recaps" element={<Recaps />} />
        <Route path="/roster" element={<Roster />} />
        <Route path="/coaches" element={<Coaches />} />
        <Route path="/support-team" element={<SupportTeam />} />
        <Route path="/support" element={<SupportTeam />} />
        <Route path="/team-info" element={<TeamInfo />} />
        <Route path="/history" element={<History />} />
        <Route path="/photos" element={<Photos />} />
      </Routes>
    </Layout>
    </>
  )
}

export default App
