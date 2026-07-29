import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu } from 'lucide-react'

import { SidebarDesktop } from './SidebarDesktop'
import { SidebarMobile } from './SidebarMobile'

export function Layout() {
  const [mobileNavOpen, setMobileNavOpen] =
    useState(false)

  return (
    <div className="flex min-h-screen bg-black text-white">

      {/* Sidebar desktop */}
      <SidebarDesktop />

      {/* Sidebar mobile */}
      <SidebarMobile
        open={mobileNavOpen}
        onClose={() =>
          setMobileNavOpen(false)
        }
      />

      {/* Botão menu mobile */}
      <button
        onClick={() =>
          setMobileNavOpen(true)
        }
        aria-label="Open menu"
        className="
          lg:hidden
          fixed
          top-4
          left-4
          z-30
          p-2
          rounded-xl
          bg-[#141414]
          border
          border-white/10
          text-white
        "
      >
        <Menu size={20} />
      </button>

      {/* Conteúdo principal */}
      <main
        className="
          flex-1
          min-w-0
          overflow-x-hidden

          px-6
          md:px-8
          lg:px-12
          xl:px-16

          py-8

          max-w-[1600px]
        "
      >
        <Outlet />
      </main>

    </div>
  )
}