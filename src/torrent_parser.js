import fs from 'fs';
import bencode from 'bencode';
import BigNum from 'bignum';
import crypto from 'crypto';


const torrent_parser = {
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
    }
}

export default torrent_parser;