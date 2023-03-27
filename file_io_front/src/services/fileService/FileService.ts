/** Модуль экспортирует сервис работы с файловой системой. */

import React from 'react';


type FilesChangeAction = React.Dispatch<React.SetStateAction<TFileObject[]>>;
type PathChangeAction = React.Dispatch<React.SetStateAction<string>>;

/** Объект файловой системы. */
export type TFileObject = Record<string, any> & {
    name: string;
    isFolder: boolean;
};

/** Сервер. */
const server = 'http://localhost:3001/';

/** 
 * Простая shortcut функция посылки запроса и обработки приходящий данных.
 * @param url - URL запроса.
 * @param [method = 'GET'] - метод запроса.
 * @param [body] - тело запроса (если необходимо).
 * */
const sendRequest = async ( url: string, method: string = 'GET', body?: BodyInit ) => {
    const response = await fetch( url, {
        method,
        headers: {
            'Content-Type': 'application/json'
        },
        body
    });

    const data = await response.json();

    if( !data?.success ) {
        throw new Error( 'No data or operation is not success.' );
    };

    return data;
}

/** 
 * Сервис работы с файловой системой.
 * Себе: Singleton или static?
 * */
export class FileService {
    static currentPath: string;
    static files: TFileObject[] = [];

    /** Сеттер React-хуков. */
    static setSetters( filesReaction: FilesChangeAction, pathReaction: PathChangeAction ): void {
        this._filesChangeReaction = filesReaction;
        this._pathChangeReaction = pathReaction;
    };

    /** Функция посылает запрос на получение текущего состояния файловой системы. */
    static async loadFiles(): Promise<void> {
        try {
            const responseData = await sendRequest( server );
            this._filesChangeReaction( this.files = responseData.files );
            this._pathChangeReaction( this.currentPath = responseData.path );
        } catch {};
    };

    /** Функция запрашивает имя новой папки и посылает запрос на её создание. */
    static async createFolder(): Promise<void> {
        try {
            const folderName = prompt( 'Введите имя новой папки:', 'Новая папка' ) || 'Новая папка';

            const responseData = await sendRequest( 
                server + 'createFolder', 
                'POST', 
                JSON.stringify({ folderName }) 
            );

            this._filesChangeReaction( this.files = responseData.files );
        } catch {};
    };

    /** 
     * Функция посылает запрос на удаление папки или файла.
     * @param fileName - имя выбранного объекта.
     * */
    static async removeFile( fileName: string ): Promise<void> {
        try {
            const responseData = await sendRequest( 
                server + 'removeFile', 
                'DELETE', 
                JSON.stringify({ fileName }) 
            );

            this._filesChangeReaction( this.files = responseData.files );
        } catch {};
    };

    /** 
     * Функция посылает запрос на переименовывание файла или папки.
     * @param oldName - старое имя файла/папки.
     * */
    static async renameFile( oldName: string ): Promise<void> {
        try {
            const newName = prompt( 'Введите новое имя файла/папки:' );

            if( !newName ) {
                return;
            };

            const responseData = await sendRequest( 
                server + 'renameFile', 
                'POST',
                JSON.stringify({ oldName, newName }) 
            );
    
            this._filesChangeReaction( this.files = responseData.files );
        } catch {};
    };
    
    /** 
     * Функция посылает запрос на скачивание файла. 
     * @param fileName - имя скачиваемого файла.
     * */
    static async downloadFile( fileName: string ): Promise<void> {
        try {
            const response = await fetch( server + 'downloadFile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ fileName })
            });

            response.blob().then( blob => __doDownload( blob, fileName ) );
        } catch {};
    };

    /** Функция посылает запрос на открытие папки. */
    static async openFolder( folderName: string ): Promise<void> {
        try {
            const responseData = await sendRequest( 
                server + 'openFolder', 
                'POST', 
                JSON.stringify({ folderName }) 
            );

            this._filesChangeReaction( this.files = responseData.files );
            this._pathChangeReaction( this.currentPath = responseData.path );
        } catch {};
    };

    /** Выход к родительской папке. */
    static async goBack(): Promise<void> {
        try {
            const responseData = await sendRequest( server + 'backFolder' );
            this._filesChangeReaction( this.files = responseData.files );
            this._pathChangeReaction( this.currentPath = responseData.path );
        } catch {};
    };

    /** React-функция изменения коллекции текущей коллекции файлов. */
    private static _filesChangeReaction: FilesChangeAction;
    /** React-функция изменения коллекции текущего пути. */
    private static _pathChangeReaction: PathChangeAction;
};

/** Метод скачивает с сервера файла. Взял с Интернета. */
const __doDownload = ( blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL( blob );
    const a = document.createElement( 'a' );
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild( a );
    a.click();
    document.body.removeChild( a );
    window.URL.revokeObjectURL( url );
};
