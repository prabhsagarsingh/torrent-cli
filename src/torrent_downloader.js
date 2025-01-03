import Peices from "./pieces.js";
import tracker from "./tracker.js";
import messageBuilder from "./message_builder.js";
import Queue from "./Queue.js";
import fs from "fs";
import net from "net";

const localHelper = {
    _download: function (peer, torrent, pieces, file)  {
        const socket = new net.Socket();
        socket.on('error', console.log);
        socket.connect(peer.port, peer.ip, () => {
            socket.write(messageBuilder.buildHandshake(torrent));
        })
        const queue = new Queue(torrent);
        this._onWholeMsg(socket, msg => this._msgHandler(msg, socket, pieces, queue, torrent, file));
    },

    _onWholeMsg: (socket, callback) => {
        let savedBuf = Buffer.alloc(0);
        let handshake = true;

        socket.on('data', recvBuf => {
            const msgLen = () => handshake ? savedBuf.readUInt8(0) + 49 : savedBuf.readInt32BE(0) + 4;
            savedBuf = Buffer.concat([savedBuf, recvBuf]);

            while (savedBuf.length >= 4 && savedBuf.length >= msgLen()) {
                callback(savedBuf.slice(0, msgLen()));
                savedBuf = savedBuf.slice(msgLen());
                handshake = false;
            }
        });
    },

    _msgHandler: function (msg, socket, pieces, queue, torrent, file) {
        if (this._isHandshake(msg)) {
            console.log("handshake done");
            socket.write(message.buildInterested());
        } else {
            const m = message.parse(msg);

            if (m.id === 0) this._chokedHandler(socket);
            if (m.id === 1) this._unchokeHandler(socket, pieces, queue);
            if (m.id === 4) this._haveHandler(socket, pieces, queue, m.payload);
            if (m.id === 5) this._bitfieldHandler(socket, pieces, queue, m.payload);
            if (m.id === 7) this._pieceHandler(socket, pieces, queue, torrent, file, m.payload);
        }
    },
    
    _isHandshake: msg => {
        return msg.length === msg.readUInt8(0) + 49 && msg.toString('utf8', 1, 20) === 'BitTorrent protocol';
    },

    _chokedHandler: socket => {
        socket.end();
    },

    _unchokeHandler: (socket, pieces, queue) => {
        queue.choked = false;
        requestPiece(socket, pieces, queue);
    },

    _haveHandler: (socket, pieces, queue, payload) => {
        const pieceIndex = payload.readUInt32BE(0);
        const queueEmpty = queue.length() === 0;
        queue.queue(pieceIndex);
        if (queueEmpty) requestPiece(socket, pieces, queue);
    },

    _bitfieldHandler: (socket, pieces, queue, payload) => {
        const queueEmpty = queue.length() === 0;
        payload.forEach((byte, i) => {
            for (let j = 0; j < 8; j++) {
                if (byte % 2) queue.queue(i * 8 + 7 - j);
                byte = Math.floor(byte / 2);
            }
        });
        if (queueEmpty) requestPiece(socket, pieces, queue);
    },

    _pieceHandler: (socket, pieces, queue, torrent, file, pieceResp) => {
        pieces.addReceived(pieceResp);
        file.write(pieceResp.block, null, null, 'binary');
        if (pieces.isDone()) {
            socket.end();
            console.log('torrent donwloaded');
        } else {
            requestPiece(socket, pieces, queue);
        }
    },

    _requestPiece: (socket, pieces, queue) => {
        if (queue.choked) return null;

        while (queue.length()) {
            const pieceBlock = queue.deque();
            if (pieces.needed(pieceBlock)) {
                socket.write(messageBuilder.buildRequest(pieceBlock));
                pieces.addRequested(pieceBlock);
                break;
            }
        }
    },
}

const torrent_downloader = {
    download : (torrent,path)=> {
        tracker.getPeers(torrent, (peers)=> {
            console.log(peers);
            const pieces = new Peices(torrent);
            const file = fs.openSync(path, 'w');
            peers.forEach(peer => {
                localHelper._download(peer, torrent, pieces, file);
            })        
        });
    }
}

export default torrent_downloader;