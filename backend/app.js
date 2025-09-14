const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Rutas
const productosRoutes = require('./routes/productos');
app.use('/productos', productosRoutes);

const clientesRoutes = require('./routes/clientes');
app.use('/clientes', clientesRoutes);

const ventasRoutes = require('./routes/ventas');
app.use('/ventas', ventasRoutes);


const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
