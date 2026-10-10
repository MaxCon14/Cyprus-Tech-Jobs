/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS harness installs a TypeScript loader for isolated server-module tests. */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");
const Module = require("node:module");
const ts = require("typescript");
const root = path.resolve(__dirname, "..");
require.extensions[".ts"] = function (mod, filename) {
  const source = fs.readFileSync(filename, "utf8");
  const out = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true,
  } });
  mod._compile(out.outputText, filename);
};
let captured;
let authenticated = false;
let created = 0;
let sent = 0;
const prisma = {
  job: {
    findMany: async options => { captured = options; return []; },
    count: async options => { captured = options; return 0; },
  },
  category: { findUnique: async () => ({ id: "category" }) },
  company: { findUnique: async () => ({ id: "company" }) },
  jobAlert: {
    findFirst: async () => null,
    create: async ({data}) => { created++; return { ...data, id: "alert", token: "test-token-123456789", createdAt: new Date() }; },
    deleteMany: async () => { throw new Error("Unauthenticated delete reached database"); },
  },
  $queryRaw: async () => [],
  $transaction: async fn => fn(prisma),
};
const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === "./prisma" || request === "@/lib/prisma") return { prisma };
  if (request === "next/cache") return { unstable_cache: fn => fn };
  if (request === "@/lib/supabase/server") return { createSupabaseServerClient: async () => ({ auth: { getUser: async () => ({data:{user:authenticated ? {email:"candidate@example.test"} : null}}) } }) };
  if (request === "@/lib/rate-limit") return {allowRequest:async()=>true,clientIp:()=> "test",tooManyRequests:()=>{}};
  if (request === "@/lib/resend") return {getResend:()=>({emails:{send:async()=>{sent++;return {data:{id:"test"},error:null}}}}),FROM_EMAIL:"test@example.test",FROM_NAME:"Test"};
  if (request.startsWith("@/")) request = path.join(root, "src", request.slice(2));
  return originalLoad.call(this, request, parent, isMain);
};
const { activeJobWhere, isActiveJob, isPublicJob } = require("../src/lib/job-visibility.ts");
const { buildJobPostingSchema, jsonLd } = require("../src/lib/schema.ts");
const { getJobs, getJobCount } = require("../src/lib/queries.ts");
const now = new Date("2026-10-10T12:00:00Z");
test("expiry boundary, null expiry and non-public drafts", () => {
  assert.equal(isActiveJob({status:"ACTIVE",expiresAt:null},now),true);
  assert.equal(isActiveJob({status:"ACTIVE",expiresAt:now},now),false);
  assert.equal(isActiveJob({status:"ACTIVE",expiresAt:new Date(now.getTime()+1)},now),true);
  assert.equal(isActiveJob({status:"PAUSED",expiresAt:null},now),false);
  assert.equal(isPublicJob({status:"DRAFT"}),false);
  assert.equal(isPublicJob({status:"EXPIRED"}),true);
});
test("keyword OR and expiry OR stay independent in listing and count queries", async () => {
  await getJobs({search:"eToro",city:"Limassol",categorySlug:"backend",remoteType:"HYBRID"});
  const listing = captured.where;
  await getJobCount({search:"eToro",city:"Limassol",categorySlug:"backend",remoteType:"HYBRID"});
  const count = captured.where;
  for (const where of [listing,count]) {
    assert.equal(where.status,"ACTIVE");
    assert.equal(where.OR.length,4);
    assert.equal(where.OR[3].curatedCompanyName.contains,"eToro");
    assert.equal(where.AND[0].OR[0].expiresAt,null);
    assert.ok(where.AND[0].OR[1].expiresAt.gt instanceof Date);
    assert.equal(where.city.contains,"Limassol");
    assert.equal(where.category.OR[1].parent.slug,"backend");
  }
  delete listing.AND; delete count.AND;
  assert.deepEqual(listing,count);
});
const job = {id:"1",slug:"example-role",title:"Engineer",description:"Work on software",city:"Limassol",remoteType:"HYBRID",employmentType:"FULL_TIME",salaryDisclosed:false,salaryMin:45000,salaryMax:60000,salaryCurrency:"EUR",postedAt:now,createdAt:now,expiresAt:null,company:null,curatedCompanyName:"Example employer",applyUrl:"https://jobs.ats.example/role"};
test("undisclosed salary and ATS identity never leak into schema",()=>{
  const schema=buildJobPostingSchema(job);
  assert.equal(schema.baseSalary,undefined);
  assert.equal(schema.hiringOrganization.sameAs,undefined);
  assert.equal(schema.jobLocationType,undefined);
  assert.equal(schema.datePosted,now.toISOString());
  assert.equal(buildJobPostingSchema({...job,salaryDisclosed:true}).baseSalary.value.minValue,45000);
});
test("JSON-LD cannot terminate its script element",()=>{
  const data={title:"</script><script>alert(1)</script>"};
  assert.ok(!jsonLd(data).includes("<"));
  assert.deepEqual(JSON.parse(jsonLd(data)),data);
});
test("unauthenticated alert lookup and removal are denied",async()=>{
  const route=require("../src/app/api/candidates/alert/route.ts");
  for(const method of ["GET","DELETE"]) {
    const response=await route[method](new Request("https://example.test/api/candidates/alert?email=candidate@example.test",{method}));
    assert.equal(response.status,401);
  }
});
test("guest subscriptions require consent, persist unconfirmed, and request confirmation",async()=>{
  const route=require("../src/app/api/candidates/alert/route.ts");
  const data={email:"candidate@example.test",alertFrequency:"WEEKLY",city:"Limassol",remoteType:"HYBRID"};
  let response=await route.POST(new Request("https://example.test/api/candidates/alert",{method:"POST",body:JSON.stringify(data)}));
  assert.equal(response.status,422);assert.equal(created,0);assert.equal(sent,0);
  response=await route.POST(new Request("https://example.test/api/candidates/alert",{method:"POST",body:JSON.stringify({...data,consent:true})}));
  assert.equal(response.status,201);assert.equal(created,1);assert.equal(sent,1);
  assert.equal((await response.json()).requiresConfirmation,true);
});
