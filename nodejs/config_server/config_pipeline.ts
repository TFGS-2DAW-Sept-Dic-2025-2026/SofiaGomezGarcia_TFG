import express,{Express, NextFunction,Request,Response} from 'express';
import cors from 'cors';

function configPipeline(ServerExpress:Express){

//----------pipeline del servidor web express con sus funciones middleware....---------------
ServerExpress.use(express.urlencoded({extended:true}));
ServerExpress.use(express.json());
ServerExpress.use(cors());

//-----------------------------------------------------------------------------------------------------------
}

export default configPipeline;