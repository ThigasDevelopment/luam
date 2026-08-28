import { readFileSync } from 'node:fs'

const severities = ['critical', 'high', 'moderate', 'low', 'info']

const read = (path) => {
    try {
        return JSON.parse(readFileSync(path, 'utf8'))
    } catch {
        return null
    }
}

const collect = (report) => {
    if (!report) return []

    const source = report.advisories ?? report.vulnerabilities ?? {}

    return Object.values(source).map((entry) => ({
        module: entry.module_name ?? entry.name ?? 'unknown',
        severity: entry.severity ?? 'unknown',
        title: entry.title ?? entry.via?.[0]?.title ?? 'Advisory',
        url: entry.url ?? entry.via?.[0]?.url ?? '',
    }))
}

const order = (advisory) => {
    const rank = severities.indexOf(advisory.severity)

    return rank === -1 ? severities.length : rank
}

const [, , path] = process.argv
const advisories = collect(read(path)).sort((left, right) => order(left) - order(right))

if (advisories.length === 0) {
    process.stdout.write('none\n')
    process.exit(0)
}

const rows = advisories
    .map((advisory) => `| ${advisory.module} | ${advisory.severity} | ${advisory.title} | ${advisory.url} |`)
    .join('\n')

process.stdout.write(
    [
        `The weekly audit found ${advisories.length} advisory or advisories in the production dependency tree.`,
        '',
        '| Package | Severity | Advisory | Reference |',
        '|---|---|---|---|',
        rows,
        '',
        'Run `pnpm audit --audit-level moderate --prod` locally to reproduce it.',
        '',
        'This report is advisory. It never blocks a pull request, because a newly',
        'published advisory is not something a change caused.',
        '',
    ].join('\n'),
)
