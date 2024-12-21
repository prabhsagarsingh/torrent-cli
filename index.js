'use strict'

import torrentParser from './src/torrent_parser.js';
import torrent_downloader from './src/torrent_downloader.js';
import debug from 'debug';
import torrent_utils from './src/torrent_utils.js';

const torrent = torrentParser.open(process.argv[2]);

torrent_downloader.download(torrent,torrent.info.name);
