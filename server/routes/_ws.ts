import type { Peer, Message } from "crossws"
import { infrastructureStore } from "~/../server/utils/infrastructureStore"

const peers = new Set<Peer>()

export default defineWebSocketHandler({
    open(peer: Peer) {
        console.log("Client connected:", peer.id)
        peers.add(peer)
        // Send initial state to new client
        sendCurrentState(peer)
    },

    message(peer: Peer, message: Message) {
        try {
            const data = JSON.parse(message.text())
            console.log(`Received websocket message from ${peer}:`, message.text())

            switch (data.type) {
                case "status_update":
                    handleIncomingStatusUpdate(peer, data.payload)
                    break
                default:
                    console.log("Unknown message type:", data.type)
                    break
            }
        } catch (error) {
            console.error("Error parsing received message:", error)
            peer.send
        }
    },
    
    close(peer: Peer) {
        console.log("Client disconnected:", peer.id)
        peers.delete(peer)
    }
})

function handleIncomingStatusUpdate(sender: Peer, statusUpdate: any) {
    console.log(`Processing status update from client (${sender}): ${statusUpdate}`)
    let updateSuccessful = false

    if (statusUpdate.type === "Capability") {
        updateSuccessful = infrastructureStore.updateCapabilityStatus(statusUpdate)
    } else if (statusUpdate.type === "Server") {
        updateSuccessful = infrastructureStore.updateServerStatus(statusUpdate)
    }

    if (updateSuccessful) {
        const message = {
            type: "status_update",
            payload: statusUpdate
        }
        broadcastToOtherPeers(sender, message)
        console.log("Status update successfully processed and broadcasted")
    } else {
        try {
            const errorMessage = {
                type: "error",
                payload: {
                    message: "Failed to update status",
                    originalUpdate: statusUpdate
                }
            }
            sender.send(JSON.stringify(errorMessage))
        } catch (error) {
            console.error("Could not send error message:", error)
        }
    }
}

function sendCurrentState(peer: Peer) {
    try {
        const currentState = infrastructureStore.getCurrentState()
        const message = {
            type: "current_state",
            payload: currentState
        }
        peer.send(JSON.stringify(message))
        console.log("Sent current state to client:", peer.id)
    } catch (error) {
        console.error("Error sending current state to client:", error)
    }
}

function broadcastToOtherPeers(sender: Peer, message: any) {
    const messageJSON = JSON.stringify(message)

    for (const peer of peers) {
        if (peer === sender) continue

        try {
            peer.send(messageJSON)
        } catch (error) {
            console.log("Error sending message to peer:", error)
            peers.delete(peer)
        }
    }
}