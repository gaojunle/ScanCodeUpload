/**
 * Created by gaojun-pd on 2017/4/25.
 */
var express = require('express');
var router = express.Router();

router.ws('/echo', function (ws, req) {
    console.log(12233)
    ws.on('message', function (msg) {
        ws.send(msg);
    });
});

router.get('/ws', function (socket) {
    socket.emit('news', {hello: 'world'});
    socket.on('echo', function (data) {
        console.log(data);
    });
});

module.exports = router;