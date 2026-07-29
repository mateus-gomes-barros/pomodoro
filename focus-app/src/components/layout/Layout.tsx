import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { SidebarDesktop } from './SidebarDesktop'
import { SidebarMobile } from './SidebarMobile'

export function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-[#0a0a0a] text-white">
      <SidebarDesktop />

      <SidebarMobile
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation"
        className="
          lg:hidden
          fixed
          top-3.5
          left-4
          z-30
          p-2
          rounded-xl
          bg-[#161616]
          border
          border-white/[0.08]
          text-white/70
          hover:text-white
          transition-colors
        "
      >
        <Menu size={18} />
      </button>

      <main className="flex-1 min-w-0 overflow-x-hidden">
        <div
          className="
            w-full
            max-w-[1440px]
            mx-auto
            px-5
            md:px-8
            lg:px-10
            xl:px-12
            py-8
          "
        >
          <Outlet />
        </div>
      </main>
    </div>
  )
}