var express = require('express');
var router = express.Router();
var util = require('util');

var qr_image = require('qr-image'),
    uploadId = null,
    uploadedFlag = false,
    fileData = {
        uploadId: '',
        fileName: '',
        fileUrl: ''
    };

var formidable = require('formidable'),
    fs = require('fs'),
    TITLE = '上传示例',
    AVATAR_UPLOAD_FOLDER = '/avatar/';

router.get('/', function (req, res, next) {
    res.render('uploadfile', {title: TITLE});
});

/*生成二维码*/
router.get('/qrcode', function (req, res) {
    setTimeout(function () {
        uploadId = Math.random().toString(36).substr(2);
        sendMsg('uploadId', uploadId);
        fileData.uploadId = uploadId;
        var temp_qrcode = qr_image.image(req.headers.referer + 'upload?uploadId=' + uploadId);
        console.log(req.headers.referer + 'upload?uploadId=' + uploadId)
        res.type('png');

        temp_qrcode.pipe(res);
    }, 400)
});

/*监听是否文件上传完成长链接*/
router.get('/checkUploaded', function (req, res) {
    if (uploadedFlag) {
        res.send({
            errno: '0000',
            errmsg: '文件上传成功',
            data: fileData
        });
    } else {
        res.send({
            errno: '0001',
            errmsg: '暂无文件上传',
            data: {}
        });
    }
});
function sendMsg(msgId, msg) {
    global.msocket.emit(msgId, msg);
}
router.post('/fileupload', function (req, res, next) {
    var form = new formidable.IncomingForm();   //创建上传表单
    var post = {},
        file = {};

    form.encoding = 'utf-8';		//设置编辑
    form.uploadDir = 'public' + AVATAR_UPLOAD_FOLDER;	 //设置上传目录
    form.keepExtensions = true;	 //保留后缀
    form.maxFieldsSize = 20 * 1024 * 1024;   //文件大小

    form.parse(req, function (err, fields, files) {
        if (err) {
            res.locals.error = err;
            console.log(err);
            return;
        }

        var extName = '';  //后缀名
        /*文件上传ID不匹配*/
        if (fields.uploadId != uploadId) {
            console.log('no match')
            fs.unlinkSync(files.file.path);
            res.send({
                "jsonrpc": "2.0",
                "error": {"code": 102, "message": "失败，ID不匹配"},
                "id": "id"
            });
            return;
        }
        switch (fields.type) {
            case 'image/pjpeg':
                extName = 'jpg';
                break;
            case 'image/jpeg':
                extName = 'jpg';
                break;
            case 'image/png':
                extName = 'png';
                break;
            case 'image/x-png':
                extName = 'png';
                break;
        }

        if (extName.length == 0) {
            res.locals.error = '只支持png和jpg格式图片';
            return;
        }

        var avatarName = files.file.name + '.' + extName;
        var newPath = form.uploadDir + avatarName;

        fileData.fileName = avatarName;
        fileData.fileUrl = '/avatar/' + avatarName;

        sendMsg('fileData', fileData);

        fs.renameSync(files.file.path, newPath);  //重命名
        res.send({"jsonrpc": "2.0", data: JSON.stringify(fields)});
        return;
    });
});

module.exports = router;