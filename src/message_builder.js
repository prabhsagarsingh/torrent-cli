import { Buffer } from "buffer";
import torrent_parser from "./torrent_parser.js";
import torrent_utils from "./torrent_utils.js";

let messageBuilder = {
    buildHandshake : (torrent) => {
        const buff = Buffer.alloc(68);
        // pstrlen
        buff.writeUInt8(19, 0);
        // pstr
        buff.write("BitTorrent protocol", 1);
        // reserved
        buff.writeUInt32BE(0, 20);
        buff.writeUInt32BE(0, 24);
        // info hash
        torrent_parser.infoHash(torrent).copy(buff, 28);
        // peer id
        torrent_utils.generateId().copy(buff, 48);
        return buff;
    }
}

export default messageBuilder;  