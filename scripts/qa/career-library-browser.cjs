const assert = require('node:assert/strict');
const fs = require('node:fs');
const {chromium} = require(require('node:path').join(process.env.CAREER_QA_NODE_MODULES || 'node_modules','playwright'));
const {default:AxeBuilder} = require(require('node:path').join(process.env.CAREER_QA_NODE_MODULES || 'node_modules','@axe-core/playwright'));
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const context=await browser.newContext({viewport:{width:1440,height:1000}});
 const page=await context.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.QA_PREVIEW_URL,{waitUntil:'load'});
 const base=new URL(page.url()).origin;
 await page.goto(base+'/careers',{waitUntil:'load'});
 assert.equal(await page.locator('.cl-career-card:visible').count(),6);
 await page.locator('.cl-search input:visible').fill('Python');
 assert.equal(await page.locator('.cl-career-card:visible').count(),3);
 await page.locator('.cl-search input:visible').fill('');
 await page.locator('select[aria-label="Category"]:visible').selectOption('Data & Analytics');
 assert.equal(await page.locator('.cl-career-card:visible').count(),2);
 await page.locator('select[aria-label="Starting level"]:visible').selectOption('Intermediate');
 assert.equal(await page.locator('.cl-career-card:visible').count(),1);
 await page.locator('select[aria-label="Starting level"]:visible').selectOption('Advanced');
 assert.equal(await page.locator('.cl-career-card:visible').count(),0);
 await page.getByRole('button',{name:'Clear filters',exact:true}).click();
 assert.equal(await page.locator('.cl-career-card:visible').count(),6);
 console.log('PASS catalogue search, combined filters and empty state');
 for(const theme of ['light','dark']){
  await page.evaluate(t=>document.documentElement.setAttribute('data-theme',t),theme);
  const results=await new AxeBuilder({page}).include('.cl').withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
  assert.equal(results.violations.filter(v=>['serious','critical'].includes(v.impact)).length,0,'Catalogue '+theme+': '+JSON.stringify(results.violations));
 }
 await page.evaluate(()=>document.documentElement.setAttribute('data-theme','light'));
 console.log('PASS catalogue light/dark accessibility');
 await page.screenshot({path:'/tmp/career-catalog-desktop.png',fullPage:true});
 const slugs=['data-analyst','frontend-developer','ux-ui-designer','cybersecurity-analyst','data-scientist','backend-developer'];
 for(const slug of slugs){
  await page.goto(base+'/careers/'+slug,{waitUntil:'load'});
  await page.waitForFunction(()=>{const x=document.querySelector('.cl-milestone input');return x&&!x.disabled;});
  assert.equal(await page.locator('h1:visible').count(),1);
  assert.ok(await page.locator('.cl-stage:visible').count()>=7);
  assert.equal(await page.locator('.cl-project:visible').count(),4);
  assert.equal(await page.locator('#readiness input[type=checkbox]:visible').count(),8);
  assert.ok(await page.locator('#resources .cl-resource:visible').count()>=15);
  assert.equal(await page.locator('link[rel=canonical]').first().getAttribute('href'),'https://cyprustech.careers/careers/'+slug);
  assert.ok((await page.locator('meta[name=robots]').first().getAttribute('content')).includes('noindex'));
  const schemas=await page.locator('script[type="application/ld+json"]').allTextContents();
  assert.ok(schemas.some(x=>JSON.parse(x)['@type']==='BreadcrumbList'));
  await page.locator('.cl-stage:visible').nth(1).locator('summary').click();
  assert.equal(await page.locator('.cl-stage:visible').nth(1).getAttribute('open'),'');
  await page.locator('.cl-stage:visible').nth(1).locator('summary').click();
  assert.equal(await page.locator('.cl-stage:visible').nth(1).getAttribute('open'),null);
  await page.locator('.cl-project:visible').first().locator('summary').click();
  assert.ok(await page.locator('.cl-project:visible').first().getByRole('heading',{name:'Deliverables'}).isVisible());
  const links=await page.locator('#resources .cl-resource a').evaluateAll(a=>a.map(x=>({url:x.href,target:x.target,rel:x.rel})));
  assert.ok(links.every(x=>x.url.startsWith('https:')&&x.target==='_blank'&&x.rel.includes('noopener')));
  const response=await context.request.get(base+'/api/careers/'+slug+'/progress');
  assert.equal(response.status(),401);
  console.log('PASS '+slug+': content, roadmap interactions, projects, SEO and unauthenticated progress');
 }
 await page.goto(base+'/careers/data-analyst',{waitUntil:'load'});
 const milestone=page.getByRole('checkbox',{name:'I can demonstrate this milestone'}).first();
 await milestone.check();
 const task=page.getByRole('checkbox',{name:'Clean a sales sheet and document missing values',exact:true});
 await task.check();
 const readiness=page.getByRole('checkbox',{name:'I can clean and validate a spreadsheet without losing source data.',exact:true});
 await readiness.check();
 await page.getByRole('button',{name:'Save this path',exact:true}).click();
 await page.reload({waitUntil:'load'});
 await page.waitForFunction(()=>document.querySelectorAll('h1').length===1);
 await page.waitForFunction(()=>{const x=document.querySelector('.cl-milestone input');return x&&!x.disabled;});
 assert.ok(await milestone.isChecked());assert.ok(await task.isChecked());assert.ok(await readiness.isChecked());
 assert.ok(await page.getByRole('button',{name:'Path saved',exact:true}).isVisible());
 assert.equal(await page.locator('.cl-progress-value:visible').textContent(),'14%');
 await page.locator('select[aria-label="Access"]:visible').selectOption('Paid');
 assert.equal(await page.locator('#resources .cl-resource:visible').count(),2);
 await page.locator('select[aria-label="Access"]:visible').selectOption('Free');
 assert.ok(await page.locator('#resources .cl-resource:visible').count()>10);
 await page.locator('select[aria-label="Difficulty"]:visible').selectOption('Advanced');
 assert.equal(await page.locator('#resources .cl-resource:visible').count(),0);
 await page.getByRole('button',{name:'Clear resource filters'}).click();
 console.log('PASS guest stages, tasks, readiness and saved path survive reload; resource filters and empty state');

 // Account UI contract tests use a mocked API; database ownership/persistence is tested separately in SQL.
 let accountProgress={saved:false,stages:[],tasks:[],readiness:[]},account='qa-user-one',failNext=false;
 await page.route('**/api/careers/data-analyst/progress',async route=>{
  const request=route.request();
  if(request.method()==='PATCH'){
   if(failNext){failNext=false;return route.fulfill({status:500,json:{error:'Test save failure'}});}
   const b=request.postDataJSON();
   if(b.import){for(const key of ['stages','tasks','readiness'])accountProgress[key]=[...new Set([...accountProgress[key],...b.import[key]])];accountProgress.saved ||= b.import.saved;}
   else if(b.kind==='saved')accountProgress.saved=b.value;
   else{const key=b.kind==='stage'?'stages':b.kind==='task'?'tasks':'readiness';accountProgress[key]=b.value?[...new Set([...accountProgress[key],b.id])]:accountProgress[key].filter(x=>x!==b.id);}
  }
  return route.fulfill({status:200,json:{userId:account,progress:accountProgress}});
 });
 await page.reload({waitUntil:'load'});
 await page.waitForFunction(()=>document.querySelectorAll('h1').length===1);
 await page.waitForFunction(()=>{const x=document.querySelector('.cl-milestone input');return x&&!x.disabled;});
 assert.equal(await milestone.isChecked(),false,'Guest progress must not auto-import');
 assert.ok(await page.getByRole('button',{name:"Import this browser's progress",exact:true}).isVisible());
 await milestone.check();
 await page.getByText('Progress saved to your account.',{exact:true}).waitFor();
 await page.reload({waitUntil:'load'});
 await page.waitForFunction(()=>document.querySelectorAll('h1').length===1);
 await page.waitForFunction(()=>{const x=document.querySelector('.cl-milestone input');return x&&!x.disabled;});
 assert.ok(await milestone.isChecked());
 failNext=true;await task.click();
 await page.getByText('Could not save this change. Please retry.',{exact:true}).waitFor();
 assert.equal(await task.isChecked(),false,'Failed account save must revert');
 await page.getByRole('button',{name:"Import this browser's progress",exact:true}).click();
 await page.getByText('Browser progress added to your account.',{exact:true}).waitFor();
 assert.ok(await task.isChecked());assert.ok(await readiness.isChecked());
 assert.equal(await page.evaluate(()=>localStorage.getItem('career-progress-v1:data-analyst')),null);
 account='qa-user-two';accountProgress={saved:false,stages:[],tasks:[],readiness:[]};
 await page.reload({waitUntil:'load'});
 await page.waitForFunction(()=>document.querySelectorAll('h1').length===1);
 await page.waitForFunction(()=>{const x=document.querySelector('.cl-milestone input');return x&&!x.disabled;});
 assert.equal(await milestone.isChecked(),false);assert.equal(await task.isChecked(),false);
 await page.unroute('**/api/careers/data-analyst/progress');
 await page.reload({waitUntil:'load'});
 await page.waitForFunction(()=>document.querySelectorAll('h1').length===1);
 console.log('PASS mocked account UI contract: persistence, explicit guest import, failure rollback, account isolation');
 const axe=await new AxeBuilder({page}).include('.cl').withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
 fs.writeFileSync('/tmp/career-axe.json',JSON.stringify(axe.violations,null,2));
 assert.equal(axe.violations.filter(v=>v.impact==='serious'||v.impact==='critical').length,0,JSON.stringify(axe.violations.map(v=>({id:v.id,impact:v.impact}))));
 await page.evaluate(()=>document.documentElement.setAttribute('data-theme','dark'));
 const darkAxe=await new AxeBuilder({page}).include('.cl').withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
 assert.equal(darkAxe.violations.filter(v=>['serious','critical'].includes(v.impact)).length,0,'Roadmap dark: '+JSON.stringify(darkAxe.violations));
 await page.evaluate(()=>document.documentElement.setAttribute('data-theme','light'));
 console.log('PASS roadmap light/dark accessibility');
 await page.screenshot({path:'/tmp/career-roadmap-desktop.png',fullPage:true});
 for(const width of [360,390,768,1024,1440]){
  await page.setViewportSize({width,height:900});
  for(const path of ['/careers','/careers/data-analyst']){
   await page.goto(base+path,{waitUntil:'load'});
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),width+'px overflow on '+path);
  }
  console.log('PASS responsive widths '+width);
 }
 await page.setViewportSize({width:390,height:844});
 await page.goto(base+'/careers',{waitUntil:'load'});
 await page.screenshot({path:'/tmp/career-catalog-mobile.png',fullPage:true});
 await page.goto(base+'/careers/data-analyst',{waitUntil:'load'});
 await page.screenshot({path:'/tmp/career-roadmap-mobile.png',fullPage:true});
 const sitemap=await context.request.get(base+'/sitemap.xml');assert.equal(sitemap.status(),200);
 const xml=await sitemap.text();for(const s of slugs)assert.ok(xml.includes('https://cyprustech.careers/careers/'+s));
 const admin=await context.request.post(base+'/api/admin/careers',{headers:{Origin:base},data:{career:{}}});assert.equal(admin.status(),401);
 const csrf=await context.request.patch(base+'/api/careers/data-analyst/progress',{headers:{Origin:'https://example.com'},data:{kind:'stage'}});assert.equal(csrf.status(),403);
 const missing=await context.request.get(base+'/careers/does-not-exist');assert.equal(missing.status(),404);
 for(const path of ['/','/jobs','/jobs/nicosia','/blog']){const r=await context.request.get(base+path);assert.equal(r.status(),200);}
 assert.equal(errors.length,0,errors.join('\n'));
 console.log('PASS sitemap, unauthorized admin, CSRF, 404 and existing homepage/jobs/city/blog smoke tests; no browser exceptions');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});