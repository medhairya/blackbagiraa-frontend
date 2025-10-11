import LogoutButton from '@/components/Logout'
import ThemeToggle from '@/components/ThemeToggle'
import { formatDate } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import React from 'react'

const Navbar = () => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
      {/* Title */}
      <h1 className="text-2xl sm:text-3xl font-bold">Admin Dashboard</h1>

      {/* Right Side: ThemeToggle + Date */}
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <LogoutButton/>
        <div className="bg-card p-2 rounded-md shadow flex items-center">
          <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground mr-2" />
          <span className="text-xs sm:text-sm text-muted-foreground">{formatDate(new Date(), 'MMMM d, yyyy')}</span>
        </div>
      </div>
    </div>
  )
}

export default Navbar
