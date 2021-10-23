const Router = require('express').Router;
const contactRoute = require('./contactRoute/contactRoute');

module.exports = () =>{
    const router = Router();
    contactRoute(router);
    return router;
}