import { execFileSync } from 'node:child_process'

const areas = [
    { label: 'area/compiler', prefix: 'packages/compiler/' },
    { label: 'area/runtime', prefix: 'packages/runtime/' },
    { label: 'area/cli', prefix: 'packages/cli/' },
    { label: 'area/lsp', prefix: 'packages/lsp/' },
    { label: 'area/editor', prefix: 'packages/vscode/' },
    { label: 'area/editor', prefix: 'packages/theme/' },
    { label: 'area/mta-types', prefix: 'packages/mta-types/' },
    { label: 'area/template', prefix: 'packages/template/' },
    { label: 'area/release', prefix: 'tools/release/' },
    { label: 'area/docs', prefix: 'docs/' },
    { label: 'area/docs', prefix: 'examples/' },
    { label: 'area/pipeline', prefix: '.github/' },
]

const sizes = [
    { label: 'size/xs', upTo: 10 },
    { label: 'size/s', upTo: 50 },
    { label: 'size/m', upTo: 250 },
    { label: 'size/l', upTo: 1000 },
    { label: 'size/xl', upTo: Number.POSITIVE_INFINITY },
]

const colors = {
    'area/compiler': '1d76db',
    'area/runtime': '1d76db',
    'area/cli': '0e8a16',
    'area/lsp': '0e8a16',
    'area/editor': '5319e7',
    'area/mta-types': 'fbca04',
    'area/template': 'fbca04',
    'area/release': 'b60205',
    'area/docs': '006b75',
    'area/pipeline': '555555',
    'size/xs': 'c2e0c6',
    'size/s': 'c2e0c6',
    'size/m': 'fef2c0',
    'size/l': 'f9d0c4',
    'size/xl': 'f9d0c4',
}

const gh = (args) => execFileSync('gh', args, { encoding: 'utf8' })

const repository = process.env.REPOSITORY
const pull = process.env.PULL_REQUEST

if (!repository || !pull) {
    console.error('REPOSITORY and PULL_REQUEST are required.')
    process.exit(1)
}

const files = gh(['api', `repos/${repository}/pulls/${pull}/files`, '--paginate', '--jq', '.[] | [.filename, .additions, .deletions] | @tsv'])
    .split('\n')
    .filter(Boolean)
    .map((line) => {
        const [name, additions, deletions] = line.split('\t')

        return { name, changed: Number(additions) + Number(deletions) }
    })

if (files.length === 0) {
    console.log('The pull request changes no file.')
    process.exit(0)
}

const changed = files.reduce((total, file) => total + file.changed, 0)
const matched = new Set(areas.filter((area) => files.some((file) => file.name.startsWith(area.prefix))).map((area) => area.label))
const size = sizes.find((entry) => changed <= entry.upTo).label
const labels = [...matched, size]

for (const label of labels) {
    try {
        gh(['label', 'create', label, '--repo', repository, '--color', colors[label], '--force'])
    } catch {
        console.log(`The label ${label} could not be created; assuming it exists.`)
    }
}

gh(['pr', 'edit', pull, '--repo', repository, '--add-label', labels.join(',')])

console.log(`Labelled #${pull} with ${labels.join(', ')} across ${changed} changed lines.`)
