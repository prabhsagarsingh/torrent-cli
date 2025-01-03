import dgram from 'dgram';
import { Buffer } from 'buffer';
import {parse} from 'url';
import crypto from 'crypto';
import torrent_parser from './torrent_parser.js';
import debug from 'debug';
import torrent_utils from './torrent_utils.js';

const helperFunc = {
    _updSend : (socket,message,rawUrl,callback = ()=>{}) => {
        const url = parse(rawUrl);
        socket.send(message,0,message.length,url.port,url.hostname,callback);
    },

    _buildConnReq : ()=> {
        const buf = Buffer.allocUnsafe(16);

        // connection id
        buf.writeUInt32BE(0x417, 0);
        buf.writeUInt32BE(0x27101980, 4);

        // action,
        buf.writeUInt32BE(0, 8);
        // transaction id
        crypto.randomBytes(4).copy(buf, 12);

        return buf;
    },

    _parseConnResp: (response)=>{
        return {
            action : response.readUInt32BE(0),
            transactionId: response.readUInt32BE(4),
            connectionId: response.slice(8)
        }
    },

    _announceReq: (connId,torrent,port=6881)=> {
        const buff = Buffer.allocUnsafe(98);
        
        // connectionid
        connId.copy(buff,0)
        // action 
        buff.writeUint32BE(1,8);
        // transaction id 
        crypto.randomBytes(4).copy(buff,12);
        // info hash 
        torrent_parser.infoHash(torrent).copy(buff,16);
        //peerId
        torrent_utils.genId().copy(buff, 36);
        // downloaded  
        Buffer.alloc(8).copy(buff,56);
        //left 
        torrent_parser.size(torrent).copy(buff,64);
        //uploaded 
        Buffer.alloc(8).copy(buff,72);
        //event 
        buff.writeUInt32BE(0,80);
        // ip address 
        buff.writeUInt32BE(0,84);
        // key 
        crypto.randomBytes(4).copy(buff,88);
        //num want 
        buff.writeInt32BE(-1,92);
        //port 
        buff.writeUInt16BE(port, 96);

        return buff;
    },

    _parseAnnounceResp: (resp) => {
        function _group(iterable,groupSize) {
            let groups = [];
            for (let i=0; i<iterable.length; i+=groupSize) {
                groups.push(iterable.slice(i,i+groupSize));
            }
            return groups;
        }

        return {
            action: resp.readUInt32BE(0),
            transactionId: resp.readUInt32BE(4),
            leechers: resp.readUInt32BE(8),
            seeders: resp.readUInt32BE(12),
            peers: _group(resp.slice(20),6).map(address=>{
                return {
                    ip: address.slice(0,4).join("."),
                    port: address.readUInt16BE(4)
                }
            })
        }  
    },

    _respType : (resp) => {
        const action = resp.readUInt32BE(0);
        if (action==0) return 'connect';
        if (action==1) return 'announce';
        if (action==2) return "error";
    }
}

const tracker = {
    getPeers: (torrent,cb) => {
        const socket = dgram.createSocket('udp4');
        const url = Buffer.from(torrent.announce).toString('utf-8');
        
        helperFunc._updSend(socket,helperFunc._buildConnReq(),url);

        socket.on("message", response => {
            if (helperFunc._respType(response)=="connect") {
                console.log("connect response");
                const connResp = helperFunc._parseConnResp(response);

                const announceReq =  helperFunc._announceReq(connResp.connectionId,torrent);              
                helperFunc._updSend(socket,announceReq,url);
            }
            else if (helperFunc._respType(response)=="announce") {
                console.log("announce response");
                const announceResp = helperFunc._parseAnnounceResp(response);
                cb(announceResp.peers);
            } 
            else if (helperFunc._respType(response)=="error") {
                const buff = Buffer.from(response);
                const errorMsg = buff.subarray(8).toString('utf8');
                console.error("Tracker Error:", errorMsg);
            }
        })
    }
}


export default tracker;