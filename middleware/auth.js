// All API calls must be authenticated (static API tokens)

const jwt = require("jsonwebtoken");
const SECRET = process.env.SECRET;

const authentication = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const payload = jwt.decode(token, SECRET);
        req.user = payload;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

module.exports = authentication;