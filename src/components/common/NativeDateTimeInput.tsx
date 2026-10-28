import {Input} from 'antd';
import dayjs from 'dayjs';

const FORMAT = 'YYYY-MM-DDTHH:mm';

interface NativeDateTimeInputProps {
    value?: dayjs.Dayjs | null;
    onChange?: (value: dayjs.Dayjs | null) => void;
    min?: dayjs.Dayjs;
    id?: string;
}

/**
 * A `datetime-local` field with the same value shape as Ant Design's DatePicker, for phones,
 * where the platform's own picker fits the screen and the DatePicker's two panels do not.
 */
export default function NativeDateTimeInput({value, onChange, min, id}: NativeDateTimeInputProps) {
    return (
        <Input
            id={id}
            type="datetime-local"
            value={value ? value.format(FORMAT) : ''}
            min={min?.format(FORMAT)}
            onChange={(e) => onChange?.(e.target.value ? dayjs(e.target.value) : null)}
        />
    );
}
