import React from 'react'
import { Link } from 'react-router-dom'

export default function NotFoundPage() {
   return (
      <div className="card p-8 text-center">
         <div className="text-xl font-semibold">404</div>
         <div className="text-sm text-slate-500 mt-1">Page not found</div>
         <Link to="/dashboard" className="btn-primary mt-4 inline-flex">
            Go home
         </Link>
      </div>
   )
}
