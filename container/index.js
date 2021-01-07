require("dotenv").config();
const app = require("./app");
const PORT = process.env.PORT;

const server = app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});

const redis = require("socket.io-redis");

const listen = require("socket.io");
const io = listen(server);
io.adapter(redis({ host: "redis", port: 6379 }));

let count = 1;

io.sockets.on("connection", function (socket) {
  const name = "익명" + count++;
  io.to(socket.id).emit("new", name);

  socket.on("disconnect", function () {
    console.log("user disconnected: ", socket.id);
  });

  socket.on("leaveRoom", (room, name) => {
    socket.leave(room, () => {
      console.log(name + " leave a " + room);
      io.to(room).emit("leaveRoom", room, name);
    });
  });

  socket.on("joinRoom", (room, name) => {
    socket.join(room, () => {
      console.log(name + " join a " + room);
      io.to(room).emit("joinRoom", room, name);
    });
  });

  socket.on("send", (room, name, text) => {
    const msg = `${name} : ${text} `;

    io.to(room).emit("receive", msg);
  });
});
