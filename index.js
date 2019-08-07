const express = require('express');
const app = express();                              // 初始化express
const http = require('http').Server(app);           // 创建个Http服务器
const io = require('socket.io')(http);              // 将Http服务注入到io中
const path = require('path');                       // 做路径处理


app.use(express.static(path.join(__dirname+ '/public')))            // app使用express的一个方法指定静态资源路径为public

app.get('/', function(req, res){
    res.sendFile(path.join(__dirname+ '/public/index.html'))           // 将该路径发送到请求的地址中
})

//  保存登录的在线用户
const onlineUsers = {};
//  用户数量
let onlineCount = 0;

// 监听链接
io.on('connection', socket => {
    socket.on('login', res=>{
        // console.log('登录')
        // console.log(res)
        socket.uid = res.uId;       // 登录的时候自定义添加个uid

        onlineUsers[res.uId] = res.userName;
        onlineCount++;
        // 将登录的在线用户，人数， 当前用户发给前台
        io.emit('login', {
            onlineUsers,
            onlineCount,
            user:res
        })
    });
    // 监听用户退出
    socket.on('disconnect', res => {
        // 组合一个用户数据，用来发送给前端
        const user = {
            uid:socket.uid,
            userName:onlineUsers[socket.uid]
        };
        delete onlineUsers[socket.uid];         // 删除该用户登录信息
        onlineCount--;
        io.emit('logout', {
            onlineUsers,
            onlineCount,
            user:user
        });
        console.log(`${user.userName}退出了`)
    })
    // 监听客户端发送过来的数据
    socket.on('message', res=> {
        // 发送过来消息，进行广播
        // console.log(res);
        // io.emit('message', res)      // 废弃
        // 只会向除了自己的其他用户发送消息
        socket.broadcast.emit('message', res);
    })
})      


http.listen(2000, function(){
    console.log('服务开启成功')
});