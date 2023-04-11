/**
 * @author ZYD
 * @date 2023/04/11
 * Manages the game grid by directly manipulating DOM elements
 */


import { Dimension, format, Position, rand_int } from "./lib"

export interface GameEssentials {
  grid: Element
  cover_grid: Element
  mine_label: Element
  face: Element
}

export class Grid {
  size: Dimension
  unlabelled_mines: number
  total_mines: number
  map: number[][]
  essentials: GameEssentials
  icons = {
    mine: '💣',
    flag: '🚩',
    ques: '❔',
    death: '💀',
    win: '😎',
  }

  private readonly dx: number[] = [-1, -1, -1, 0, 0, 1, 1, 1]
  private readonly dy: number[] = [-1, 0, 1, -1, 1, -1, 0, 1]


  // ###########################################################################
  // INITS
  // ###########################################################################
  constructor(size: Dimension, mines: number, essentials: GameEssentials) {
    this.size = size
    this.unlabelled_mines = mines
    this.total_mines = mines
    this.essentials = essentials
    this.map = new Array(size.height).fill(0).map(() => new Array(size.width).fill(0))

    /* generate mines randomly */
    essentials.mine_label.innerHTML = format(mines)
    for (let i = 0; i < mines; i++) {
      let coord = new Position(rand_int(0, size.width), rand_int(0, size.height))
      while (this.map[coord.y][coord.x] == -1) coord = new Position(rand_int(0, size.width), rand_int(0, size.height))
      this.map[coord.y][coord.x] = -1
    }

    /* init the numbers on the grid */
    for (let i = 0; i < size.height; i++)
      for (let j = 0; j < size.width; j++)
        if (this.map[i][j] != -1) {
          for (let k = 0; k < this.dx.length; k++) {
            let search_coord = new Position(j + this.dx[k], i + this.dy[k])
            if (search_coord.x < 0 || search_coord.x >= size.width || search_coord.y < 0 || search_coord.y >= size.height) continue
            if (this.map[search_coord.y][search_coord.x] == -1) this.map[i][j]++
          }
        }

    console.log(this.map)
  }
  render() {
    /* render bottom grid */
    for (let i = 0; i < this.size.height; i++) {
      let n_row = document.createElement('div')
      n_row.setAttribute('class', 'row')

      for (let j = 0; j < this.size.width; j++) {
        let n_block = document.createElement('div')
        n_block.setAttribute('class', 'block')

        if (this.map[i][j] != 0) {
          let n_inner = document.createElement('div')
          let matched_style: { [key: string]: string } = {
            '-1': 'font-size: 20px',
            '1': 'color: blue',
            '2': 'color: green',
            '3': 'color: red',
            '4': 'color: darkblue',
            '5': 'color: darkred',
            '6': 'color: orange',
            '7': 'color: #f035de',
            '8': 'color: purple',
          }
          n_inner.setAttribute('style', matched_style[`${this.map[i][j]}`])
          n_inner.innerHTML = this.map[i][j] == -1 ? this.icons.mine : `${this.map[i][j]}`
          n_block.appendChild(n_inner)
        }

        n_row.appendChild(n_block)
      }

      this.essentials.grid.appendChild(n_row)
    }

    /* render upper cover */
    for (let i = 0; i < this.size.height; i++) {
      let n_row = document.createElement('div')
      n_row.setAttribute('class', 'row')

      for (let j = 0; j < this.size.width; j++) {
        let n_block = document.createElement('div')
        n_block.setAttribute('class', 'cover')
        n_block.setAttribute('onmousedown', `mousedownCover(event, ${j}, ${i})`)

        let n_inner = document.createElement('div')
        n_block.appendChild(n_inner)
        n_row.appendChild(n_block)
      }

      this.essentials.cover_grid.appendChild(n_row)
    }
  }
  // ###########################################################################
  // INITS
  // ###########################################################################


  // ###########################################################################
  // UTILITIES
  // ###########################################################################
  private _in_bound(pos: Position): boolean {
    return pos.x >= 0 && pos.x < this.size.width && pos.y >= 0 && pos.y < this.size.height
  }
  private _is_revealed(pos: Position): boolean {
    return this._cover_at(pos).getAttribute('style') != null
  }
  private _is_flagged(pos: Position): boolean {
    return (this._cover_at(pos).firstChild as Element).innerHTML != ""
  }
  private _cover_at(pos: Position): Element {
    return this.essentials.cover_grid.children[pos.y].children[pos.x]
  }
  private _dfs_open(pos: Position) {
    for (let k = 0; k < this.dx.length; k++) {
      let n_pos = new Position(pos.x + this.dx[k], pos.y + this.dy[k])
      if (!this._in_bound(n_pos) || this._is_revealed(n_pos) || this._is_flagged(n_pos)) continue;
      this._cover_at(n_pos).setAttribute('style', 'opacity: 0')
      if (this.map[n_pos.y][n_pos.x] == 0) this._dfs_open(n_pos)
    }
  }
  // ###########################################################################
  // UTILITIES
  // ###########################################################################


  // ###########################################################################
  // ESSENTIAL GAME FUNCTIONS
  // ###########################################################################
  tap(pos: Position) {
    let cover = this._cover_at(pos);
    if (this._is_flagged(pos)) {
      /* remove the flag if flagged */
      (cover.firstChild as Element).innerHTML = ""
      this.essentials.mine_label.innerHTML = format(++this.unlabelled_mines)
      return
    }

    if (this.map[pos.y][pos.x] == -1)
      this.gameover()

    cover.setAttribute('style', 'opacity: 0')
    if (this.map[pos.y][pos.x] == 0) this._dfs_open(pos)

    let uncovered = 0
    for (let x = 0; x < this.size.width; x++)
      for (let y = 0; y < this.size.height; y++)
        if (!this._is_revealed(new Position(x, y))) uncovered++

    if (uncovered == this.total_mines) this.win()
  }
  starttry(pos: Position) {
    if (!this._is_revealed(pos)) return

    for (let k = 0; k < this.dx.length; k++) {
      let n_pos = new Position(pos.x + this.dx[k], pos.y + this.dy[k])
      if (!this._in_bound(n_pos) || this._is_revealed(n_pos) || this._is_flagged(n_pos)) continue;
      let n_cover = this._cover_at(n_pos);
      n_cover.classList.add('plain')
    }
    return;
  }
  try(pos: Position) {
    if (!this._is_revealed(pos)) return

    let ok = true
    for (let k = 0; k < this.dx.length; k++) {
      let n_pos = new Position(pos.x + this.dx[k], pos.y + this.dy[k])
      if (!this._in_bound(n_pos) || this._is_revealed(n_pos) || this._is_flagged(n_pos)) continue;

      if (this.map[n_pos.y][n_pos.x] == -1) {
        ok = false
        break
      }
    }

    for (let k = 0; k < this.dx.length; k++) {
      let n_pos = new Position(pos.x + this.dx[k], pos.y + this.dy[k])
      if (!this._in_bound(n_pos) || this._is_revealed(n_pos) || this._is_flagged(n_pos)) continue;

      if (ok) this.tap(n_pos)
      else this._cover_at(n_pos).classList.remove('plain')
    }
  }
  flag(pos: Position) {
    let cover = this._cover_at(pos);
    let target = cover.firstChild as Element;
    if (target.innerHTML == "") {
      target.innerHTML = this.icons.flag
      this.unlabelled_mines--
    } else {
      target.innerHTML = ""
      this.unlabelled_mines++
    }
    this.essentials.mine_label.innerHTML = format(this.unlabelled_mines)
    if (this.unlabelled_mines < 0) this.essentials.mine_label.setAttribute('style', 'color: green')
    else this.essentials.mine_label.setAttribute('style', '')
  }
  // ###########################################################################
  // ESSENTIAL GAME FUNCTIONS
  // ###########################################################################


  // ###########################################################################
  // GAME TERMINATION
  // ###########################################################################
  gameover_callback!: () => void
  ongameover(func: () => void) {
    this.gameover_callback = func
  }
  gameover() {
    for (let x = 0; x < this.size.width; x++)
      for (let y = 0; y < this.size.height; y++)
        this._cover_at(new Position(x, y)).setAttribute('style', 'opacity: 0')

    this.essentials.face.innerHTML = this.icons.death
    this.gameover_callback?.()
  }
  win_callback!: () => void
  onwin(func: () => void) {
    this.win_callback = func
  }
  win() {
    this.essentials.face.innerHTML = this.icons.win
    this.win_callback?.()
  }
  // ###########################################################################
  // GAME TERMINATION
  // ###########################################################################


  // ###########################################################################
  // CHEATS
  // ###########################################################################
  reveal(pos: Position) {
    this._cover_at(pos).classList.add('reveal')
  }
  reveal_all() {
    for (let x = 0; x < this.size.width; x++)
      for (let y = 0; y < this.size.height; y++)
        this.reveal(new Position(x, y))
  }
  unreveal(pos: Position) {
    this._cover_at(pos).classList.remove('reveal')
  }
  unreveal_all() {
    for (let x = 0; x < this.size.width; x++)
      for (let y = 0; y < this.size.height; y++)
        this.unreveal(new Position(x, y))
  }
  // ###########################################################################
  // CHEATS
  // ###########################################################################
}