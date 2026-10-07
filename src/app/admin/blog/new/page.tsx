import { AdminBlogForm } from "../../_components/AdminBlogForm";
import { PageHeading } from "../../_components/AdminUI";
export default function AdminBlogNewPage() {
  return <div><PageHeading eyebrow="Editorial hub" title="New article" description="Create useful content for the Cyprus tech community. Save a draft or publish when ready." /><AdminBlogForm /></div>;
}
