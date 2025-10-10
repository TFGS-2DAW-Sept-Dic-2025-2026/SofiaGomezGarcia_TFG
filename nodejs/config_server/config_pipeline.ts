import express,{Express, NextFunction,Request,Response} from 'express';
import cors from 'cors';
// import routerCliente from './config_enrutamiento/endPointsCliente'; revisar

function configPipeline(ServerExpress:Express){

//----------configuramos pipeline del servidor web express con sus funciones middleware....---------------
ServerExpress.use(express.urlencoded({extended:true}));
ServerExpress.use(express.json());
ServerExpress.use(cors());


// ServerExpress.use('/api/zonaCliente', routerCliente);
//-----------------------------------------------------------------------------------------------------------
}

export default configPipeline;