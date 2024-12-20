import fs from 'fs';
import bencode from 'bencode';

const torrent_parser = {
    open : (filePath) => {
        return bencode.decode(fs.readFileSync(filePath));
    }
}

export default torrent_parser;