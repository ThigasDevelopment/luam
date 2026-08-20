export function count(total: number, singular: string, plural: string): string {
    return `${total} ${total === 1 ? singular : plural}`;
}
