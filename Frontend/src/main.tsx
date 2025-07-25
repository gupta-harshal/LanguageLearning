import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './App.css'
import {createBrowserRouter, RouterProvider} from 'react-router-dom'
import Home from './pages/Home.tsx'
import CardGame1 from './pages/CardGame1.tsx'
import { RecoilRoot } from 'recoil'
import Dashboard from './pages/Darshboard.tsx'
import GameCanvas from './pages/AsteroidShooter.tsx'
const router= createBrowserRouter([{
  path: '/',
  element: <Home/>,
  errorElement: <div>404 Not Found</div>,
},{
  path : '/cardgame1',
  element: <CardGame1/>,
  errorElement: <div>404 Not Found</div>,
}
,{
  path :'/trial',
  
},
{
  path : '/dashboard',
  element : <Dashboard/>,
  errorElement: <div>404 Not Found</div>,
}
]);
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RecoilRoot>
    <RouterProvider router={router} />
    </RecoilRoot>
  </StrictMode>,
)
