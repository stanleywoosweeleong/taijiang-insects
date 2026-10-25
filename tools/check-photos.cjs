// Run before deployment. Do not silently substitute another insect's photo.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const data=JSON.parse(fs.readFileSync(path.join(root,'data.js'),'utf8').replace(/^window\.DATA\s*=\s*/,'').replace(/;\s*$/,''));
const manifest=JSON.parse(fs.readFileSync(path.join(__dirname,'photo-manifest.json'),'utf8')).photos;
const expected=new Set(),pages=new Set();
for(const s of data.species){
 assert.ok(Number.isInteger(s.p)&&!pages.has(s.p),`Duplicate/invalid page ${s.p}`);pages.add(s.p);
 assert.ok(Number.isInteger(s.ph)&&s.ph>0,`Missing photo count on page ${s.p}`);
 for(let i=0;i<s.ph;i++){
  const name=`img/p${s.p}${i?'-'+(i+1):''}.jpg`,file=path.join(root,name),reference=manifest[name];expected.add(name);
  assert.ok(fs.existsSync(file),`Missing ${name}. Upload photographs to img/, not the repository root.`);
  assert.ok(reference&&reference.bookPage===s.p&&reference.pdfPage===s.p+2,`Unverified photo mapping ${name}`);
  const bytes=fs.readFileSync(file);assert.ok(bytes[0]===255&&bytes[1]===216,`Not a JPEG: ${name}`);
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),reference.sha256,`Photo changed: ${name}. Verify its species and update the photo manifest intentionally.`);
 }
}
assert.deepEqual([...expected].sort(),Object.keys(manifest).sort(),'Photo counts and verified manifest differ');
assert.equal(fs.readdirSync(root).filter(n=>/^p\d+(?:-\d+)?\.jpg$/i.test(n)).length,0,'Misplaced photos at repository root');
console.log(`PASS: ${expected.size} photo paths and original-image hashes verified across ${pages.size} entries.`);
