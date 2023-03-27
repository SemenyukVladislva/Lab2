import { FC, useEffect, useState } from 'react';
import { FileService, TFileObject } from '../../services';
import { FileGrid } from './FileGrid';

import './styles.scss';

export const FileSystem: FC = () => {
    const [ files, setFiles ] = useState<TFileObject[]>([]);
    const [ path, setPath ] = useState<string>('');
    FileService.setSetters( setFiles, setPath );

    useEffect( () => {
        const fetchData = async () => {
            await FileService.loadFiles();
        };
        
        fetchData();
        }, [] 
    );

    return (
        <div className = 'fileSystem'>
            <div className = 'path'>{ path }</div>
            <FileGrid
                data = { files }
            />
            <div className = 'controls'>
                <button onClick = { async () => await FileService.goBack() }>Назад</button>
                <button onClick = { async () => await FileService.createFolder() }>Создать папку</button>
                {/* <button>Загрузить файл</button> */}
            </div>
        </div>
    );
}