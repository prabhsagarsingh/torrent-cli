import crypto from 'crypto';

let id = null;

const torrent_utils = {
    genId : ()=> {
        if (!id) {
            id = crypto.randomBytes(20);
            Buffer.from('-AT0001-').copy(id, 0);
        }
        return id;
    }
}

export default torrent_utils;