import { useEffect, useRef, useState } from 'react'
import { auto } from 'manate/react'
import { Button, Empty, Input } from 'antd'
import Modal from '../common/modal'
import './quick-command-palette.styl'

const e = window.translate

export default auto(function QuickCommandPalette ({ store, onClose }) {
  const [keyword, setKeyword] = useState('')
  const [selected, setSelected] = useState(0)
  const input = useRef(null)
  const active = useRef(null)
  const query = keyword.trim().toLowerCase()
  const commands = store.currentQuickCommands.filter(item => {
    return [item.name, item.command, ...(item.labels || []),
      ...(item.commands || []).flatMap(cmd => [cmd.name, cmd.command])]
      .some(text => (text || '').toLowerCase().includes(query))
  })
  const index = Math.min(selected, Math.max(0, commands.length - 1))

  useEffect(() => {
    input.current?.focus()
  }, [])

  useEffect(() => {
    active.current?.scrollIntoView({ block: 'nearest' })
  }, [index, keyword])

  function run (item) {
    store.runQuickCommandItem(item.id)
    onClose()
  }

  function onKeyDown (event) {
    if (event.isComposing) return
    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      onClose()
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      event.stopPropagation()
      const step = event.key === 'ArrowDown' ? 1 : -1
      setSelected(commands.length ? (index + step + commands.length) % commands.length : 0)
    } else if (event.key === 'Enter' && event.target.tagName === 'INPUT') {
      event.preventDefault()
      event.stopPropagation()
      if (commands[index]) run(commands[index])
    }
  }

  return (
    <Modal open title={e('quickCommands')} onCancel={onClose} footer={null}>
      <div className='quick-command-palette' onKeyDown={onKeyDown}>
        <Input
          ref={input}
          value={keyword}
          placeholder={e('search')}
          aria-label={e('quickCommands')}
          aria-controls='quick-command-palette-results'
          onChange={event => {
            setKeyword(event.target.value)
            setSelected(0)
          }}
        />
        <div className='quick-command-palette-results' id='quick-command-palette-results'>
          {commands.map((item, i) => (
            <div key={item.id} ref={i === index ? active : null}>
              <Button
                block
                type={i === index ? 'primary' : 'text'}
                onClick={() => run(item)}
                onFocus={() => setSelected(i)}
                aria-current={i === index ? 'true' : undefined}
              >
                {item.name || item.command}
                {item.inputOnly && <span> [{e('inputOnly')}]</span>}
              </Button>
            </div>
          ))}
          {!commands.length && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
        </div>
        <div className='pd1t'>↑ / ↓ · Enter · Esc</div>
      </div>
    </Modal>
  )
})
