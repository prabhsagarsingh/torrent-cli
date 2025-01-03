import torrent_parser from "./torrent_parser.js";

class Queue {
    constructor(torrent) {
        this._torrent = torrent;
        this._queue = [];
        this.choked = true;
    }

    queue(pieceIndex) {
        const nBlocks = torrent_parser.blocksPerPiece(this._torrent, pieceIndex);
        for (let i = 0; i < nBlocks; i++) {
            const pieceBlock = {
                index: pieceIndex,
                begin: i * torrent_parser.BLOCK_LEN,
                length: this._blockLen(i)
            };
            this._queue.push(pieceBlock);
        }
    }

    deque() {
        return this._queue.shift();
    }

    peek() {
        return this._queue[0];
    }

    length() {
        return this._queue.length;
    }
}

export default Queue;

