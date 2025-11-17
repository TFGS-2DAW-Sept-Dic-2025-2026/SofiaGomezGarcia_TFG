export default interface IUsuario {
   id?: string,
  _id?: string,
  fotoPerfil?: string,
  username:string,
  email:string,
  passwordHash:string,
  seguidores: []
}