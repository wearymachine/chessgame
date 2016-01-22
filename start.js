var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/boardgrid');

var server = require('./server');

mongoose.connection.once('open', function () {
    server.listen(3000, function () {
        console.log('All systems go on Port 3000!');
    });
});