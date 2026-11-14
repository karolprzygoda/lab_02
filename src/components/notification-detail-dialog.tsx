"use client"

import {
  createContext,
  useCallback,
  useContext,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog"
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from "./ui/drawer"
import { Button } from "./ui/button"
import { X } from "lucide-react"

const CloseDetailsContext = createContext<(() => void) | null>(null)
const DetailsKindContext = createContext<"dialog" | "drawer">("dialog")

export function useCloseNotificationDetails() {
  return useContext(CloseDetailsContext)
}

// Only selects the initially open overlay for links; trigger visibility is CSS.
function subscribe(callback: () => void) {
  const media = window.matchMedia("(min-width: 768px)")
  media.addEventListener("change", callback)
  return () => media.removeEventListener("change", callback)
}

export function NotificationDetailDialog({
  children,
  linked = false,
  recipient,
}: {
  children: ReactNode
  linked?: boolean
  recipient?: string
}) {
  const router = useRouter()
  const desktop = useSyncExternalStore(
    subscribe,
    () => window.matchMedia("(min-width: 768px)").matches,
    () => null
  )
  const [dialogOpen, setDialogOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const close = useCallback(() => {
    setDialogOpen(false)
    setDrawerOpen(false)
    setDismissed(true)
    if (linked) {
      const params = new URLSearchParams(window.location.search)
      params.delete("notification")
      router.replace(`/?${params}`, { scroll: false })
    }
  }, [linked, router])
  const trigger = (
    <Button variant="outline" size="sm">
      Szczegóły
    </Button>
  )
  return (
    <CloseDetailsContext.Provider value={close}>
      <Dialog
        open={dialogOpen || (linked && !dismissed && desktop === true)}
        onOpenChange={(next) => (next ? setDialogOpen(true) : close())}
      >
        {!linked ? (
          <DialogTrigger
            className="hidden md:inline-flex"
            render={trigger}
            aria-label={`Szczegóły powiadomienia do ${recipient}`}
          />
        ) : null}
        <DetailsKindContext.Provider value="dialog">
          {children}
        </DetailsKindContext.Provider>
      </Dialog>
      <Drawer
        open={drawerOpen || (linked && !dismissed && desktop === false)}
        onOpenChange={(next) => (next ? setDrawerOpen(true) : close())}
        showSwipeHandle
      >
        {!linked ? (
          <DrawerTrigger
            className="md:hidden"
            render={trigger}
            aria-label={`Szczegóły powiadomienia do ${recipient}`}
          />
        ) : null}
        <DetailsKindContext.Provider value="drawer">
          {children}
        </DetailsKindContext.Provider>
      </Drawer>
    </CloseDetailsContext.Provider>
  )
}

export function NotificationDetailsContent({
  title,
  badges,
  children,
  actions,
}: {
  title: string
  badges: ReactNode
  children: ReactNode
  actions?: ReactNode
}) {
  const drawer = useContext(DetailsKindContext) === "drawer"
  const Header = drawer ? DrawerHeader : DialogHeader
  const Title = drawer ? DrawerTitle : DialogTitle
  const Description = drawer ? DrawerDescription : DialogDescription
  const header = (
    <Header className="shrink-0 gap-3 border-b p-6 pr-12 text-left">
      <Description>Szczegóły powiadomienia</Description>
      <Title className="text-xl leading-snug wrap-break-word">{title}</Title>
      <div className="mt-3 flex flex-wrap gap-2">{badges}</div>
    </Header>
  )
  if (drawer)
    return (
      <DrawerContent className="max-h-[90dvh] md:hidden">
        <DrawerClose
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              className="absolute top-3 right-3"
            />
          }
          aria-label="Zamknij szczegóły"
        >
          <X />
        </DrawerClose>
        {header}
        {children}
        {actions}
      </DrawerContent>
    )
  return (
    <DialogContent className="hidden max-h-[90dvh] flex-col gap-0 overflow-hidden p-0 text-left sm:max-w-2xl md:flex">
      {header}
      {children}
      {actions}
    </DialogContent>
  )
}
