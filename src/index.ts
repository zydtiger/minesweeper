import { sleep, Dimension, Position, randint, assert, format } from './lib'
import { Grid, GameEssentials } from './grid'

type TimeHandler = number;

const trailofwonder: string[] = ['😀', '🙂', '😐', '🙁', '☹️', '😪']
let grid: Grid;
let timer: TimeHandler;
let secs: number = 0;

window.exec = (cmd: string) => {
  console.log(cmd)
  let cmd_parts = cmd.split(' ')
  try {
    let cmd_matches: { [key: string]: () => void } = {
      'spawn': () => {
        if (cmd_parts.length != 4) throw SyntaxError("Wrong number of args!");
        let w = parseInt(cmd_parts[1])
        let h = parseInt(cmd_parts[2])
        let m = parseInt(cmd_parts[3])
        assert(() => !isNaN(w) && !isNaN(h) && !isNaN(m));
        window.init(w, h, m)
      },
      'reveal': () => {
        if (cmd_parts.length == 1) grid.revealAll()
        else if (cmd_parts.length == 3) {
          let pos = new Position(parseInt(cmd_parts[1]), parseInt(cmd_parts[2]));
          assert(() => !isNaN(pos.x) && !isNaN(pos.y))
          grid.reveal(pos)
        }
        else throw SyntaxError("Wrong number of args!")
      },
      'unreveal': () => {
        if (cmd_parts.length == 1) grid.unrevealAll()
        else if (cmd_parts.length == 3) {
          let pos = new Position(parseInt(cmd_parts[1]), parseInt(cmd_parts[2]));
          assert(() => !isNaN(pos.x) && !isNaN(pos.y))
          grid.unreveal(pos)
        }
        else throw SyntaxError("Wrong number of args!")
      },
      'tap': () => {
        if (cmd_parts.length != 3) throw SyntaxError("Wrong number of args!")
        let pos = new Position(parseInt(cmd_parts[1]), parseInt(cmd_parts[2]));
        assert(() => !isNaN(pos.x) && !isNaN(pos.y))
        grid.tap(pos)
      },
      'flag': () => {
        if (cmd_parts.length != 3) throw SyntaxError("Wrong number of args!")
        let pos = new Position(parseInt(cmd_parts[1]), parseInt(cmd_parts[2]));
        assert(() => !isNaN(pos.x) && !isNaN(pos.y))
        grid.flag(pos)
      },
      'starttimer': () => {
        if (cmd_parts.length != 1) throw SyntaxError("Wrong number of args!");

        (document.getElementById('face-status') as Element).innerHTML = trailofwonder[0];
        (document.getElementById('timer') as Element).innerHTML = format(secs);
        timer = window.setInterval(() => {
          secs++;
          (document.getElementById('timer') as Element).innerHTML = format(secs);
          (document.getElementById('face-status') as Element).innerHTML = trailofwonder[Math.floor(secs / 60000)]
        }, 1000)
      },
      'stoptimer': () => {
        if (cmd_parts.length != 1) throw SyntaxError("Wrong number of args!")
        window.clearInterval(timer);
      }
    }
    if (Object.keys(cmd_matches).indexOf(cmd_parts[0]) == -1)
      throw SyntaxError("Command nonexistent! Consider adding yourself :)");

    cmd_matches[cmd_parts[0]]()

  } catch (e) {
    console.error(e)
  }

}

window.help = () => {
  let popup_title = document.querySelector('#popup h1') as Element;
  popup_title.innerHTML = "Docs";
  popup_title.setAttribute('style', 'color: black');

  (document.querySelector('#popup iframe') as Element).setAttribute('style', 'display: block')

  popup()
}

window.cmdKeyDown = (event: KeyboardEvent, val: string) => {
  // console.log(event)
  if (event.code == "Enter") {
    window.exec(val);
    (event.target as HTMLInputElement).value = ""
  }
}

function popup() {
  (document.getElementById('popup-back') as Element).setAttribute('style', 'display: block');
  (document.getElementById('popup') as Element).setAttribute('style', 'display: flex');
}

window.closePopup = () => {
  (document.getElementById('popup-back') as Element).setAttribute('style', 'display: none');
  (document.getElementById('popup') as Element).setAttribute('style', 'display: none');
  (document.querySelector('#popup iframe') as Element).setAttribute('style', 'display: none')
}

function initClickHooks() {
  window.clickCover = (x: number, y: number) => {
    // console.log(x, y)
    window.exec(`tap ${x} ${y}`)
  }

  window.rightclickCover = (event: MouseEvent, x: number, y: number) => {
    // console.log(event)
    event.preventDefault();
    window.exec(`flag ${x} ${y}`)
  }
}

function clearClickHooks() {
  window.clickCover = () => { }
  window.rightclickCover = () => { }
}

window.init = (width?: number, height?: number, mine?: number) => {
  /* clear */
  (document.getElementById('grid') as Element).innerHTML = "";
  (document.getElementById('cover_grid') as Element).innerHTML = "";

  /* restore / store values if apply */
  let last_width = parseInt(localStorage.getItem('last_width') as string)
  let last_height = parseInt(localStorage.getItem('last_height') as string)
  let last_mine = parseInt(localStorage.getItem('last_mine') as string)

  try {
    assert(() => !isNaN(last_width) && !isNaN(last_height) && !isNaN(last_mine))
  } catch (e) {
    console.error("Stored values invalid, using default")
    last_width = 10
    last_height = 10
    last_mine = 10
  }

  last_width = width ?? last_width;
  last_height = height ?? last_height;
  last_mine = mine ?? last_mine;

  localStorage.setItem('last_width', `${last_width}`)
  localStorage.setItem('last_height', `${last_height}`)
  localStorage.setItem('last_mine', `${last_mine}`)

  let game_essentials: GameEssentials = {
    grid: document.getElementById('grid') as Element,
    cover_grid: document.getElementById('cover_grid') as Element,
    mine_label: document.getElementById('mines-left') as Element,
    face: document.getElementById('face-status') as Element,
  }

  /* game init */
  grid = new Grid(new Dimension(last_width, last_height), last_mine, game_essentials);
  grid.render();
  grid.ongameover(() => {
    window.exec('stoptimer')
    clearClickHooks()

    let popup_title = document.querySelector('#popup h1') as Element
    popup_title.innerHTML = "You LOSE!"
    popup_title.setAttribute('style', 'color: red')

    popup()
  });
  grid.onwin(() => {
    window.exec('stoptimer')
    clearClickHooks()

    let popup_title = document.querySelector('#popup h1') as Element
    popup_title.innerHTML = "You WIN!"
    popup_title.setAttribute('style', 'color: green')

    popup()
  });

  initClickHooks();
  window.exec('starttimer')
}

window.onload = () => window.init()