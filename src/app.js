import React from 'react'
import { render } from 'react-dom'
import { getRandomArrayElements } from './utils'
import './App.css'

const colorMap = [
  '#fff',
  'blue',
  'red',
  'green',
  'orange',
  'purple',
  'pink',
  'yellow',
  'brown',
]
const EASY = 8
const MEDIUM = 12
const HARD = 16
const MODE = [
  EASY,
  MEDIUM,
  HARD,
]
const MINE_PERCENTAGE = 12 / 100

const markMap = {
  0: '',
  1: 'M',
  2: '?',
}
const boardStyle = (row) => ({
  width: `${row * (30 + 4)}px`,
})
const gridStyle = (item) => ({
  color: colorMap[item.content],
  backgroundColor: item.isMine ? 'red' : '#fff',
})

class App extends React.Component {
  state = {
    row: EASY,
    column: EASY,
    isGameOver: false,
    blocks: [],
    message: '^_^',
  }

  componentDidMount () {
    this.init()
  }

  init = () => {
    const { row, column } = this.state
    const blockNum = row * column

    // get blocks index
    const blockIdx = []
    for (let i = 0; i < blockNum; i++) {
      blockIdx.push(i)
    }

    // set total num of mine
    const mines = ~~(blockNum * MINE_PERCENTAGE)
    const minesPos = getRandomArrayElements(blockIdx, mines)

    const blocks = blockIdx.map(idx => ({
      isShow: false,
      markType: 0,
      isMine: !!~minesPos.indexOf(idx),
    }))

    // render block content
    blocks.forEach((block, idx) => {
      if (!block.isMine) {
        const indexes = this.findAroundBlock(idx)
        let num = indexes.filter(index => blocks[index].isMine).length
        if (!num) block.isBlank = true
        block.content = num
      }
    })
    this.setState({
      blocks,
      isGameOver: false,
      message: '^_^',
    })
  }

  index2Pos (idx) {
    const { row } = this.state
    const x = ~~(idx / row)
    const y = idx % row
    return [x, y]
  }

  pos2Index ([x, y]) {
    const { row } = this.state
    return x * row + y
  }

  findAroundBlock (idx, isDirect = false) {
    const { row, column } = this.state
    const [x, y] = this.index2Pos(idx)
    const generateCheck = max => i => (i >= 0 && i < max)
    const checkX = generateCheck(row)
    const checkY = generateCheck(column)
    const checkPos = ([x, y]) => checkX(x) && checkY(y)
    const directPos = [
      [x, y - 1], // top
      [x + 1, y], // bottom
      [x - 1, y], // left
      [x, y + 1], // right
    ]

    const obliquePos = [
      [x - 1, y - 1], // left top
      [x - 1, y + 1], // right top
      [x + 1, y + 1], // right bottom
      [x + 1, y - 1], // left bottom
    ]
    const probablePos = isDirect
      ? directPos
      : [...directPos, ...obliquePos]
    const realBlock = probablePos.filter(checkPos)

    return realBlock.map(pos => this.pos2Index(pos))
  }

  findAroundBlankBlock (idx) {
    const { blocks } = this.state
    const getBlockIndexes = (idx) => this.findAroundBlock(idx, true)
    const finalBlocks = []

    const loop = arr => arr.forEach(index => {
      if (blocks[index].isBlank && !blocks[index].isMarked) {
        blocks[index].isMarked = true
        finalBlocks.push(index)
        loop(getBlockIndexes(index, true))
      }
    })
    loop(getBlockIndexes(idx))

    return finalBlocks
  }

  handleModeClick = (item) => {
    this.setState({
      row: item,
      column: item,
    }, this.init)
  }

  handleBlockClick = (item, idx) => {
    const { blocks, isGameOver } = this.state
    if (isGameOver) {
      this.init()
      return
    }

    blocks[idx].markType = 0
    // const pos = this.index2Pos(idx)
    // console.log(`the block u click is located in(${pos[0]}, ${pos[1]})`)
    // console.log(item.isMine ? 'it is mine!' : 'it is block!')

    if (item.isMine) {
      blocks.forEach(block => { block.isShow = true })
      this.setState({
        blocks,
        isGameOver: true,
        message: 'u loose!',
      })
      return
    }

    blocks[idx].isShow = true

    const checkIsWin = () => blocks.every(
      block => block.isMine || (!block.isMine && block.isShow)
    )
    const winOperate = () => {
      this.setState({
        blocks,
        isGameOver: true,
        message: 'u win!',
      })
    }

    if (checkIsWin()) {
      winOperate()
      return
    }

    if (item.isBlank) {
      // TODO: optimize search method
      const blankBlocks = this.findAroundBlankBlock(idx)
      const unlockBlocks = blankBlocks
        .map(block => this.findAroundBlock(block))
        .reduce((prev, cur) => [...prev, ...cur], [])
      const showBlocks = [...blankBlocks, ...unlockBlocks]
      showBlocks.forEach(index => { blocks[index].isShow = true })

      if (checkIsWin()) {
        winOperate()
        return
      }

      this.setState({ blocks })
      return
    }

    this.setState({ blocks })
  }

  handleBlockMark = (e, item, idx) => {
    e.preventDefault()
    const { blocks, isGameOver } = this.state

    if (isGameOver) {
      this.init()
      return
    }

    if (item.isShow) return

    blocks[idx].markType = item.markType !== 2
      ? item.markType + 1
      : 0
    this.setState({ blocks })
  }

  render () {
    const {
      row,
      blocks,
      message,
      isGameOver,
    } = this.state

    return (
      <div className="app">
        <div className="mode">
          {MODE.map(item => (
            <button
              key={item}
              onClick={() => this.handleModeClick(item)}
            >
              {`${item} * ${item}`}
            </button>
          ))}
        </div>
        <p> {message} </p>
        <ul className="board" style={boardStyle(row)}>
          {blocks.map((item, idx) => (
            <li
              key={idx}
              style={item.isShow ? gridStyle(item) : null}
              onClick={() => this.handleBlockClick(item, idx)}
              onContextMenu={(e) => this.handleBlockMark(e, item, idx)}
            >
              {item.isShow ? (
                !item.isBlank && item.content
              ) : markMap[item.markType]}
            </li>
          ))}
        </ul>
      </div>
    )
  }
}

render(<App />, document.getElementById('app'))
