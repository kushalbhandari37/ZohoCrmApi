const contactController = require('../../Controller/Contact/contactController');

module.exports = (router) => {
    //contact route
    router.get('/contacts',contactController.getAllContacts);
}
