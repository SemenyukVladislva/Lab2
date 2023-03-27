import express from 'express';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __startFile = fileURLToPath( import.meta.url );
const __startFilePath = dirname( __startFile );

const PORT = 3001;
const app = express();
app.use( express.json() );

/** Установка заголовков перед обработкой запросов. Взял с Интернета. */
app.use( ( _, response, next ) => {
  response.setHeader( 'Access-Control-Allow-Origin', '*' );
  response.header( 'Access-Control-Allow-Methods', 'GET, POST, DELETE' );
  response.setHeader( 'Access-Control-Allow-Headers', 'X-Requested-With, content-type' );
  next();
});

/** Текущий открытый каталог. */
let currentPath = __startFilePath + '\\';

/** Получение текущего открытого каталога. */
app.get( '/', ( _, res ) => {
  try {
    const files = __getFiles( currentPath );
    res.json({
      success: true,
      files,
      path: currentPath
    });
  } catch {
    res.json({
      success: false
    });
  };
});

/** Создание папки. */
app.post( '/createFolder', ( req, res ) => {
  try {
    const folderName = req.body.folderName;
    const path = currentPath + folderName;

    fs.mkdirSync( path );

    const files = __getFiles( currentPath );
    res.json({
      success: true,
      files
    });
  } catch {
    res.json({
      success: false
    });
  };
});

/** Открытие папки. */
app.post( '/openFolder', ( req, res ) => {
  try {
    const newPath = currentPath + req.body.folderName + '\\';

    if ( !fs.existsSync( newPath ) ) {
      throw new Error( 'Unreachable path.' );
    };

    currentPath = newPath;

    const files = __getFiles( currentPath );
    res.json({
      success: true,
      files,
      path: currentPath
    });
  } catch {
    res.json({
      success: false
    });
  };
});

/** Выход к родительской папке. */
app.get( '/backFolder', ( _, res ) => {
  try {
    currentPath = join( currentPath, '../' );

    const files = __getFiles( currentPath );
    res.json({
      success: true,
      files,
      path: currentPath
    });
  } catch {
    res.json({
      success: false
    });
  };
});

/** Скачивание файла. */
app.post( '/downloadFile', ( req, res ) => {
  try {
    const fileName = currentPath + req.body.fileName;

    if ( !fs.existsSync( fileName ) || !fs.lstatSync( fileName ).isFile() ) {
      throw new Error();
    };

    res.sendFile( fileName );
  } catch {
    res.json({
      success: false
    });
  };
});

// app.post( '/uploadFile', ( req, res ) => {} );

/** Переименовывание файла или папки. */
app.post( '/renameFile', ( req, res ) => {
  try {
    const oldPath = currentPath + '\\' + req.body.oldName;
    const newPath = currentPath + '\\' + req.body.newName;

    fs.renameSync( oldPath, newPath );

    const files = __getFiles( currentPath );
    res.json({
      success: true,
      files
    });
  } catch {
    res.json({
      success: false
    });
  };
});

/** Удаление файла или папки. */
app.delete( '/removeFile', ( req, res ) => {
  try {
    const path = currentPath + req.body.fileName;

    fs.lstatSync( path ).isFile()
      ? fs.rmSync( path )
      : fs.rmdirSync( path );

    const files = __getFiles( currentPath );
    res.json({
      success: true,
      files
    });
  } catch {
    res.json({
      success: false
    });
  };
});

/** Прослушка по указанному порту. */
app.listen( PORT, () => {
  console.log( `Server listening on ${ PORT }.` );
});

/** Метод возвращает список файлов, находящихся в указанном каталоге. */
const __getFiles = ( path ) => {
  return fs.readdirSync( path ).map( fileName => { 
    return {
      name: fileName,
      isFolder: fs.lstatSync( path + '\\\\' + fileName ).isDirectory() 
    };
  });
};
