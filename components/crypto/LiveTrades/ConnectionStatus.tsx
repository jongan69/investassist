interface ConnectionStatusProps {
    status: 'connecting' | 'connected' | 'error' | 'disabled'
  }
  
  export function ConnectionStatus({ status }: ConnectionStatusProps) {
    const statusConfig = {
      connecting: {
        dotClass: 'bg-yellow-500',
        textClass: 'text-yellow-500/90',
        text: 'Connecting...'
      },
      connected: {
        dotClass: 'bg-green-500',
        textClass: 'text-green-500/90',
        text: 'Live'
      },
      error: {
        dotClass: 'bg-red-500',
        textClass: 'text-red-500/90',
        text: 'Connection error'
      },
      disabled: {
        dotClass: 'bg-gray-500',
        textClass: 'text-gray-500/90',
        text: 'Disabled'
      }
    }
  
    const config = statusConfig[status]
  
    return (
      <div className="flex items-center gap-2 text-sm">
        <div className={`h-2 w-2 rounded-full ${config.dotClass} ${status === 'connecting' ? 'animate-pulse' : ''}`} />
        <span className={config.textClass}>{config.text}</span>
      </div>
    )
  } 