import torrent_parser from "./torrent_parser.js";

export default class Peices {
    constructor(torrent) {
        function buildPiecesArray() {
            const nPieces = torrent.info.pieces.length / 20;
            const arr = new Array(nPieces).fill(null);
            return arr.map((_,i)=> new Array(torrent_parser.blocksPerPiece(torrent,i)).fill(false));
        }

        this._requested = buildPiecesArray();
        this._received = buildPiecesArray();
        console.log("This is array ",this._requested.length);
        console.log("This is the array blocks", this._requested[0].length)
    }
}