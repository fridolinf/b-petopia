const express = require('express');
const app = express();
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv/config');
const authJwt = require('./helpers/jwt');
const errorHandler = require('./helpers/error-handler');
const bodyParser = require("body-parser")

app.use(cors());
app.options('*', cors())
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));


//middleware
app.use(express.json())
app.use(morgan('tiny'));
app.use(authJwt());
app.use('/public/uploads', express.static(__dirname + '/public/uploads'));
app.use(errorHandler);

//Routes
const categoriesRoutes = require('./routers/categories');
const productsRoutes = require('./routers/products');
const usersRoutes = require('./routers/users');
const ordersRoutes = require('./routers/orders');
const marketsRoutes = require('./routers/markets');
const kelolaUserRoutes = require('./routers/admin/kelolauser');
const kelolaFaqRoutes = require('./routers/admin/kelolaFaq');
const artikelsRoutes = require('./routers/admin/artikels');
const ratingRoutes = require('./routers/ratings');
// server
const api = process.env.API_URL;

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

// user
app.use(`${api}/categories`, categoriesRoutes);
app.use(`${api}/products`, productsRoutes);
app.use(`${api}/users`, usersRoutes);
app.use(`${api}/orders`, ordersRoutes);
app.use(`${api}/markets`, marketsRoutes);
app.use(`${api}/ratings`, ratingRoutes);

// admin
app.use(`${api}/kelolafaq`, kelolaFaqRoutes);
app.use(`${api}/kelolauser`, kelolaUserRoutes);
app.use(`${api}/artikels`, artikelsRoutes);

//Database
mongoose.connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'shop-database'
})
.then(()=>{
    console.log('Database Connection is ready...')
})
.catch((err)=> {
    console.log(err);
})

//Server
app.listen(process.env.PORT || 3001, ()=>{

    console.log('server is running http://localhost:3001');
})