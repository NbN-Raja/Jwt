const { PrismaClient } = require('@prisma/client');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = new PrismaClient();
const ApiResponse = require("../helpers/APIResponse");

// Register user
exports.post = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        // Check if username already exists
        const existingUsername = await prisma.users.findUnique({
            where: {
                username: username
            }
        });

        if (existingUsername) {
            return res.status(400).json(new ApiResponse(400, null, "User with Username already exists"));
        }
        // Check if email already exists
        const existingEmail = await prisma.users.findUnique({
            where: {
                email: email
            }
        });
        if (existingEmail) {
            return res.status(400).json(new ApiResponse(400, null, "User with Email already exists"));
        }
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const createUser = await prisma.users.create({
            data: {
                email: email,
                password: hashedPassword,
                role: role,
                username: username
            }
        });
        const refreshToken = jwt.sign({ id: createUser.id }, process.env.JWT_REFRESH, { expiresIn: "1y" });

         await prisma.users.update({
            where:{
                id:createUser.id
            },
            data:{
                refreshToken:refreshToken
            }
        })

        return res.status(201).json(new ApiResponse(201, createUser, "User created successfully"));
    } catch (error) {
        return res.status(500).json({
            message: "Internal Server Error",
            error: error ? error.message : "Unknown error"
        });
    }
}

exports.get = async (req, res) => {
    res.send("GET request received");
}


exports.login= async(req,res)=>{

    const {email,password}= req.body;

    const data= await prisma.users.findFirst({
        where: { email: email }

    })

    if(!data){
        res.status(400).json(new ApiResponse(400, null, "Invalida credentials"))
    }

    const isMatch= await bcrypt.compare(password,data.password)
    if(!isMatch){
        res.status(400).json(new ApiResponse(400, null, "Invalida credentials"))
    }

    const accessToken= jwt.sign({id:data.id,role:data.role},process.env.JWT_ACCESS,{
        expiresIn: "1h"
    })

    const refreshToken= await prisma.users.findFirst({
        where:{
            id:data.id
        },
        select:{
            refreshToken:true
        }
    }) 

    res.status(200).json(new ApiResponse(200, {accessToken,refreshToken}, "User Login successfully"))
   

}


// reset

exports.reset=async(req,res)=>{

    try {
        const {email,password,newpassword}= req.body

    const isValidEmail= await prisma.users.findFirst({
        where:{
            email:email
        }

    })
    // if email not found
    if(!isValidEmail){
       return res.status(400).send(new ApiResponse(400,null,"Email not found"))
    }

    const isPasswordValid= await bcrypt.compare(password, isValidEmail.password)

    if(!isPasswordValid){

       return res.status(400).send(new ApiResponse(400,null,"Password is not matched"))

    }
    // Now hashed Password 
    const hashPassword= await  bcrypt.hash(newpassword, 10)
    // now update password 
    const changePassword= await prisma.users.update({
        where:{
            email:email
        },
        data:{
            password:hashPassword
        }
    })

   return res.status(200).send(new ApiResponse(200,null,"Password changed successfully"))
    } catch (error) {
        console.log(error);
        res.status(500).json({message:error.message})
    }

}