"use client"

import { createContext, useCallback, useState, type ReactNode } from "react"
import { ScrollArea } from "./ui/scroll-area"
import { Plus } from "lucide-react"
import { Button } from "./ui/button"
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

export const NotificationCreateCloseContext = createContext<
  (() => void) | null
>(null)

export function NotificationCreate({ children }: { children: ReactNode }) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const close = useCallback(() => {
    setDialogOpen(false)
    setDrawerOpen(false)
  }, [])
  const trigger = (
    <Button>
      <Plus data-icon="inline-start" />
      Dodaj powiadomienie
    </Button>
  )
  return (
    <NotificationCreateCloseContext.Provider value={close}>
      <Dialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        disablePointerDismissal
      >
        <DialogTrigger className="hidden md:inline-flex" render={trigger} />
        <DialogContent className="hidden max-h-[90dvh] flex-col overflow-hidden sm:max-w-xl md:flex">
          <DialogHeader>
            <DialogTitle>Dodaj powiadomienie</DialogTitle>
            <DialogDescription>
              Uzupełnij dane i zaplanuj doręczenie.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="min-h-0 flex-1 **:data-[slot=scroll-area-viewport]:max-h-[calc(90dvh-8rem)]">
            <div className="p-1 pr-6">{children}</div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
      <Drawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        showSwipeHandle
        disablePointerDismissal
      >
        <DrawerTrigger className="md:hidden" render={trigger} />
        <DrawerContent className="md:hidden">
          <DrawerHeader>
            <DrawerTitle>Dodaj powiadomienie</DrawerTitle>
            <DrawerDescription>
              Uzupełnij dane i zaplanuj doręczenie.
            </DrawerDescription>
          </DrawerHeader>
          <ScrollArea className="min-h-0 flex-1 **:data-[slot=scroll-area-viewport]:max-h-[calc(100dvh-14rem)]">
            <div className="p-4 pr-8 pb-8">
              {children}
              <DrawerClose
                render={<Button variant="outline" className="mt-4 w-full" />}
              >
                Zamknij
              </DrawerClose>
            </div>
          </ScrollArea>
        </DrawerContent>
      </Drawer>
    </NotificationCreateCloseContext.Provider>
  )
}
