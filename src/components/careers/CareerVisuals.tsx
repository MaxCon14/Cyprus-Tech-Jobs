import Image from "next/image";
import { ChartNoAxesCombined, Code2, PenTool, ShieldCheck, Braces, BrainCircuit, Compass } from "lucide-react";

export function careerTone(category:string){
 return category==="Data & Analytics"?"data":category==="Software Development"?"software":category==="Design & Product"?"design":category==="Cybersecurity"?"security":"design";
}
const roleIcons:Record<string,typeof Code2>={"data-analyst":ChartNoAxesCombined,"frontend-developer":Code2,"ux-ui-designer":PenTool,"cybersecurity-analyst":ShieldCheck,"data-scientist":BrainCircuit,"backend-developer":Braces};
export function RoleMark({slug,large=false}:{slug:string;large?:boolean}){
 const Icon=roleIcons[slug]??Compass;
 return <span className={"cl-role-mark "+(large?"is-large":"")} aria-hidden="true"><Icon size={large?52:30} strokeWidth={1.5}/></span>;
}
const providerLogos:Record<string,string>={
 Google:"google",Microsoft:"microsoft","Microsoft Learn":"microsoft",PostgreSQL:"postgresql","Python Software Foundation":"python",pandas:"pandas",Kaggle:"kaggle",DataCamp:"datacamp","Coursera / Google":"coursera","GitHub Skills":"github","GitHub Docs":"github","MDN Web Docs":"mdn","The Odin Project":"odin",Git:"git",React:"react",TypeScript:"typescript","web.dev":"google",Vercel:"vercel","Frontend Mentor":"frontendmentor","Material Design":"material",Figma:"figma",Cisco:"cisco",Ubuntu:"ubuntu",Wireshark:"wireshark",TryHackMe:"tryhackme",OWASP:"owasp",PortSwigger:"portswigger",NumPy:"numpy","Scikit-learn":"scikitlearn",Streamlit:"streamlit","Node.js":"node",Express:"express",Redis:"redis",Docker:"docker",OpenTelemetry:"opentelemetry","OpenAPI Initiative":"openapi"
};
const toolLogos:Record<string,string>={Excel:"excel","Google Sheets":"googlesheets",SQL:"postgresql","Power BI":"powerbi",Python:"python",Pandas:"pandas",pandas:"pandas",Jupyter:"python",HTML:"html",CSS:"css",JavaScript:"javascript",TypeScript:"typescript",React:"react",Git:"git",GitHub:"github",Figma:"figma",FigJam:"figma",Linux:"ubuntu",Ubuntu:"ubuntu",Wireshark:"wireshark",OWASP:"owasp",NumPy:"numpy","Scikit-learn":"scikitlearn",PostgreSQL:"postgresql","Node.js":"node",Express:"express",Redis:"redis",Docker:"docker",Streamlit:"streamlit"};
export function ProviderMark({provider}:{provider:string}){
 const logo=providerLogos[provider];
 return <span className="cl-provider-mark" aria-hidden="true">{logo?<Image src={"/careers/logos/"+logo+".svg"} width={28} height={28} alt=""/>:<span>{provider.split(/\s+/).map(s=>s[0]).slice(0,2).join("")}</span>}</span>;
}
export function ToolStack({skills,limit=4}:{skills:string[];limit?:number}){
 return <div className="cl-tool-stack">{skills.slice(0,limit).map(skill=><span className="cl-tool" key={skill}>{toolLogos[skill]&&<Image src={"/careers/logos/"+toolLogos[skill]+".svg"} width={18} height={18} alt=""/>}<span>{skill}</span></span>)}{skills.length>limit&&<span className="cl-tool cl-tool-more">+{skills.length-limit}</span>}</div>;
}
