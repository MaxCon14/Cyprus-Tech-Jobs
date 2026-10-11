const assert=require('node:assert/strict'),fs=require('node:fs');
const {chromium}=require(require('node:path').join(process.env.CAREER_QA_NODE_MODULES || 'node_modules','playwright'));
const {default:AxeBuilder}=require(require('node:path').join(process.env.CAREER_QA_NODE_MODULES || 'node_modules','@axe-core/playwright'));
(async()=>{
const browser=await chromium.launch({args:['--no-sandbox']});
const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(process.env.QA_PREVIEW_URL,{waitUntil:'load'});const base=new URL(page.url()).origin;
async function visit(path){await page.goto(base+path,{waitUntil:'load'});if(path.startsWith('/careers/'))await page.waitForFunction(()=>document.querySelector('.cl-progress-panel button')?.disabled===false);if(await page.getByRole('button',{name:'Reject',exact:true}).isVisible())await page.getByRole('button',{name:'Reject',exact:true}).click();}
async function tab(id){await page.locator('#tab-'+id).click();await page.locator('#'+id+':visible').waitFor();await page.waitForFunction(id=>document.getElementById(id).getBoundingClientRect().top<innerHeight/2,id);assert.equal(await page.locator('[role=tabpanel]:visible').count(),1);}
async function axe(label){for(const theme of ['light','dark']){await page.evaluate(t=>document.documentElement.setAttribute('data-theme',t),theme);const r=await new AxeBuilder({page}).include('.cl').withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();fs.writeFileSync('/tmp/career-redesign-axe-'+label+'-'+theme+'.json',JSON.stringify(r.violations,null,2));assert.equal(r.violations.filter(v=>['serious','critical'].includes(v.impact)).length,0,label+' '+theme+': '+JSON.stringify(r.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,failure:n.failureSummary}))}))));}await page.evaluate(()=>document.documentElement.setAttribute('data-theme','light'));console.log('PASS '+label+' light/dark accessibility');}
await visit('/careers');assert.equal(await page.locator('.cl-career-card:visible').count(),6);
await page.locator('.cl-search input:visible').fill('Python');assert.equal(await page.locator('.cl-career-card:visible').count(),3);
await page.locator('.cl-search input:visible').fill('');
await page.getByRole('button',{name:/Data & Analytics/}).click();assert.equal(await page.locator('.cl-career-card:visible').count(),2);
await page.locator('select[aria-label="Starting level"]').selectOption('Intermediate');assert.equal(await page.locator('.cl-career-card:visible').count(),1);
await page.locator('select[aria-label="Starting level"]').selectOption('Advanced');assert.equal(await page.locator('.cl-career-card:visible').count(),0);
await page.getByRole('button',{name:'Clear filters',exact:true}).click();assert.equal(await page.locator('.cl-career-card:visible').count(),6);
await axe('catalog');await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:'/tmp/career-redesign-catalog.png'});
console.log('PASS career discovery: six role identities, interest buttons, search/combined filters and empty state');
const slugs=['data-analyst','frontend-developer','ux-ui-designer','cybersecurity-analyst','data-scientist','backend-developer'];
for(const slug of slugs){
 await visit('/careers/'+slug);
 assert.equal(await page.locator('h1:visible').count(),1);
 assert.equal(await page.locator('[role=tabpanel]:visible').getAttribute('id'),'roadmap');
 assert.ok(await page.locator('.cl-stage:visible').count()>=7);
 assert.equal(await page.locator('link[rel=canonical]').first().getAttribute('href'),'https://cyprustech.careers/careers/'+slug);
 assert.ok((await page.locator('meta[name=robots]').first().getAttribute('content')).includes('noindex'));
 await page.locator('.cl-stage:visible').nth(1).locator('summary').click();assert.equal(await page.locator('.cl-stage:visible').nth(1).getAttribute('open'),'');
 await page.locator('.cl-stage:visible').nth(1).locator('summary').click();assert.equal(await page.locator('.cl-stage:visible').nth(1).getAttribute('open'),null);
 await tab('resources');assert.ok(await page.locator('#resources .cl-resource:visible').count()>=15);
 const links=await page.locator('#resources .cl-resource a').evaluateAll(a=>a.map(x=>({url:x.href,target:x.target,rel:x.rel})));
 assert.ok(links.every(x=>x.url.startsWith('https:')&&x.target==='_blank'&&x.rel.includes('noopener')));
 const images=await page.locator('#resources img').evaluateAll(a=>a.map(x=>x.getAttribute('src')));
 for(const src of [...new Set(images)]){const r=await context.request.get(base+src);assert.equal(r.status(),200,'Missing logo '+src);}
 await page.locator('.cl-resource-stage button').first().click();assert.equal(await page.locator('[role=tabpanel]:visible').getAttribute('id'),'roadmap');assert.ok(new URL(page.url()).hash.includes('-stage-'));
 await tab('projects');assert.equal(await page.locator('.cl-project:visible').count(),4);await page.locator('.cl-project:visible').first().locator('summary').click();assert.ok(await page.locator('.cl-project:visible').first().getByRole('heading',{name:'Deliverables',exact:true}).isVisible());
 await tab('readiness');assert.equal(await page.locator('#readiness input:visible').count(),8);
 await tab('career-jobs');assert.ok(await page.getByRole('heading',{name:'Relevant jobs in Cyprus.',exact:true}).isVisible());
 assert.equal((await context.request.get(base+'/api/careers/'+slug+'/progress')).status(),401);
 console.log('PASS '+slug+': focused sections, stage interactions, real logo assets, projects, stage jump links and SEO');
}
await visit('/careers/data-analyst');
await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:'/tmp/career-redesign-detail.png'});
const milestone=page.getByRole('checkbox',{name:'I can demonstrate this milestone'}).first();
const task=page.getByRole('checkbox',{name:'Clean a sales sheet and document missing values',exact:true});
const readiness=page.locator('#readiness input').first();
await milestone.check();await task.check();await tab('readiness');await readiness.check();await page.getByRole('button',{name:'Save this path',exact:true}).click();
await visit('/careers/data-analyst');assert.ok(await milestone.isChecked());assert.ok(await task.isChecked());assert.ok(await readiness.isChecked());assert.equal(await page.locator('.cl-progress-value:visible').textContent(),'14%');
assert.ok(await page.getByRole('button',{name:'Path saved',exact:true}).isVisible());
await page.getByRole('button',{name:'Continue learning',exact:true}).click();assert.equal(await page.locator('#data-analyst-stage-2').getAttribute('open'),'');assert.equal(new URL(page.url()).hash,'#data-analyst-stage-2');await page.waitForFunction(()=>{const r=document.getElementById('data-analyst-stage-2').getBoundingClientRect();return r.top>=0&&r.top<innerHeight;});
await tab('resources');await page.locator('select[aria-label="Access"]').selectOption('Paid');assert.equal(await page.locator('#resources .cl-resource:visible').count(),2);
await page.locator('select[aria-label="Access"]').selectOption('Free');assert.ok(await page.locator('#resources .cl-resource:visible').count()>10);
await page.locator('select[aria-label="Difficulty"]').selectOption('Advanced');assert.equal(await page.locator('#resources .cl-resource:visible').count(),0);
await page.getByRole('button',{name:'Clear resource filters'}).click();
await page.screenshot({path:'/tmp/career-redesign-resources.png'});await axe('resources');
await tab('projects');await page.screenshot({path:'/tmp/career-redesign-projects.png'});await axe('projects');
await tab('readiness');await axe('readiness');await tab('career-jobs');await axe('jobs');await tab('roadmap');await axe('roadmap');
await page.locator('#tab-roadmap').focus();await page.keyboard.press('ArrowRight');assert.equal(await page.locator('#tab-resources').getAttribute('aria-selected'),'true');
await page.keyboard.press('Home');assert.equal(await page.locator('#tab-roadmap').getAttribute('aria-selected'),'true');
console.log('PASS guest stage/task/readiness/save persistence, next-stage action, resource filters, keyboard tabs and stage return');
let accountProgress={saved:false,stages:[],tasks:[],readiness:[]},account='qa-user-one',failNext=false;
await page.route('**/api/careers/data-analyst/progress',async route=>{
 const request=route.request();if(request.method()==='PATCH'){if(failNext){failNext=false;return route.fulfill({status:500,json:{error:'Test save failure'}});}const b=request.postDataJSON();if(b.import){for(const key of ['stages','tasks','readiness'])accountProgress[key]=[...new Set([...accountProgress[key],...b.import[key]])];accountProgress.saved ||= b.import.saved;}else if(b.kind==='saved')accountProgress.saved=b.value;else{const key=b.kind==='stage'?'stages':b.kind==='task'?'tasks':'readiness';accountProgress[key]=b.value?[...new Set([...accountProgress[key],b.id])]:accountProgress[key].filter(x=>x!==b.id);}}
 return route.fulfill({status:200,json:{userId:account,progress:accountProgress}});
});
await visit('/careers/data-analyst');assert.equal(await milestone.isChecked(),false);assert.ok(await page.getByRole('button',{name:"Import this browser's progress",exact:true}).isVisible());
await milestone.check();await page.getByText('Progress saved to your account.',{exact:true}).waitFor();await visit('/careers/data-analyst');assert.ok(await milestone.isChecked());
failNext=true;await task.click();await page.getByText('Could not save this change. Please retry.',{exact:true}).waitFor();assert.equal(await task.isChecked(),false);
await page.getByRole('button',{name:"Import this browser's progress",exact:true}).click();await page.getByText('Browser progress added to your account.',{exact:true}).waitFor();assert.ok(await task.isChecked());assert.ok(await readiness.isChecked());assert.equal(await page.evaluate(()=>localStorage.getItem('career-progress-v1:data-analyst')),null);
account='qa-user-two';accountProgress={saved:false,stages:[],tasks:[],readiness:[]};await visit('/careers/data-analyst');assert.equal(await milestone.isChecked(),false);assert.equal(await task.isChecked(),false);await page.unroute('**/api/careers/data-analyst/progress');
console.log('PASS mocked account UI contract: persistence, explicit import, failure rollback and account isolation');
for(const width of [360,390,768,1024,1440]){
 await page.setViewportSize({width,height:900});await visit('/careers');assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Catalog overflow '+width);
 await visit('/careers/data-analyst');for(const id of ['roadmap','resources','projects','readiness','career-jobs']){await tab(id);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),id+' overflow '+width);}
 console.log('PASS all five panels at responsive width '+width);
}
await page.setViewportSize({width:390,height:844});await visit('/careers');await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:'/tmp/career-redesign-catalog-mobile.png'});
await visit('/careers/data-analyst');await tab('roadmap');await page.screenshot({path:'/tmp/career-redesign-roadmap-mobile.png'});await tab('resources');await page.screenshot({path:'/tmp/career-redesign-resources-mobile.png'});await tab('projects');await page.screenshot({path:'/tmp/career-redesign-projects-mobile.png'});
const sitemap=await context.request.get(base+'/sitemap.xml');assert.equal(sitemap.status(),200);const xml=await sitemap.text();for(const slug of slugs)assert.ok(xml.includes('https://cyprustech.careers/careers/'+slug));
assert.equal((await context.request.post(base+'/api/admin/careers',{headers:{Origin:base},data:{career:{}}})).status(),401);
assert.equal((await context.request.patch(base+'/api/careers/data-analyst/progress',{headers:{Origin:'https://example.com'},data:{kind:'stage'}})).status(),403);
assert.equal((await context.request.get(base+'/careers/does-not-exist')).status(),404);
for(const path of ['/','/jobs','/jobs/nicosia','/blog'])assert.equal((await context.request.get(base+path)).status(),200);
assert.equal(errors.length,0,errors.join('\n'));console.log('PASS sitemap, permissions, CSRF, 404, existing routes and zero browser exceptions');
await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
