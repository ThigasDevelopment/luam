import type { Comment } from '@compiler/lexer/comment-scanner';

export function blankSpan(text: string): string {
    return text.replace(/[^\r\n]/g, '');
}

export function longComment(body: string): string {
    let equals = '';

    while (body.includes(`]${equals}]`) || body.endsWith(`]${equals}`)) {
        equals += '=';
    }

    return `--[${equals}[${body}]${equals}]`;
}

export function commentReplacement(source: string, comment: Comment): string {
    const raw = source.slice(comment.position.offset, comment.end.offset);

    if (comment.kind === 'line') {
        return `--${raw.slice(1)}`;
    }

    return longComment(raw.slice(2, raw.endsWith('*#') ? -2 : undefined));
}
