import { Suspense, lazy } from 'react'
import { Analytics } from '@vercel/analytics/react'
import { CmsProvider } from './cms/CmsProvider'
import { Site } from './components/Site'

const AdminApp = lazy(() => import('./admin/AdminApp'))

export default function App() {
  const isAdmin =
    window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin/')

  if (isAdmin) {
    return (
      <Suspense fallback={null}>
        <AdminApp />
      </Suspense>
    )
  }

  return (
    <CmsProvider>
      <Site />
      <Analytics />
    </CmsProvider>
  )
}
