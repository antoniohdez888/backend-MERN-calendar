const { response } = require('express');
const bcrypt = require('bcryptjs');
const Usuario = require('../models/Usuario');
const { generarJWT } = require('../helpers/jwt');

const crearUsuario = async( req, res = response ) => {

    const { email, password } = req.body;

    try {

        let usuario = await Usuario.findOne({ email });

        if( usuario ){
            res.status(400).json({
                ok: false, 
                msg: 'Correo ya en existencia'
            })
        }

        usuario = new Usuario( req.body );

        // encriptar contraseña
        const salt = bcrypt.genSaltSync();
        usuario.password = bcrypt.hashSync( password, salt );
    
        await usuario.save();

        // * Generar JWT

        const token = generarJWT( usuario.id, usuario.name );
    
        res.status(201).json({
            ok: true,
            uid: usuario._id,
            name: usuario.name,
            token
        })
        
    } catch (error) {

        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Por favor hable con el administrador'
        })

    }

}

const loginUsuario = async( req, res = response ) => {
    
    const { email, password } = req.body;

    try {

        const usuario = await Usuario.findOne({ email });

        if( !usuario ){
            return res.status(400).json({
                ok: false, 
                msg: 'No hay usuario registrado con ese mail'
            });
        }

        // confirmar password

        const validPassword = bcrypt.compareSync( password, usuario.password );

        if ( !validPassword ){
            return res.status(400).json({
                ok: false,
                msg: 'Password incorrecto'
            });
        }

        // * generar JWT

        const token = await generarJWT( usuario.id, usuario.name );

        res.status(200).json({
            ok: true,
            uid: usuario._id,
            name: usuario.name,
            token
        })
        
    } catch (error) {
        
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Por favor hable con el administrador'
        })
    }

}

const revalidarToken = async( req, res = response ) => {

    const { uid, name } = req;

    // * generar nuevo JWT y retornarlo en peticion

    const token = await generarJWT( uid, name );
    
    res.json({
        ok: true,
        uid,
        name,
        token
    })
}

module.exports = {
    crearUsuario,
    loginUsuario,
    revalidarToken

}