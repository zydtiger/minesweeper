export function sleep(time: number) {
  return new Promise((resolve) => setTimeout(resolve, time))
}

export class Dimension {
  width: number
  height: number
  constructor(width = 0, height = 0) {
    this.width = width
    this.height = height
  }
}

export class Position {
  x: number
  y: number
  constructor(x = 0, y = 0) {
    this.x = x
    this.y = y
  }
}

export function randint(lb: number, ub: number) { // not inclusive
  return Math.floor(Math.random() * (ub - lb) + lb)
}

export function assert(func: any): void {
  if (!func()) throw EvalError
}

export function format(x: number): string {
  let res: string = `${x}`
  while (res.length < 4)
    res = '0' + res
  return res
}