import {
  useEffect,
  useRef,
  useState,
  type TouchEvent,
} from 'react'
import {
  Outlet,
} from 'react-router-dom'
import {
  Menu,
} from 'lucide-react'

import {
  SidebarDesktop,
} from './SidebarDesktop'
import {
  SidebarMobile,
} from './SidebarMobile'

const EDGE_WIDTH = 30
const SWIPE_DISTANCE = 60
const VERTICAL_TOLERANCE = 80

export function Layout() {
  const [
    mobileOpen,
    setMobileOpen,
  ] = useState(false)

  const [
    isScrolled,
    setIsScrolled,
  ] = useState(false)

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(
        window.scrollY > 20,
      )
    }

    handleScroll()

    window.addEventListener(
      'scroll',
      handleScroll,
      {
        passive: true,
      },
    )

    return () =>
      window.removeEventListener(
        'scroll',
        handleScroll,
      )
  }, [])

  const touchStartXRef =
    useRef<number | null>(null)

  const touchStartYRef =
    useRef<number | null>(null)

  const swipeStartedFromEdgeRef =
    useRef(false)

  function handleTouchStart(
    event: TouchEvent<HTMLDivElement>,
  ) {
    if (mobileOpen) {
      return
    }

    const touch = event.touches[0]

    if (!touch) {
      return
    }

    const startedFromEdge =
      touch.clientX <= EDGE_WIDTH

    swipeStartedFromEdgeRef.current =
      startedFromEdge

    if (!startedFromEdge) {
      touchStartXRef.current = null
      touchStartYRef.current = null
      return
    }

    touchStartXRef.current =
      touch.clientX

    touchStartYRef.current =
      touch.clientY
  }

  function handleTouchEnd(
    event: TouchEvent<HTMLDivElement>,
  ) {
    if (
      mobileOpen ||
      !swipeStartedFromEdgeRef.current ||
      touchStartXRef.current === null ||
      touchStartYRef.current === null
    ) {
      resetSwipe()
      return
    }

    const touch =
      event.changedTouches[0]

    if (!touch) {
      resetSwipe()
      return
    }

    const horizontalDistance =
      touch.clientX -
      touchStartXRef.current

    const verticalDistance =
      Math.abs(
        touch.clientY -
          touchStartYRef.current,
      )

    const isRightSwipe =
      horizontalDistance >=
        SWIPE_DISTANCE &&
      verticalDistance <=
        VERTICAL_TOLERANCE

    if (isRightSwipe) {
      setMobileOpen(true)
    }

    resetSwipe()
  }

  function handleTouchCancel() {
    resetSwipe()
  }

  function resetSwipe() {
    touchStartXRef.current = null
    touchStartYRef.current = null
    swipeStartedFromEdgeRef.current =
      false
  }

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={
        handleTouchCancel
      }
      className="
        flex
        min-h-screen
        bg-[#0a0a0a]
        text-white
      "
    >
      <SidebarDesktop />

      <SidebarMobile
        open={mobileOpen}
        onClose={() =>
          setMobileOpen(false)
        }
      />

      <button
        type="button"
        onClick={() =>
          setMobileOpen(true)
        }
        aria-label="Open navigation"
        className={`
          lg:hidden
          fixed
          z-30
          rounded-2xl
          bg-[#161616]/95
          backdrop-blur-md
          border
          border-white/[0.08]
          shadow-xl
          text-white/70
          hover:text-white
          active:scale-95
          transition-all
          duration-300
          ${
            isScrolled
              ? `
                top-4
                left-4
                p-2
                scale-90
              `
              : `
                top-8
                left-5
                p-3
                scale-100
              `
          }
        `}
      >
        <Menu
          size={
            isScrolled
              ? 18
              : 20
          }
        />
      </button>

      <main
        className="
          flex-1
          min-w-0
          overflow-x-hidden
        "
      >
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