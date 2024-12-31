const Role = require("../model/Role");

// Create Role
exports.createRole = async (req, res) => {
    const { roleName, description, permissions } = req.body;
    try {
        const existingRole = await Role.findOne({ roleName });
        if (existingRole) {
            return res.status(400).json({ message: "Role already exists" });
        }

        const newRole = new Role({ roleName, description, permissions });
        await newRole.save();
        res.status(201).json({ message: "Role created successfully", role: newRole });
    } catch (error) {
        console.log("Error creating role", error);
        res.status(500).json({ message: "Failed to create role", error: error.message });
    }
};