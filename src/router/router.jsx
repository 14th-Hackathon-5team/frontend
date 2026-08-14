import { createBrowserRouter } from 'react-router-dom'
import Layout from '../components/Layout'
import Home from '../pages/Home'
import Calendar from '../pages/Calendar'
import Details from '../pages/Details'
import Settings from '../pages/Settings'
import Simulation from '../pages/Simulation'
import GuideDetail from '../pages/GuideDetail'
import Login from '../pages/Login'
import Signup from '../pages/Signup'
import OAuthCallback from '../pages/OAuthCallback'
import LanguageSelect from '../pages/LanguageSelect'

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/calendar', element: <Calendar /> },
      { path: '/details', element: <Details /> },
      { path: '/settings', element: <Settings /> },
      { path: '/simulation', element: <Simulation /> },
    ],
  },
  {
    path: '/guide/:id',
    element: <GuideDetail />,
  },
  {
    path: '/language',
    element: <LanguageSelect />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/oauth/callback',
    element: <OAuthCallback />,
  },
  {
    path: '/signup/profile',
    element: <Signup />,
  },
])

export default router
