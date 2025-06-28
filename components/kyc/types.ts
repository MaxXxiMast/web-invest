import { SelectChangeEvent } from '@mui/material/Select';
import type { ChangeEventHandler } from 'react';

export type getFormValues = (id: string) => string;

export type onChangeFuncs = Record<
  string,
  (
    e?:
      | SelectChangeEvent
      | React.ChangeEvent<HTMLInputElement>
      | ChangeEventHandler<any>
      | File,
    isReupload?: boolean,
    id?: string,
    btnType?: string
  ) => void
>;
