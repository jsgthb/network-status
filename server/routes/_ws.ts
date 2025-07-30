import type { Peer, Message } from "crossws"

const peers = new Set<Peer>()

export default defineWebSocketHandler({
    open(peer: Peer) {
        console.log("Client connected:", peer.id)
        peers.add(peer)
    },

    message(peer: Peer, message: Message) {
        try {
            const data = JSON.parse(message.text())
            console.log(`Received websocket message from ${peer}:`, message.text())

            switch (data.type) {
                case "status_update":
                    console.log("Broadcasting status update to other peers")
                    broadcastToOtherPeers(peer, data)
                    break
                default:
                    console.log("No type defined, skipping")
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