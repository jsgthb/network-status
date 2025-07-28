import type { Peer, Message } from "crossws"

export default defineWebSocketHandler({
    open(peer: Peer) {
        console.log("Client connected:", peer.id)
    },
    message(peer: Peer, message: Message) {
        const data = JSON.parse(message.text())
        peer.send(JSON.stringify({ echo: data}))
    },
    close(peer: Peer) {
        console.log("Client disconnected:", peer.id)
    }
})