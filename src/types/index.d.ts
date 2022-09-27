declare global {
  interface Window {
    exec: (cmd: string) => void,
    help: () => void,
    cmdkeydown: (event: KeyboardEvent, val: string) => void,
    mousedownCover: (event: MouseEvent, x: number, y: number) => void,
    closePopup: () => void,
    init: (width?: number, height?: number, mine?: number) => void,
  }
}

export {}