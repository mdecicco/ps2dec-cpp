import * as fs from '__internal:fs';
import { decodeUTF8 } from '__internal:buffer';

type ColumnInfo = [index: number, columnName: string, type: ColumnType];
type ColumnNameMap<T> = Record<keyof T, ColumnInfo>;

export enum ColumnType {
    String,
    Number,
    Boolean
}

type InternalColumnInfo<T> = {
    index: number;
    label: string;
    fieldName: keyof T;
    type: ColumnType;
};

const quoteRegex = new RegExp(/"/, 'g');
const searchRegex = new RegExp(/["\n\r]/, 'g');

export class Table<T extends Record<any, any>> {
    private m_columns: InternalColumnInfo<T>[];
    private m_rows: T[];

    constructor(columnNameMap: ColumnNameMap<T>, rows: T[] = []) {
        this.m_columns = [];
        this.m_rows = rows;

        for (const fieldName in columnNameMap) {
            const [index, label, type] = columnNameMap[fieldName];
            this.m_columns.push({
                index,
                label,
                fieldName,
                type
            });
        }

        this.m_columns.sort((a, b) => a.index - b.index);
    }

    private encodeString(value: string) {
        if (value.includes(',') || value.search(searchRegex) >= 0) {
            return `"${value.replace(quoteRegex, '""')}"`;
        }

        return value;
    }

    private decodeString(value: string) {
        if (value.startsWith('"') && value.endsWith('"')) {
            return value.slice(1, -1).replace(/""/g, '"');
        }

        return value;
    }

    private valueToString(value: any, type: ColumnType) {
        switch (type) {
            case ColumnType.String:
                return this.encodeString(value);
            case ColumnType.Number:
                return value.toString();
            case ColumnType.Boolean:
                return value ? 'true' : 'false';
        }

        return '';
    }

    private parseValue(lineIdx: number, columnIdx: number, input: string): any {
        switch (this.m_columns[columnIdx].type) {
            case ColumnType.String:
                return this.decodeString(input);
            case ColumnType.Number:
                const value = parseFloat(input);
                if (isNaN(value)) {
                    throw new Error(
                        `Invalid value '${input}' in line ${lineIdx + 1}, column ${columnIdx + 1}. Expected a number.`
                    );
                }

                return value;
            case ColumnType.Boolean:
                if (input === 'true') return true;
                else if (input === 'false') return false;

                throw new Error(
                    `Invalid value '${input}' in line ${lineIdx + 1}, column ${columnIdx + 1}. Expected a boolean.`
                );
        }
    }

    get rows() {
        return Array.from(this.m_rows);
    }

    push(row: T) {
        this.m_rows.push(row);
    }

    generate() {
        const lines: string[] = [];

        lines.push(this.m_columns.map(c => c.label).join(','));

        for (const row of this.m_rows) {
            lines.push(this.m_columns.map(c => this.valueToString(row[c.fieldName], c.type)).join(','));
        }

        return lines.join('\n');
    }

    parse(data: string) {
        const lines = data.split('\n');
        const columns = lines[0].split(',');
        if (columns.length !== this.m_columns.length) {
            throw new Error(`Invalid number of columns in line 1`);
        }

        for (let i = 0; i < columns.length; i++) {
            if (columns[i] !== this.m_columns[i].label) {
                throw new Error(`Invalid column name in line 1: '${columns[i]}' !== '${this.m_columns[i].label}'`);
            }
        }

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i];

            if (!line.trim()) continue;

            const values: string[] = [];
            let current = '';
            let inQuotes = false;
            let c = 0;

            while (c < line.length) {
                const char = line[c];

                if (char === '"') {
                    if (inQuotes && c + 1 < line.length && line[c + 1] === '"') {
                        // Escaped quote
                        current += '"';
                        c += 2;
                    } else {
                        // Toggle quote state
                        inQuotes = !inQuotes;
                        c++;
                    }
                } else if (char === ',' && !inQuotes) {
                    values.push(current);
                    current = '';
                    c++;
                } else {
                    current += char;
                    c++;
                }
            }

            // Add the last value
            values.push(current);

            if (values.length !== this.m_columns.length) {
                throw new Error(`Invalid number of values in line ${i + 1}`);
            }

            const row = {} as T;
            for (let j = 0; j < this.m_columns.length && j < values.length; j++) {
                const column = this.m_columns[j];
                (row as any)[column.fieldName] = this.parseValue(i, j, values[j]);
            }

            this.m_rows.push(row);
        }
    }

    parseFromFile(path: string) {
        const data = fs.readFileSync(path);
        if (!data) throw new Error(`Failed to read file ${path}`);

        const decoded = decodeUTF8(data);
        if (!decoded) throw new Error(`Failed to decode UTF-8 string from file ${path}`);

        this.parse(decoded);
    }

    saveToFile(path: string) {
        const data = this.generate();
        const buf = new Uint8Array(data.length);
        for (let i = 0; i < data.length; i++) {
            buf[i] = data.charCodeAt(i);
        }
        fs.writeFileSync(path, buf.buffer);
    }
}
