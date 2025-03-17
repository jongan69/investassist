'use client'

import { useEffect, useState } from 'react'
import Pusher from 'pusher-js'
import { AnimatePresence } from 'framer-motion'
import { ConnectionStatus } from './ConnectionStatus'
import { TradeCard } from './TradeCard'
import { Trade } from '@/types/trades'

export function LiveTrades() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [status, setStatus] = useState<'connecting' | 'connected' | 'error' | 'disabled'>('connecting')

  useEffect(() => {
    // Check if Pusher is configured
    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER

    if (!pusherKey || !pusherCluster) {
      console.warn('Pusher is not configured. Live trades will be disabled.')
      setStatus('disabled')
      return
    }

    let pusher: Pusher | null = null
    let channel: any = null

    try {
      pusher = new Pusher(pusherKey, {
        cluster: pusherCluster,
        forceTLS: true,
        enabledTransports: ['ws', 'wss']
      })

      channel = pusher.subscribe('trades')

      channel.bind('new-trade', (trade: Trade) => {
        setTrades(prevTrades => [...prevTrades, trade]
          .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
          .slice(0, 15)
        )
      })

      pusher.connection.bind('connected', () => {
        console.log('Pusher connected successfully')
        setStatus('connected')
      })

      pusher.connection.bind('error', (error: any) => {
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
        if (channel) {
          channel.unbind_all()
          channel.unsubscribe()
        }
        if (pusher) {
          pusher.disconnect()
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
        <h2 className="text-lg font-bold">Live Trades</h2>
        <ConnectionStatus status={status} />
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
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
    </div>
  )
} 