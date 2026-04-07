import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/api.js'

export function useRooms({ onUnauthorized } = {}) {
  const [rooms, setRooms] = useState([])
  const [activeRoom, setActiveRoom] = useState(null)

  const loadRooms = useCallback(
    (selectId) => {
      api
        .rooms()
        .then((r) => {
          setRooms(r)
          setActiveRoom((current) => {
            if (selectId) return selectId
            if (current) return current
            return r[0]?.id ?? null
          })
        })
        .catch((err) => {
          if (err.message === 'Unauthorized') onUnauthorized?.()
        })
    },
    [onUnauthorized],
  )

  useEffect(() => {
    loadRooms()
  }, [loadRooms])

  const activeRoomObj = rooms.find((r) => r.id === activeRoom) || null

  return { rooms, activeRoom, activeRoomObj, setActiveRoom, loadRooms }
}
