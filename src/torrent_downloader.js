import tracker from "./tracker.js";

const torrent_downloader = {
    download : (torrent,path)=> {
        tracker.getPeers(torrent, (peers)=> {
            console.log("Peers fetched for this file ", peers);        
        })        
    }
}

export default torrent_downloader;