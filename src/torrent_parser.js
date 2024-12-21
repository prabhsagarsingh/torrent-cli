import fs from 'fs';
import bencode from 'bencode';
import BigNum from 'bignum';
import crypto from 'crypto';


const torrent_parser = {
    BLOCK_LEN : Math.pow(2, 14),
    open : (filePath) => {
        return bencode.decode(fs.readFileSync(filePath));
    },
    
    size : (torrent) => {
        const size = torrent.info.files ?
            torrent.info.files.map(file=>file.length).reduce((a,b)=>a+b) : 
            torrent.info.length;
        return BigNum.toBuffer(size);        
    },

    infoHash: (torrent) => {
        const info = bencode.encode(torrent);
        return crypto.createHash('sha1').update(info).digest();
    },

    pieceLen: function (torrent,pieceIndex) {
        const totalLength = BigNum.fromBuffer(this.size(torrent)).toNumber();
        const pieceLength = torrent.info['piece length']

        const lastPieceLength = totalLength% pieceLength;
        const lastPieceIndex = Math.floor(totalLength/pieceLength);

        return lastPieceIndex === pieceIndex ? lastPieceLength : pieceLength;
    },

    blocksPerPiece: function (torrent,pieceIndex)  {
        const pieceLength = this.pieceLen(torrent, pieceIndex);
        return Math.ceil(pieceLength/this.BLOCK_LEN);
    }
}

export default torrent_parser;