import { FC } from 'react';
import { TFileObject } from '../../services';
import { FileRecord } from './FileRecord';


interface GridProps {
    data: TFileObject[];
};

export const FileGrid: FC<GridProps> = ({ data }) => {
    return (
        <div className = 'fileGrid'> {
            data.map( ( record, ind ) =>
                <FileRecord
                    key = { ind }
                    record = { record }
                />)
        } </div>
    );
};
