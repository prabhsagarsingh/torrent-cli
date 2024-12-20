'use strict'

import torrentParser from './src/torrent_parser.js';


const torrent = torrentParser.open(process.argv[2]);
