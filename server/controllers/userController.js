const asyncHandler = require("express-async-handler");
const db = require("../configs/db");
const bcrypt = require("bcryptjs");
const generateToken = require("../configs/generateToken");
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password,pic } = req.body;
    if (!name || !email || !password) {
        res.status(400);
        throw new Error("Please Enter all the Feilds");
    }

    const userExists = await db.user.findUnique({
        where: {
            email: email
        }
    })
    if (userExists) {
        res.status(400);
        throw new Error("User already exists");
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await db.user.create({
        data: {
            name,
            email,
            password:hashedPassword,
            pic
        }
    });

    if (user) {
        return res.status(201).json({
            id: user.id,
            name: user.name,
            email: user.email,
            pic: user.pic,
            token: generateToken(user.id)
        });
    } else {
        res.status(400);
        throw new Error("Failed to create the user");
        
    }
})

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await db.user.findUnique({
        where: {
            email: email
        }
    })
    if (user && (await bcrypt.compare(password, user.password))) {
        return res.status(201).json({
            id: user.id,
            name: user.name,
            email: user.email,
            pic: user.pic,
            token: generateToken(user.id)
        });
    } else {
        res.status(400);
        throw new Error("Invalid Credentials");
    }
})

const allUsers = asyncHandler(async (req, res) => {
    const keyword = req.query.search

    const users = await db.user.findMany({
        where:{
            name:{
                contains: keyword ? keyword : "",
                mode: "insensitive"
            }
        }
    });
    res.status(200).json(users);
})
module.exports = { registerUser,loginUser,allUsers }