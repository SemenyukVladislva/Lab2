import { FC } from 'react';
import { FileService, TFileObject } from '../../services';


interface FileRecordProps {
    record: TFileObject;
};

export const FileRecord: FC<FileRecordProps> = ({ record }) => {
    return (
        <div className = { 'record ' + ( record.isFolder ? 'folder' : 'file' ) }>
            {
                record.isFolder 
                ? <button className = { 'folderName' }
                    onClick = { async () => await FileService.openFolder( record.name ) }
                    children = { record.name }
                />
                : <p className = 'fileName'>
                    { record.name }
                </p>
            }
            <div className = 'options'>
                <button title = 'Переименовать' className = 'rename' onClick = { async () => await FileService.renameFile( record.name ) }/>
                { 
                    !record.isFolder 
                    && <button title = 'Скачать' className = 'download' onClick = { async () => await FileService.downloadFile( record.name ) }/>
                } 
                <button title = 'Удалить' className = 'remove' onClick = { async () => await FileService.removeFile( record.name ) }/>
            </div>
        </div>
    );
}