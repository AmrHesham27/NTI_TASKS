const { redirect } = require('express/lib/response')
const dbConnection = require('../../models/dbcon')
const ValiadtorController = require("./validator.controller")
const { ObjectId } = require('mongodb');

class User {
    static showAll = (req, res) => {
        dbConnection((err, client, db) => {
            db.collection('data').find().toArray((error, result) => {
                if (error) return redirect('/err')
                const data = result
                const isEmpty = data.length == 0
                client.close()
                res.render("all", { pageTitle: "All Users", data, isEmpty })
            })
        })
    }

    static checkForm = (user) => {
        let errors = {}
        if (!ValiadtorController.isEmptyString(user.name))
            errors.name = "name is required"
        if (!ValiadtorController.isPositiveNumber(user.age))
            errors.age = "enter a valid number"
        if (!ValiadtorController.isValidEmail(user.email))
            errors.email = "enter a valid mail"
        if (!ValiadtorController.isEmptyString(user.address))
            errors.address = "enter a valid address"
        if (!ValiadtorController.isPositiveNumber(user.balance))
        errors.balance = "enter a valid initial balance"
        return errors
    }

    static addUserPost = (req, res) => {
        const user = { name: "", email: "", age: "", address: "", balance:"" }
        res.render("addPost", { pageTitle: "add new user(post)", user, errors: {} })
    }

    static addUserLogic = (req, res) => {
        let user = {...req.body, balance:+req.body.balance, transactions:[] }
        let errors = this.checkForm(user)
        if (Object.keys(errors).length > 0)
            return res.render('addPost', {
                pageTitle: "add new user",
                errors,
                user
            })
        
        dbConnection((err, client, db) => {
            db.collection('data').insertOne(user,(error, result)=>{
            if(err || error) return res.redirect("/err")
            client.close()
            res.redirect("/")
        })
    })
    }

    static addTrans = (req, res) => {
        const _id = req.params.id
        dbConnection((err, client, db) => {
            db.collection('data').findOne({_id: new ObjectId(_id)}, (error, result) => {
                if(err || error) return res.redirect("/err")
                res.render("deposit", {
                    pageTitle: "Add Transaction",
                    user: result
                })
                client.close();
            })
        })
    }

    static addTransLogic = (req, res) => {
        const _id = req.params.id
        const user = req.body
        const newTrans = {
            amount :+req.body.amount,
            type: req.body.transaction, 
            id: Date.now()
        }
        const amount = user.transaction == 'deposit'? +newTrans.amount : -newTrans.amount
        let newBalance = +user['balance'] + amount
        let errors = {}
        if (!ValiadtorController.isPositiveNumber(newTrans.amount))
            errors.balance = "enter a valid number"
        if (user.transaction == 'withdraw' && newBalance < 0)
            errors.balance = "balance is low"
        if (Object.keys(errors).length > 0)
            return res.render("deposit", {
                pageTitle: "Add Transaction",
                user,
                errors
            })
        dbConnection((err, client, db) => {
            if(err) return res.redirect("/err")
            db.collection('data').updateOne({_id: new ObjectId(_id)}, { 
                $push: { transactions: newTrans },
                $inc: { balance: amount } 
            })
            .then( () => {
                client.close()
                res.render("deposit", {
                    pageTitle: "Add Transaction",
                    user : {
                        ...user,
                        balance: newBalance
                    }
                })
            })
            .catch( e => {
                console.log(e.message)
                client.close()
                res.redirect('/err')
            })
        })
    }

    static singleUser = (req, res) => {
        const _id = req.params.id
        let isNotFound = false;
        let noTrans = false
        dbConnection((err, client, db) => {
            db.collection('data').findOne({_id: new ObjectId(_id)}, (error, result) => {
                if(err || error) return res.redirect("/err")
                if (!result) isNotFound = true;
                if (result['transactions'].length == 0){ noTrans = true }
                res.render("single", {
                    pageTitle: "User Details",
                    user: result,
                    isNotFound,
                    noTrans
                })
                client.close();
            })
        })
    }

    static editUser = (req, res) => {
        const _id = req.params.id;
        let isNotFound = false;
        dbConnection((err, client, db) => {
            db.collection('data').findOne({_id: new ObjectId(_id)}, (error, result) => {
                if(err || error) return res.redirect('/err')
                if (!result) isNotFound = true;
                res.render("edit", {
                    pageTitle: "User Details",
                    user: result,
                    isNotFound
                })
                client.close();
            })
        })
    }

    static editUserLogic = (req, res) => {
        const _id = req.params.id
        const newUser = req.body
        let errors = this.checkForm(newUser)
        if (Object.keys(errors).length > 0)
            return res.render('edit', {
                pageTitle: "User Details",
                errors,
                user: newUser
            })
        dbConnection((err, client, db) => {
            if(err) return res.redirect('/err')
            db.collection('data').updateOne({_id: new ObjectId(_id)}, { $set: newUser })
            .then( () => {
                client.close()
                res.redirect('/')
            })
            .catch( e => {
                console.log(e.message)
                client.close()
                res.redirect('/err')
            })
        })
    }

    static deleteUser = (req, res) => {
        const _id = req.params.id
        dbConnection((err, client, db) => {
            if(err) return res.redirect('/err')
            db.collection('data').deleteOne( {_id: new ObjectId(_id)} )
            .then(() => {
                client.close()
                res.redirect('/')
            })
            .catch(e => {
                client.close()
                res.redirect('/err')
            })
        })
    }
}

module.exports = User