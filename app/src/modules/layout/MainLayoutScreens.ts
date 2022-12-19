import type { FC } from "react"

export type ScreenNames = "Inbox" | "Picking"

export const screenPositions: ScreenNames[] = ["Inbox", "Picking"]

export const initialScreenPosition = 1

export type MainLayoutScreen = FC<{ active: boolean }>
