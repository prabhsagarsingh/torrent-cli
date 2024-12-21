import tracker from "./tracker.js";

const torrent_downloader = {
    download : (torrent,path)=> {
        tracker.getPeers(torrent, ()=> {

        })        
    }
}

export default torrent_downloader;