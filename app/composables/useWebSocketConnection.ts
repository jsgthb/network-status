export const useWebSocketConnection = () => {
    const { status, data, send, open, close } = useWebSocket("/_ws", {
        immediate: false,
        onConnected: (ws) => {
            console.log("Websocket connected")
            const store = useInfrastructureStore()
            store.setConnectionStatus(true)
        },

        onDisconnected: () => {
            console.log("Websocket disconnected")
            const store = useInfrastructureStore()
            store.setConnectionStatus(false)
        },

        onError: (ws, error) => {
            console.error("Websocket error:", error)
            const store = useInfrastructureStore()
            store.setConnectionStatus(false)
        },

        onMessage: (ws, event) => {
            try {
                const parsedData = JSON.parse(event.data)
                console.log("Received websocket message:", parsedData)

                if (!parsedData.payload) {
                    console.warn("Received message without payload:", parsedData)
                    return
                }

                const store = useInfrastructureStore()

                switch (parsedData.type) {
                    case "current_state": {
                        store.initializeFromServerState(parsedData.payload)
                        break;
                    }
                    case "status_update": {
                        store.handleIncomingStatusUpdate(parsedData.payload)
                        break;
                    }
                    case "error": {
                        console.error("Received error from server:", parsedData.payload)
                        break;
                    }
                    default: {
                        console.warn("Unknown message type:", parsedData.type)
                        break;
                    }
                }
            } catch (error) {
                console.error("Error parsing websocket message:", error)
            }
        }
    })

    const sendMessage = (message: object) => {
        try {
            const jsonMessage = JSON.stringify(message)
            console.log("Sending websocket message:", message)
            send(jsonMessage)
        } catch (error) {
            console.error("Error sending websocket message:", error)
        }
    }

    const connect = () => {
        console.log("Connecting to websocket...")
        open()
    }

    const initializeStoreIntegration = () => {
        const store = useInfrastructureStore()
        store.setWebSocketSender(sendMessage)
    }

    return {
        status,
        connect,
        close,
        sendMessage,
        initializeStoreIntegration
    }
}