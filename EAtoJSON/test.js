import path from 'path'
import { readFileSync, writeFileSync } from 'fs'
import MDBReader from 'mdb-reader'
import { eapToJson } from './eap-to-json.js'

const buffer = readFileSync(path.resolve('ESPD_CM.eapx'))
const reader = new MDBReader(buffer)
console.log(reader.getTableNames())
const json = eapToJson({ buffer })
console.log(json)
// writeFileSync('./result.json', JSON.stringify(json, null, 2))
