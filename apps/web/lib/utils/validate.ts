import { NextResponse } from 'next/server';

export function validate(schema: Record<string, string>, data: any) {
    const errors: string[] = [];

    for (const [key, type] of Object.entries(schema)) {
        if (data[key] === undefined || data[key] === null) {
            errors.push(`${key} is required`);
        } else if (typeof data[key] !== type) {
            errors.push(`${key} must be a ${type}`);
        }
    }

    if (errors.length > 0) {
        return NextResponse.json({ error: 'Validation Failed', details: errors }, { status: 400 });
    }

    return null;
}
