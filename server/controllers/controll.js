const express = require("express")
const Admin = require("../model/Admin")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const Role = require("../model/role")
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key"

// Register Super Admin
exports.registerSuperAdmin = async (req, res) => {
    const { name, email, password } = req.body
    try {
        console.log(name, email, password)

        // Check if the super admin already exists
        const existingAdmin = await Admin.findOne({ role: "super-admin" })
        if (existingAdmin) {
            return res.status(400).json({ message: "Super admin already exists" })
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Create and save the new super admin
        const superAdmin = new Admin({
            name,
            email,
            password: hashedPassword,
            role: "super-admin"
        })
        
        await superAdmin.save()
        res.status(201).json({ message: "Super admin registered successfully" })
    } catch (error) {
        res.status(500).json({ message: "Registration failed", error: error.message })
    }
}

// Login Super Admin
exports.loginSuperAdmin = async (req, res) => {
    const { email, password } = req.body
    try {
        console.log(email,password);
        
        // Fetch super admin by role, ensure it's a string, not ObjectId
        const superAdmin = await Admin.findOne({ role: "super-admin" })

        if (!superAdmin) {
            return res.status(404).json({ message: "Super admin not found" })
        }

        // Check if email matches
        if (superAdmin.email !== email) {
            return res.status(401).json({ message: "Email does not match" })
        }

        // Compare the password
        const isPasswordValid = await bcrypt.compare(password, superAdmin.password)
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Password does not match" })
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: superAdmin._id, role: superAdmin.role },
            JWT_SECRET,
            { expiresIn: "1h" }
        )

        // Respond with token and role
        res.status(200).json({ message: "Login successful", token, role: superAdmin.role })
    } catch (error) {
        console.log(error, "Error during login")
        res.status(500).json({ message: "Login failed. Please try again later." })
    }
}


exports.createRole = async (req,res)=>{
    const { roleName, description, permissions } = req.body
    try {
        const existingRole = await Role.findOne({ roleName})
        if(existingRole){
            res.status(400).json({message: "this role already exists"})
        }

        const newRole = new Role({
            roleName,
            description,
            permissions
        });
        await newRole.save();
        res.status(201).json({message: "Role created successfully", role: newRole})
        
    } catch (error) {
        console.log("error in creating role", error)
        res.status(500).json({message: "Failed to create role", error: error.message})
        
    }
}


exports.createUser = async (req,res)=>{
    const {name,email,password,roleName} = req.body
    try {
        const role = await Role.findOne({roleName});
        if(!role){
            return res.status(404).json({message: "Role not found"})
        }
        const existingAdmin = await Admin.findOne({email});
        if(existingAdmin){
            return res.status(400).json({message: "Email already registered"})
        }

        const hashedPassword =  await bcrypt.hash(password,10);
        const newAdmin = new Admin({
            name,
            email,
            password: hashedPassword,
            role: role._id
        })
        await new newAdmin.save();
    } catch (error) {
        
    }
}