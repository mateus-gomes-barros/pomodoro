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
  useMonthlyActivityWidgetSync,
} from '@/hooks/widgets/useMonthlyActivityWidgetSync'
import {
  useWeeklyActivityWidgetSync,
} from '@/hooks/widgets/useWeeklyActivityWidgetSync'

import {
  MobileTopBar,
} from './MobileTopBar'
import {
  SidebarDesktop,
} from './SidebarDesktop'
import {
  MOBILE_DRAWER_WIDTH,
  SidebarMobile,
} from './SidebarMobile'

const EDGE_WIDTH = 30
const DIRECTION_LOCK_DISTANCE = 8
const OPEN_PROGRESS_THRESHOLD = 0.35
const OPEN_VELOCITY_THRESHOLD = 500

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

  useMonthlyActivityWidgetSync()
  useWeeklyActivityWidgetSync()

  const [
    mobileOpen,
    setMobileOpen,
  ] = useState(false)

  const [
    dragProgress,
    setDragProgress,
  ] = useState(0)

  const [
    isDraggingDrawer,
    setIsDraggingDrawer,
  ] = useState(false)

  const touchStartXRef =
    useRef<number | null>(null)

  const touchStartYRef =
    useRef<number | null>(null)

  const lastTouchXRef =
    useRef<number | null>(null)

  const lastTouchTimeRef =
    useRef<number | null>(null)

  const dragVelocityRef =
    useRef(0)

  const swipeStartedFromEdgeRef =
    useRef(false)

  const directionLockedRef =
    useRef<
      'horizontal' |
      'vertical' |
      null
    >(null)

  function openMobileMenu() {
    resetSwipe()
    setDragProgress(0)
    setIsDraggingDrawer(false)
    setMobileOpen(true)
  }

  function closeMobileMenu() {
    resetSwipe()
    setDragProgress(0)
    setIsDraggingDrawer(false)
    setMobileOpen(false)
  }

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
      resetSwipe()

      return
    }

    const now =
      performance.now()

    touchStartXRef.current =
      touch.clientX

    touchStartYRef.current =
      touch.clientY

    lastTouchXRef.current =
      touch.clientX

    lastTouchTimeRef.current =
      now

    dragVelocityRef.current = 0
    directionLockedRef.current = null

    setDragProgress(0)
    setIsDraggingDrawer(false)
  }

  function handleTouchMove(
    event: TouchEvent<HTMLDivElement>,
  ) {
    if (
      mobileOpen ||
      !swipeStartedFromEdgeRef.current ||
      touchStartXRef.current === null ||
      touchStartYRef.current === null
    ) {
      return
    }

    const touch = event.touches[0]

    if (!touch) {
      return
    }

    const horizontalDistance =
      touch.clientX -
      touchStartXRef.current

    const verticalDistance =
      touch.clientY -
      touchStartYRef.current

    const absoluteHorizontalDistance =
      Math.abs(
        horizontalDistance,
      )

    const absoluteVerticalDistance =
      Math.abs(
        verticalDistance,
      )

    if (
      directionLockedRef.current ===
        null &&
      Math.max(
        absoluteHorizontalDistance,
        absoluteVerticalDistance,
      ) >= DIRECTION_LOCK_DISTANCE
    ) {
      directionLockedRef.current =
        absoluteHorizontalDistance >
        absoluteVerticalDistance
          ? 'horizontal'
          : 'vertical'
    }

    if (
      directionLockedRef.current ===
      'vertical'
    ) {
      setDragProgress(0)
      setIsDraggingDrawer(false)

      return
    }

    if (
      directionLockedRef.current !==
      'horizontal'
    ) {
      return
    }

    event.preventDefault()

    const currentDistance =
      Math.min(
        Math.max(
          horizontalDistance,
          0,
        ),
        MOBILE_DRAWER_WIDTH,
      )

    const nextProgress =
      currentDistance /
      MOBILE_DRAWER_WIDTH

    const now =
      performance.now()

    if (
      lastTouchXRef.current !== null &&
      lastTouchTimeRef.current !== null
    ) {
      const elapsedMilliseconds =
        now -
        lastTouchTimeRef.current

      if (elapsedMilliseconds > 0) {
        dragVelocityRef.current =
          ((touch.clientX -
            lastTouchXRef.current) /
            elapsedMilliseconds) *
          1000
      }
    }

    lastTouchXRef.current =
      touch.clientX

    lastTouchTimeRef.current =
      now

    setIsDraggingDrawer(true)
    setDragProgress(nextProgress)
  }

  function handleTouchEnd() {
    if (
      mobileOpen ||
      !swipeStartedFromEdgeRef.current
    ) {
      resetSwipe()

      return
    }

    const shouldOpen =
      dragProgress >=
        OPEN_PROGRESS_THRESHOLD ||
      dragVelocityRef.current >=
        OPEN_VELOCITY_THRESHOLD

    if (shouldOpen) {
      setMobileOpen(true)
    }

    setDragProgress(0)
    setIsDraggingDrawer(false)

    resetSwipe()
  }

  function handleTouchCancel() {
    setDragProgress(0)
    setIsDraggingDrawer(false)

    resetSwipe()
  }

  function resetSwipe() {
    touchStartXRef.current = null
    touchStartYRef.current = null
    lastTouchXRef.current = null
    lastTouchTimeRef.current = null

    dragVelocityRef.current = 0

    swipeStartedFromEdgeRef.current =
      false

    directionLockedRef.current = null
  }

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={
        handleTouchCancel
      }
      className="
        flex
        min-h-screen
        touch-pan-y
        bg-[#0a0a0a]
        text-white
      "
    >
      <SidebarDesktop />

      <SidebarMobile
        open={mobileOpen}
        dragProgress={dragProgress}
        isDragging={
          isDraggingDrawer
        }
        onClose={closeMobileMenu}
      />

      <main
        className="
          flex-1
          min-w-0
          overflow-x-clip
        "
      >
        <MobileTopBar
          onOpenMenu={
            openMobileMenu
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
            pt-4
            pb-8
            lg:py-8
          "
        >
          <Outlet />
        </div>
      </main>
    </div>
  )
}