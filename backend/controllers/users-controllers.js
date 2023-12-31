const HttpError = require('../models/http-error.js');
const User = require('../models/user.js');
const { validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');

const signup = async (req, res, next) => {
    // validate inputs
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(
            new HttpError('Invalid inputs passed, please check your data.', 422)
        );
    }
    
    const { user_name, email, password } = req.body;
    // check for existing user
    let existingUser;
    try {
        existingUser = await User.findOne({email: email});
    } catch {
        const error = new HttpError('Signing up failed, please try again later.', 500);
        return next(error);
    }
    
    if (existingUser) {
        let err = new HttpError('Could not create user, email already exists.', 422);
        try {
            throw err;
        }
        catch (err) {
            next(err);
        }
        return;
    }

    // create user
    const createdUser = new User({
        id: uuidv4(),
        user_name,
        email,
        password,
        heroes: [],
    });
    try {
        await createdUser.save();
    } catch (err) {
        throw new HttpError('Signing up failed, please try again.', 500);
    }

    res.status(201).json({user: createdUser.toObject({getters: true})});
}

const getUsers = async (req, res, next) => {
    let users;
    try {
        users = await User.find({})
    } catch (err) {
        const error = new HttpError("Fetching users failed please try again later.", 500);
        return next(error);
    }
    res.json({users: users.map(user => user.toObject({getters: true}))});
};

const login = async (req, res, next) => {
    const { email, password } = req.body;
    const user = await User.findOne({email: email});
    if (!user || user.password !== password) {
        let err = new HttpError('Could not find a user for the provided email or the password is wrong.', 404);
        try {
            throw err;
        }
        catch (err) {
            next(err);
        }
        return;
    }
    res.json({message: 'Logged in!'});
};

exports.signup = signup;
exports.login = login;
exports.getUsers = getUsers;