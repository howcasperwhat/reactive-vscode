import type { Ref } from '@reactive-vscode/reactivity'
import { onScopeDispose, ref } from '@reactive-vscode/reactivity'
import type { ExtensionTerminalOptions, Terminal, TerminalOptions } from 'vscode'
import { window } from 'vscode'

interface UseControlledTerminalReturn {
  terminal: Ref<Terminal | null>
  getIsActive: () => boolean
  show: () => void
  sendText: (text: string) => void
  close: () => void
}

/**
 * Create terminal, and allows you to control the terminal lifecycle.
 *
 * @category terminal
 */
export function useControlledTerminal(name?: string, shellPath?: string, shellArgs?: readonly string[] | string): UseControlledTerminalReturn
export function useControlledTerminal(options: TerminalOptions): UseControlledTerminalReturn
export function useControlledTerminal(options: ExtensionTerminalOptions): UseControlledTerminalReturn
export function useControlledTerminal(...args: any[]): UseControlledTerminalReturn {
  const terminal = ref<Terminal | null>(null)

  function getIsActive() {
    return !!terminal.value && terminal.value.exitStatus == null
  }

  function ensureTerminal() {
    if (getIsActive())
      return terminal.value!
    return terminal.value = window.createTerminal(...args)
  }

  async function sendText(text: string) {
    ensureTerminal().sendText(text)
  }

  async function show() {
    ensureTerminal().show()
  }

  function close() {
    if (getIsActive()) {
      terminal.value!.sendText('\x03')
      terminal.value!.dispose()
      terminal.value = null
    }
  }

  onScopeDispose(close)

  return {
    terminal,
    getIsActive,
    show,
    sendText,
    close,
  }
}
