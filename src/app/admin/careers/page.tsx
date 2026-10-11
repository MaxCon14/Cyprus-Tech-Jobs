import Link from "next/link";
import {redirect} from "next/navigation";
import {getAdminUser} from "@/lib/admin-auth";
import {readCareers} from "@/lib/careers/queries";
import {PageHeading} from "../_components/AdminUI";
export const dynamic="force-dynamic";
export default async function AdminCareers(){
 if(!await getAdminUser())redirect("/admin/login");
 const careers=await readCareers(true);
 return <><PageHeading eyebrow="Insights & content" title="Career Library" description="Manage published paths, learning resources and practical project briefs." actions={<Link className="adm-btn adm-btn-primary" href="/admin/careers/new">Create career</Link>}/><div className="adm-panel"><div className="adm-table-wrap"><table className="adm-table"><thead><tr><th>Career</th><th>Category</th><th>Content</th><th>Status</th><th>Action</th></tr></thead><tbody>{careers.map(c=><tr key={c.slug}><td><strong>{c.title}</strong></td><td>{c.category}</td><td>{c.stageCount} stages · {c.resourceCount} resources</td><td>{c.published?"Published":"Draft"}</td><td><Link href={"/admin/careers/"+c.slug}>Edit career →</Link></td></tr>)}</tbody></table></div></div></>;
}
