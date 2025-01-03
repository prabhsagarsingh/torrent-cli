import Peices from "./pieces.js";
import tracker from "./tracker.js";
import messageBuilder from "./message_builder.js";
import fs from "fs";
import net from "net";


const localHelper = {
    _download: function (peer, torrent, pieces, file)  {
        const socket = new net.Socket();
        socket.on('error', console.log);
        socket.connect(peer.port, peer.ip, () => {
            socket.write(messageBuilder.buildHandshake(torrent));
        })
        
    }
}

const torrent_downloader = {
    download : (torrent,path)=> {
        tracker.getPeers(torrent, (peers)=> {
            const pieces = new Peices(torrent);
            const file = fs.openSync(path, 'w');
            peers.forEach(peer => {
                localHelper._download(peer, torrent, pieces, file);
            });
        })        
    }
}

export default torrent_downloader;