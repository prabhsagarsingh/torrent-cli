import fs from 'fs';
import bencode from 'bencode';

const torrent_parser = {
    open : (filePath) => {
        return bencode.decode(fs.readFileSync(filePath));
    },
    size : (torrent) => {
        const size = torrent.info.files ?
            torrent.info.files.map(file=>file.length).reduce((a,b)=>a+b) : 
            torrent.info.length;

        console.log(size);
    }
}

export default torrent_parser;