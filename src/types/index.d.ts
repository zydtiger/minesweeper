declare global {
  interface Window {
    exec: (cmd: string) => void,
    cmdKeyDown: (event: KeyboardEvent, val: string) => void,
    clickCover: (x: number, y: number) => void,
    rightclickCover: (event: MouseEvent, x: number, y: number) => void,
    closePopup: () => void,
    init: (width?: number, height?: number, mine?: number) => void,
  }
}

export {}