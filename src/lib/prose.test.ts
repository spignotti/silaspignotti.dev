import assert from 'node:assert/strict'
import test from 'node:test'
import { isPlaceholder, parseHome, parsePageIntro, parseSections, slugifyHeading } from './prose.ts'

test('a result placeholder stays, a link line does not', () => {
  const body = ['## Ergebnis', '', 'Die Pipeline ist fertig.', '', '[Platzhalter: Endergebnis]', '', '[Mehr](/projekte)', ''].join('\n')
  const section = parseSections(body)[0]
  assert.deepEqual(section?.paragraphs, ['Die Pipeline ist fertig.', '[Platzhalter: Endergebnis]'])
  assert.equal(isPlaceholder('[Placeholder: legal text]'), true)
  assert.equal(isPlaceholder('[Mehr](/projekte)'), false)
})

test('section ids come from the heading', () => {
  const body = [
    '## Ausgangslage',
    '',
    'Text.',
    '',
    '## Was Tourengenie tut',
    '',
    'Text.',
    '',
    '## Über die Größe',
    '',
    'Text.',
    '',
    '## ---',
    '',
    'Text.',
  ].join('\n')
  assert.deepEqual(
    parseSections(body).map((section) => section.id),
    ['ausgangslage', 'was-tourengenie-tut', 'ueber-die-groesse'],
  )
  assert.equal(slugifyHeading('Fahrzeit-Cache'), 'fahrzeit-cache')
})

test('the home page is read by section position', () => {
  const body = [
    '# Silas Pignotti',
    '',
    'Geodaten · Datenauswertung · Softwareentwicklung · Berlin',
    '',
    '## Profil',
    '',
    'Erster Absatz.',
    '',
    'Zweiter Absatz.',
    '',
    '## Bereiche',
    '',
    '## Projekte',
    '',
    'Zu jedem Projekt beschreibe ich die Aufgabe.',
    '',
    '## Über mich',
    '',
    'Ein Absatz zur Ausbildung.',
    '',
    'Noch ein Absatz.',
    '',
    '[LinkedIn](https://www.linkedin.com/in/silas-pignotti/)',
    '',
    '## Kontakt',
    '',
    'Ich bin offen für Projekte.',
    '',
    '- [E-Mail](mailto:mail@silaspignotti.dev)',
    '- [GitHub](https://github.com/spignotti)',
    '',
  ].join('\n')
  assert.deepEqual(parseHome(body), {
    name: 'Silas Pignotti',
    fieldLine: 'Geodaten · Datenauswertung · Softwareentwicklung · Berlin',
    profileTitle: 'Profil',
    profile: ['Erster Absatz.', 'Zweiter Absatz.'],
    areasTitle: 'Bereiche',
    projectsTitle: 'Projekte',
    projectsIntro: 'Zu jedem Projekt beschreibe ich die Aufgabe.',
    aboutTitle: 'Über mich',
    about: ['Ein Absatz zur Ausbildung.', 'Noch ein Absatz.'],
    aboutLink: { label: 'LinkedIn', href: 'https://www.linkedin.com/in/silas-pignotti/' },
    contactTitle: 'Kontakt',
    contactLead: 'Ich bin offen für Projekte.',
    contactLinks: [
      { label: 'E-Mail', href: 'mailto:mail@silaspignotti.dev' },
      { label: 'GitHub', href: 'https://github.com/spignotti' },
    ],
  })
})

test('an empty projects section leaves no intro and keeps the sections after it', () => {
  const body = [
    '# Silas Pignotti',
    '',
    'Zeile',
    '',
    '## Profil',
    '',
    'Absatz.',
    '',
    '## Bereiche',
    '',
    '## Projekte',
    '',
    '## Über mich',
    '',
    'Text.',
    '',
    '## Kontakt',
    '',
    'Offen.',
    '',
    '- [E-Mail](mailto:mail@silaspignotti.dev)',
    '',
  ].join('\n')
  const home = parseHome(body)
  assert.equal(home.projectsTitle, 'Projekte')
  assert.equal(home.projectsIntro, '')
  assert.equal(home.aboutTitle, 'Über mich')
  assert.deepEqual(home.about, ['Text.'])
  assert.equal(home.contactLead, 'Offen.')
  assert.deepEqual(home.contactLinks, [{ label: 'E-Mail', href: 'mailto:mail@silaspignotti.dev' }])
  const projects = parsePageIntro('# Projekte\n')
  assert.equal(projects.title, 'Projekte')
  assert.equal(projects.intro, '')
})

test('an incomplete home page yields empty parts', () => {
  const home = parseHome('# Silas Pignotti')
  assert.equal(home.name, 'Silas Pignotti')
  assert.equal(home.fieldLine, '')
  assert.equal(home.profileTitle, '')
  assert.deepEqual(home.profile, [])
  assert.equal(home.projectsTitle, '')
  assert.equal(home.projectsIntro, '')
  assert.equal(home.aboutLink, null)
  assert.deepEqual(home.about, [])
  assert.equal(home.contactLead, '')
  assert.deepEqual(home.contactLinks, [])
})
