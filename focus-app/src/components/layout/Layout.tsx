import {
  useRef,
  useState,
  type TouchEvent,
} from 'react'
import {
  Outlet,
} from 'react-router-dom'

import {
  useGoals,
} from '@/hooks/goals/useGoals'
import {
  useGoalsWidgetSync,
} from '@/hooks/goals/useGoalsWidgetSync'

import {
  MobileTopBar,
} from './MobileTopBar'
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
  const currentYear =
    new Date().getFullYear()

  const goalsQuery =
    useGoals(currentYear)

  useGoalsWidgetSync({
    goals: goalsQuery.data ?? [],
    year: currentYear,
    enabled: goalsQuery.isSuccess,
  })

  const [
    mobileOpen,
    setMobileOpen,
  ] = useState(false)

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

      <main
        className="
          flex-1
          min-w-0
          overflow-x-hidden
        "
      >
        <MobileTopBar
          onOpenMenu={() =>
            setMobileOpen(true)
          }
        />

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