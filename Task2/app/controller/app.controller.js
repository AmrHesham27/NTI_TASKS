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
        if (!ValiadtorController.isValidEmail(user.email))
            errors.email = "enter a valid mail"
        return errors
    }

    static addUserPost = (req, res) => {
        const user = { name: "", email: "", age: "", address: "" }
        res.render("addPost", { pageTitle: "add new user(post)", user, errors: {} })
    }

    static addUserLogic = (req, res) => {
        let user = req.body
        let errors = this.checkForm(user)
        if (Object.keys(errors).length > 0)
            return res.render('addPost', {
                pageTitle: "add new user",
                errors,
                user
            })
        dbConnection((err, client, db) => {
            db.collection('data').insertOne(user,(error, result)=>{
            if(err) return res.redirect("/err")
            client.close()
            res.redirect("/")
        })
    })
    }

    static singleUser = (req, res) => {
        const _id = req.params.id
        let isNotFound = false;
        dbConnection((err, client, db) => {
            db.collection('data').findOne({_id: new ObjectId(_id)}, (err, result) => {
                if(err) return res.redirect('/err');
                if (!result) isNotFound = true;
                res.render("single", {
                    pageTitle: "User Details",
                    user: result,
                    isNotFound
                })
                client.close();
            })
        })
    }

    static editUser = (req, res) => {
        const _id = req.params.id;
        let isNotFound = false;
        dbConnection((err, client, db) => {
            db.collection('data').findOne({_id: new ObjectId(_id)}, (err, result) => {
                if(err) return res.redirect('/err');
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
            db.collection('data').deleteOne( {_id: new ObjectId(_id)} )
            .then(() => {
                client.close()
                res.redirect('/')
            })
            .catch(e => {
                client.close()
                res.redirect('/err')
            })
           

            /* db.collection('data').deleteOne({_id: new ObjectId(_id)}, (err, result) => {
                if(err) return res.redirect('/err')
                client.close()
                res.redirect('/')
            }) */
        })
    }
}

module.exports = User