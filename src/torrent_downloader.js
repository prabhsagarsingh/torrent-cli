import Peices from "./pieces.js";
import tracker from "./tracker.js";

const torrent_downloader = {
    download : (torrent,path)=> {
        tracker.getPeers(torrent, (peers)=> {
            const pieces = new Peices(torrent);
        })        
    }
}

export default torrent_downloader;