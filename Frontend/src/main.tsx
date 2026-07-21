import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './App.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Home from './pages/Home.tsx'
import CardGame1 from './pages/CardGame1.tsx'
import { RecoilRoot } from 'recoil'
import Dashboard from './pages/Darshboard.tsx'
import GameCanvas from './pages/AsteroidShooter.tsx'
import JapaneseScroll from './pages/StorybookReader..tsx'
import TTSDemo from './pages/trialTTS.tsx'
import Login from './pages/Login.tsx'
import Signup from './pages/Signup.tsx'
import Account from './pages/Account.tsx'
import ProtectedRoute from './components/ProtectedRoute.tsx'
import { ThemeProvider } from './ThemeContext.tsx'
import { AuthProvider } from './context/AuthContext.tsx'

function protect(element: React.ReactNode, strict = false) {
  return <ProtectedRoute strict={strict}>{element}</ProtectedRoute>
}

const router = createBrowserRouter([
  { path: '/', element: <Home />, errorElement: <div>404 Not Found</div> },
  { path: '/login', element: <Login />, errorElement: <div>404 Not Found</div> },
  { path: '/signup', element: <Signup />, errorElement: <div>404 Not Found</div> },
  { path: '/account', element: protect(<Account />, true), errorElement: <div>404 Not Found</div> },
  { path: '/cardgame1', element: protect(<CardGame1 />), errorElement: <div>404 Not Found</div> },
  { path: '/trial', element: protect(<GameCanvas />), errorElement: <div>404 Not Found</div> },
  { path: '/dashboard', element: protect(<Dashboard />), errorElement: <div>404 Not Found</div> },
  { path: '/game1', element: protect(<CardGame1 />), errorElement: <div>404 Not Found</div> },
  { path: '/game2', element: protect(<GameCanvas />), errorElement: <div>404 Not Found</div> },
  { path: '/story', element: protect(<JapaneseScroll />), errorElement: <div>404 Not Found</div> },
  { path: '/TTS', element: protect(<TTSDemo />, true), errorElement: <div>404 Not Found</div> },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RecoilRoot>
      <AuthProvider>
        <ThemeProvider>
          <RouterProvider router={router} />
        </ThemeProvider>
      </AuthProvider>
    </RecoilRoot>
  </StrictMode>,
)
