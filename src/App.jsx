import { Suspense } from 'react'
import Layout from './app/Layout'
import AppRoutes from './app/routes'

export default function App() {
  return (
    <Layout>
      <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
        <AppRoutes />
      </Suspense>
    </Layout>
  )
}