import dgram from 'dgram';
import { Buffer } from 'buffer';
import {parse} from 'url';
import crypto from 'crypto';
import debug from 'debug';

const helperFunc = {
    _updSend : (socket,message,rawUrl,callback = ()=>{}) => {
        const url = parse(rawUrl);
        console.log("This is the raw url ",url)
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
            connectionId: response.readUInt32BE(8)
        }
    },

    _announceReq: (connId,torrent,port=6881)=> {
        const buff = Buffer.allocUnsafe(98);
        
        // connectionid
        connId.copy(buff,0);
        // action 
        buff.writeUint32BE(1,8);
        // transaction id 
        crypto.randomBytes(4).copy(buff,12);
        // info hash 
        
    },

    _respType : (resp) => {
        const action = resp.readUInt32BE(0);
        if (action==0) return 'connect';
        if (action==1) return 'announce';
    }
}

const tracker = {
    getPeers: (torrent,cb) => {
        const socket = dgram.createSocket('udp4');
        const url = Buffer.from(torrent.announce).toString('utf-8');
        console.log("This is the url ", url);    
        
        helperFunc._updSend(socket,helperFunc._buildConnReq(),url);

        socket.on("message", response=> {
            if (helperFunc._respType(response)=="connect") {
                const connResp = helperFunc._parseConnResp(response);

                const announceReq =  helperFunc._announceReq(connResp.connectionId,torrent);              
            }
        })
    }
}


export default tracker;