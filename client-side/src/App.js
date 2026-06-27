import MainPage from './elements/mainPage'
import JoinRoom from './elements/joinRoom'
import Header from './components/Header'
import { DarkModeProvider } from './context/DarkModeContext'
import './App.css'
import { Route, Routes } from 'react-router-dom'

function App() {
  return (
    <DarkModeProvider>
      <Header />
      <div className="App">
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/room/:id" element={<JoinRoom />} />
          <Route path="/room/" element={<JoinRoom />} />
        </Routes>
      </div>
    </DarkModeProvider>
  )
}

export default App
