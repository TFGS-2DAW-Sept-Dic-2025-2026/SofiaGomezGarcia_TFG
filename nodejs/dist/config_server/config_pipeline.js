"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
// import routerCliente from './config_enrutamiento/endPointsCliente'; revisar
function configPipeline(ServerExpress) {
    //----------configuramos pipeline del servidor web express con sus funciones middleware....---------------
    ServerExpress.use(express_1.default.urlencoded({ extended: true }));
    ServerExpress.use(express_1.default.json());
    ServerExpress.use((0, cors_1.default)());
    // ServerExpress.use('/api/zonaCliente', routerCliente);
    //-----------------------------------------------------------------------------------------------------------
}
exports.default = configPipeline;
