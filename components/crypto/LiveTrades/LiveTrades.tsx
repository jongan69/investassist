'use client'

import { useEffect, useState, useRef } from 'react'
import Pusher from 'pusher-js'
import { AnimatePresence } from 'framer-motion'
import * as ScrollArea from '@radix-ui/react-scroll-area'
import { ConnectionStatus } from './ConnectionStatus'
import { TradeCard } from './TradeCard'
import { Trade } from '@/types/trades'

export function LiveTrades() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [status, setStatus] = useState<'connecting' | 'connected' | 'error' | 'disabled'>('connecting')
  const pusherRef = useRef<Pusher | null>(null)
  const channelRef = useRef<any>(null)

  useEffect(() => {
    // Check if Pusher is configured
    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER

    if (!pusherKey || !pusherCluster) {
      console.warn('Pusher is not configured. Live trades will be disabled.')
      setStatus('disabled')
      return
    }

    try {
      // Clean up existing connection if any
      if (pusherRef.current) {
        pusherRef.current.disconnect()
      }

      // Create new Pusher instance
      pusherRef.current = new Pusher(pusherKey, {
        cluster: pusherCluster,
        forceTLS: true,
        enabledTransports: ['ws', 'wss']
      })

      // Subscribe to channel
      channelRef.current = pusherRef.current.subscribe('trades')

      // Bind to events
      channelRef.current.bind('new-trade', (trade: Trade) => {
        setTrades(prevTrades => [...prevTrades, trade]
          .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
          .slice(0, 15)
        )
      })

      // Handle connection events
      pusherRef.current.connection.bind('connected', () => {
        console.log('Pusher connected successfully')
        setStatus('connected')
      })

      pusherRef.current.connection.bind('error', (error: any) => {
        console.error('Pusher connection error:', error)
        setStatus('error')
      })

      // Clean up old trades periodically
      const cleanupInterval = setInterval(() => {
        const fiveMinutesAgo = Date.now() - (5 * 60 * 1000)
        setTrades(prevTrades => prevTrades.filter(trade => 
          (trade.timestamp || 0) > fiveMinutesAgo
        ))
      }, 1000)

      return () => {
        if (channelRef.current) {
          channelRef.current.unbind_all()
          channelRef.current.unsubscribe()
        }
        if (pusherRef.current) {
          pusherRef.current.disconnect()
        }
        clearInterval(cleanupInterval)
      }
    } catch (error) {
      console.error('Error initializing Pusher:', error)
      setStatus('error')
    }
  }, [])

  return (
    <div className="rounded border bg-card p-4 shadow-md flex flex-col w-full mt-10">
      <div className="flex justify-between items-center mb-4">
        <ConnectionStatus status={status} />
      </div>
      
      <ScrollArea.Root className="h-[400px] overflow-hidden rounded">
        <ScrollArea.Viewport className="h-full w-full rounded">
          <div className="space-y-3 pr-2">
            {status === 'disabled' ? (
              <div className="text-center py-4 text-gray-500">
                <p className="text-sm">Live trades are currently disabled</p>
              </div>
            ) : (
              <>
                <AnimatePresence initial={false}>
                  {trades.slice(0, 15).map((trade) => (
                    <TradeCard key={trade.signature} trade={trade} />
                  ))}
                </AnimatePresence>
                
                {trades.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    <p className="text-sm">Waiting for trades...</p>
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar
          className="flex touch-none select-none bg-blackA3 p-0.5 transition-colors duration-[160ms] ease-out hover:bg-blackA5 data-[orientation=horizontal]:h-2.5 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col"
          orientation="vertical"
        >
          <ScrollArea.Thumb className="relative flex-1 rounded-[10px] bg-mauve10 before:absolute before:left-1/2 before:top-1/2 before:size-full before:min-h-11 before:min-w-11 before:-translate-x-1/2 before:-translate-y-1/2" />
        </ScrollArea.Scrollbar>
        <ScrollArea.Corner className="bg-blackA5" />
      </ScrollArea.Root>
    </div>
  )
} 