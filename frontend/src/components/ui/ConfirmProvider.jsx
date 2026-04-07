import { createContext, useCallback, useContext, useState } from 'react'
import Modal from './Modal.jsx'
import Button from './Button.jsx'

const ConfirmContext = createContext(null)

export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null) // { title, message, confirmText, cancelText, danger, resolve }

  const confirm = useCallback((opts) => {
    return new Promise((resolve) => {
      setState({
        title: 'Are you sure?',
        message: '',
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        danger: false,
        ...(typeof opts === 'string' ? { message: opts } : opts),
        resolve,
      })
    })
  }, [])

  const handle = (value) => {
    state?.resolve(value)
    setState(null)
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state && (
        <Modal
          title={state.title}
          size="sm"
          onClose={() => handle(false)}
          footer={
            <>
              <Button variant="ghost" onClick={() => handle(false)}>
                {state.cancelText}
              </Button>
              <Button
                variant={state.danger ? 'danger-solid' : 'primary'}
                onClick={() => handle(true)}
              >
                {state.confirmText}
              </Button>
            </>
          }
        >
          <p className="text-sm text-slate-600 whitespace-pre-line">{state.message}</p>
        </Modal>
      )}
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext)
  if (!ctx) throw new Error('useConfirm must be used inside <ConfirmProvider>')
  return ctx
}
