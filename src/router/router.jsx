import { createBrowserRouter } from 'react-router-dom'
import Layout from '../components/Layout'
import ProtectedRoute from '../components/ProtectedRoute'
import Home from '../pages/Home'
import Calendar from '../pages/Calendar'
import CalendarEventDetail from '../pages/CalendarEventDetail'
import Details from '../pages/Details'
import Settings from '../pages/Settings'
import EditProfile from '../pages/EditProfile'
import Simulation from '../pages/Simulation'
import GuideDetail from '../pages/GuideDetail'
import NotificationDetail from '../pages/NotificationDetail'
import NewsDetail from '../pages/NewsDetail'
import CategoryGuides from '../pages/CategoryGuides'
import Login from '../pages/Login'
import Signup from '../pages/Signup'
import OAuthCallback from '../pages/OAuthCallback'
import LanguageSelect from '../pages/LanguageSelect'

const router = createBrowserRouter([
  {
    element: <ProtectedRoute />,
    children: [
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
      { path: '/guide/:guideId', element: <GuideDetail /> },
      { path: '/details/notification/:notificationId', element: <NotificationDetail /> },
      { path: '/details/news/:index', element: <NewsDetail /> },
      { path: '/details/category/:slug', element: <CategoryGuides /> },
      { path: '/calendar/:eventId', element: <CalendarEventDetail /> },
      { path: '/settings/edit-profile', element: <EditProfile /> },
    ],
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
