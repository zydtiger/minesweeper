import { Dimension, format, Position, randint } from "./lib"

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

  constructor(size: Dimension, mines: number, essentials: GameEssentials) {
    this.size = size
    this.unlabelled_mines = mines
    this.total_mines = mines
    this.essentials = essentials
    this.map = new Array(size.height).fill(0).map(() => new Array(size.width).fill(0))

    /* generate mines randomly */
    essentials.mine_label.innerHTML = format(mines)
    for (let i = 0; i < mines; i++) {
      let coord = new Position(randint(0, size.width), randint(0, size.height))
      while (this.map[coord.y][coord.x] == -1) coord = new Position(randint(0, size.width), randint(0, size.height))
      this.map[coord.y][coord.x] = -1
    }

    /* init the numbers on the grid */
    let dx: number[] = [-1, -1, -1, 0, 0, 1, 1, 1]
    let dy: number[] = [-1, 0, 1, -1, 1, -1, 0, 1]
    for (let i = 0; i < size.height; i++)
      for (let j = 0; j < size.width; j++)
        if (this.map[i][j] != -1) {
          for (let k = 0; k < dx.length; k++) {
            let search_coord = new Position(j + dx[k], i + dy[k])
            if (search_coord.x < 0 || search_coord.x >= size.width || search_coord.y < 0 || search_coord.y >= size.height) continue
            if (this.map[search_coord.y][search_coord.x] == -1) this.map[i][j]++
          }
        }

    console.log(this.map)
  }
  render() {
    /* render bottom grid */
    for (let i = 0; i < this.size.height; i++) {
      let nrow = document.createElement('div')
      nrow.setAttribute('class', 'row')

      for (let j = 0; j < this.size.width; j++) {
        let nblock = document.createElement('div')
        nblock.setAttribute('class', 'block')

        if (this.map[i][j] != 0) {
          let ninner = document.createElement('div')
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
          ninner.setAttribute('style', matched_style[`${this.map[i][j]}`])
          ninner.innerHTML = this.map[i][j] == -1 ? this.icons.mine : `${this.map[i][j]}`
          nblock.appendChild(ninner)
        }

        nrow.appendChild(nblock)
      }

      this.essentials.grid.appendChild(nrow)
    }

    /* render upper cover */
    for (let i = 0; i < this.size.height; i++) {
      let nrow = document.createElement('div')
      nrow.setAttribute('class', 'row')

      for (let j = 0; j < this.size.width; j++) {
        let nblock = document.createElement('div')
        nblock.setAttribute('class', 'cover')
        nblock.setAttribute('onmousedown', `mousedownCover(event, ${j}, ${i})`)

        let ninner = document.createElement('div')
        nblock.appendChild(ninner)
        nrow.appendChild(nblock)
      }

      this.essentials.cover_grid.appendChild(nrow)
    }
  }
  reveal(pos: Position) {
    this.essentials.cover_grid.children[pos.y].children[pos.x].classList.add('reveal')
  }
  revealAll() {
    for (let x = 0; x < this.size.width; x++)
      for (let y = 0; y < this.size.height; y++)
        this.reveal(new Position(x, y))
  }
  unreveal(pos: Position) {
    this.essentials.cover_grid.children[pos.y].children[pos.x].classList.remove('reveal')
  }
  unrevealAll() {
    for (let x = 0; x < this.size.width; x++)
      for (let y = 0; y < this.size.height; y++)
        this.unreveal(new Position(x, y))
  }

  gameover_callback!: () => void
  ongameover(func: () => void) {
    this.gameover_callback = func
  }
  gameover() {
    for (let x = 0; x < this.size.width; x++)
      for (let y = 0; y < this.size.height; y++)
        this.essentials.cover_grid.children[y].children[x].setAttribute('style', 'opacity: 0')

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

  /* dfs function */
  private readonly dx: number[] = [-1, -1, -1, 0, 0, 1, 1, 1]
  private readonly dy: number[] = [-1, 0, 1, -1, 1, -1, 0, 1]
  private _in_bound(pos: Position): boolean {
    return pos.x >= 0 && pos.x < this.size.width && pos.y >= 0 && pos.y < this.size.height
  }
  private _dfs_open(pos: Position) {
    for (let k = 0; k < this.dx.length; k++) {
      let npos = new Position(pos.x + this.dx[k], pos.y + this.dy[k])
      if (!this._in_bound(npos)) continue;
      let cover = this.essentials.cover_grid.children[npos.y].children[npos.x]
      if (cover.getAttribute('style') != null || (cover.firstChild as Element).innerHTML != "") continue;
      cover.setAttribute('style', 'opacity: 0')
      if (this.map[npos.y][npos.x] == 0) this._dfs_open(npos)
    }
  }
  tap(pos: Position) {
    let cover = this.essentials.cover_grid.children[pos.y].children[pos.x];
    if ((cover.firstChild as Element).innerHTML != "") {
      /* remove the flag if flagged */
      (cover.firstChild as Element).innerHTML = ""
      this.essentials.mine_label.innerHTML = format(++this.unlabelled_mines)
      return
    }

    if (this.map[pos.y][pos.x] == -1)
      this.gameover()
    
    cover.setAttribute('style', 'opacity: 0') // non retractable
    if (this.map[pos.y][pos.x] == 0) this._dfs_open(pos)

    let uncovered = 0
    for (let x = 0; x < this.size.width; x++)
      for (let y = 0; y < this.size.height; y++)
        if (this.essentials.cover_grid.children[y].children[x].getAttribute('style') == null)
          uncovered++

    if (uncovered == this.total_mines) this.win()
  }
  starttry(pos: Position) {
    for (let k=0;k<this.dx.length;k++) {
      let npos = new Position(pos.x + this.dx[k], pos.y + this.dy[k])
      if (!this._in_bound(npos)) continue;
      let ncover = this.essentials.cover_grid.children[npos.y].children[npos.x];
      if (ncover.getAttribute('style') != null || (ncover.firstChild as Element).innerHTML != "") continue;
      ncover.classList.add('plain')
    }
    return;
  }
  try(pos: Position) {
    let ok = true
    for (let k=0;k<this.dx.length;k++) {
      let npos = new Position(pos.x + this.dx[k], pos.y + this.dy[k])
      if (!this._in_bound(npos)) continue;
      let ncover = this.essentials.cover_grid.children[npos.y].children[npos.x];
      if (ncover.getAttribute('style') != null || (ncover.firstChild as Element).innerHTML != "") continue;
      
      if (this.map[npos.y][npos.x] == -1) { 
        ok = false
        break
      }
    }
    
    for (let k=0;k<this.dx.length;k++) {
      let npos = new Position(pos.x + this.dx[k], pos.y + this.dy[k])
      if (!this._in_bound(npos)) continue;
      let ncover = this.essentials.cover_grid.children[npos.y].children[npos.x];
      if (ncover.getAttribute('style') != null || (ncover.firstChild as Element).innerHTML != "") continue;
      
      if (ok) this.tap(npos)
      else ncover.classList.remove('plain')
    }
  }
  flag(pos: Position) {
    let cover = this.essentials.cover_grid.children[pos.y].children[pos.x];
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
}