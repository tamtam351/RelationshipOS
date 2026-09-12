import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { RelationshipProvider } from './contexts/RelationshipContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Onboarding from './pages/Onboarding'
import Home from './pages/Home'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RelationshipProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/onboarding" element={
              <ProtectedRoute requireRelationship={false}>
                <Onboarding />
              </ProtectedRoute>
            } />
            <Route path="/home" element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={<Navigate to="/home" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </RelationshipProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
