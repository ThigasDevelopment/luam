export interface Cell {
    width: number;
    height: number;
}

export interface Place {
    line: number;
    column: number;
}

export function offsetToPlace(text: string, offset: number): Place {
    const before = text.slice(0, offset);
    const lines = before.split('\n');

    return { line: lines.length - 1, column: (lines[lines.length - 1] ?? '').length };
}

export function placeToOffset(text: string, line: number, column: number): number {
    const lines = text.split('\n');

    let offset = 0;

    for (let index = 0; index < line && index < lines.length; index += 1) {
        offset += (lines[index] ?? '').length + 1;
    }

    return offset + Math.min(column, (lines[line] ?? '').length);
}

export function measureCell(reference: HTMLElement): Cell {
    const probe = document.createElement('span');
    const styles = getComputedStyle(reference);

    probe.textContent = '0'.repeat(40);
    probe.style.position = 'absolute';
    probe.style.visibility = 'hidden';
    probe.style.whiteSpace = 'pre';
    probe.style.font = styles.font;
    probe.style.letterSpacing = styles.letterSpacing;

    reference.appendChild(probe);

    const width = probe.getBoundingClientRect().width / 40;

    probe.remove();

    const height = Number.parseFloat(styles.lineHeight);

    return { width, height: Number.isNaN(height) ? 20 : height };
}

export function wordStart(text: string, offset: number): number {
    let index = offset;

    while (index > 0 && /[A-Za-z0-9_]/.test(text[index - 1] ?? '')) {
        index -= 1;
    }

    return index;
}

export function currentWord(text: string, offset: number): string {
    return text.slice(wordStart(text, offset), offset);
}

export function shouldSuggest(text: string, offset: number): boolean {
    const previous = text[offset - 1] ?? '';

    return /[A-Za-z0-9_.:]/.test(previous);
}
