const expressAsyncHandler = require("express-async-handler");
const db = require("../configs/db");

const accessChat = expressAsyncHandler(async (req, res) => {
    const { userId } = req.body;
    if (!userId) {
        console.log("UserId param not sent with request");
        return res.sendStatus(400);
    }
    const isChat = await db.chat.findFirst({
        where: {
          users: {
            some: {
              id: req.user.id,
            },
          },
          AND: {
            users: {
              some: {
                id: userId,
              },
            },
          },
        },
        include: {
          users: {
            select: {
              id: true,
              name: true,
              email: true,
              pic: true,
              // Exclude password as Prisma doesn't fetch fields not included
            },
          },
          latestMessage: {
            include: {
              sender: {
                select: {
                  name: true,
                  pic: true,
                  email: true,
                },
              },
            },
          },
        },
    });
    let chatData = null;
    if(isChat){
        return res.send(isChat);
    }else{
         chatData = {
            chatName: "sender",
            users: {
              connect: [
                { id: req.user.id },
                { id: userId },
              ],
            },
          };
        try{
            const createdChat = await db.chat.create({
                data: chatData,
            });

            const fullChat = await db.chat.findUnique({
                where: {
                  id: createdChat.id,
                },
                include: {
                  users: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                      pic: true,
                      // Prisma doesn't fetch password unless explicitly included, so no need to exclude it
                    },
                  },
                },
              });
            res.status(200).json(fullChat);
        }catch{
            res.status(400);
            throw new Error(error.message);
        }
    }

})
const fetchChats = expressAsyncHandler(async (req, res) => {
    try {
        const results = await db.chat.findMany({
            where: {
              users: {
                some: {
                  id: req.user.id,  // Match the current user ID in the users relation
                },
              },
            },
            include: {
              users: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  pic: true,
                  // No need to exclude the password, since it's not selected
                },
              },
              
              latestMessage: {
                include: {
                  sender: {
                    select: {
                      name: true,
                      pic: true,
                      email: true,
                    },
                  },
                },
              },
            },
            orderBy: {
              updatedAt: 'desc',  // Sort by updatedAt in descending order
            },
          }); 
          res.status(200).send(results);
    } catch (error) {
        
    }
})

// const createGroupChat = expressAsyncHandler(async (req, res) => {
//     if (!req.body.users || !req.body.name) {
//         return res.status(400).send({ message: "Please Fill all the feilds" });
//     }
//     var users = req.body.users
//     console.log(users.length)
//     if (users.length < 1) {
//         return res
//           .status(400)
//           .send("More than 2 users are required to form a group chat");
//     }
//     users.push(req.user.id);

//     try {
//         const groupChat = await db.chat.create({
//             data: {
//               chatName: req.body.name,
//               isGroupChat: true,
//               users: {
//                 connect: users.map((userId) => ({ id: parseInt(userId) })),  // Connect the user IDs
//               },
//               groupAdmin: {
//                 connect: { id: parseInt(req.user.id) },  // Connect the group admin
//               },
//             },
//           });

//           const fullGroupChat = await db.chat.findUnique({
//             where: {
//               id: groupChat.id,
//             },
//             include: {
//               users: {
//                 select: {
//                   id: true,
//                   name: true,
//                   email: true,
//                   pic: true,
//                   // No need to exclude password in Prisma
//                 },
//               },
//               groupAdmin: {
//                 select: {
//                   id: true,
//                   name: true,
//                   email: true,
//                   pic: true,
//                 },
//               },
//             },
//           });
//           res.status(200).json(fullGroupChat);
//     } catch (error) {
//         res.status(400);
//         throw new Error(error.message);
//     }
// })
module.exports = {
    accessChat,fetchChats
}