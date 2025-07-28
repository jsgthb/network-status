export const useWebSocketConnection = () => {
    const { status, data, send, open, close } = useWebSocket("/_ws", {
        immediate: false,
        onConnected: (ws) => {
            console.log("Websocket connected")
        },

        onDisconnected: () => {
            console.log("Websocket disconnected")
        },

        onError: (ws, error) => {
            console.error("Websocket error:", error)
        },

        onMessage: (ws, event) => {
            try {
                const parsedData = JSON.parse(event.data)
                console.log("Received message:", parsedData)
            } catch (error) {
                console.log("Raw message:", event.data)
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

    return {
        status,
        connect,
        close,
        sendMessage
    }
}