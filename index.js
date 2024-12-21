'use strict'

import torrentParser from './src/torrent_parser.js';
import torrent_downloader from './src/torrent_downloader.js';
import debug from 'debug';

const torrent = torrentParser.open(process.argv[2]);

// console.log("This is the parsed torrent file", JSON.stringify(torrent.info.files));

console.log(torrentParser.size(torrent));


// torrent_downloader.download(torrent,torrent.info.name);