import{n as e}from"./chunk-B3K2TuZy.js";import{r as t,t as n}from"./jsx-runtime-8H19IF9o.js";import{t as r}from"./activity-C-254Vq4.js";import{n as i,t as a}from"./chevron-up-Cp1npkjM.js";import{t as o}from"./circle-check-BVVeWXEw.js";import{t as s}from"./clock-Bp-uTskK.js";import{t as c}from"./info-CjDYxSoa.js";import{t as l}from"./shield-check-BYbTk66B.js";import{t as u}from"./zap-QNwDr2aY.js";var d=e(t(),1),f=n();function p({variants:e,currentSelection:t,onSelectVariant:n}){let[p,m]=(0,d.useState)({});if(!e||!e.standard)return null;let h=[{id:`standard`,label:`Standard Clinical`,icon:(0,f.jsx)(r,{size:24}),guidance:`Recommended for standard tolerance.`,tags:[`Balanced Safety`,`Standard Ramp`,`Routine Monitoring`],rationale:{intro:`This tempo follows a gradual escalation schedule designed to balance tolerability and therapeutic response.`,interval:`Every 4 weeks.`,bestFor:[`First-time therapy`,`Standard tolerance`,`Moderate metabolic targets`]},data:e.standard,color:`var(--primary)`,bg:`#f0f9ff`},{id:`aggressive`,label:`Aggressive Escalation`,icon:(0,f.jsx)(u,{size:24}),guidance:`Recommended for high-response targets.`,tags:[`Rapid Peak`,`Fast Escalation`,`Close Monitoring`],rationale:{intro:`Accelerated titration designed to reach steady-state therapeutic levels rapidly, requiring closer clinical observation.`,interval:`Every 2 weeks.`,bestFor:[`Experienced patients`,`Time-sensitive goals`,`High therapeutic demand`]},data:e.aggressive,color:`#991b1b`,bg:`#fef2f2`},{id:`conservative`,label:`Conservative Titration`,icon:(0,f.jsx)(l,{size:24}),guidance:`Recommended for sensitive patients.`,tags:[`Safety First`,`Micro-dosing`,`Minimal Side-effects`],rationale:{intro:`Extended micro-dosing and delayed escalation to ensure maximum tolerability and minimize physiological stress.`,interval:`Every 6-8 weeks.`,bestFor:[`Sensitive profiles`,`Complex co-morbidities`,`Long-term maintenance`]},data:e.conservative,color:`#115e59`,bg:`#f0fdfa`}],g=(e,t)=>{e.stopPropagation(),m(e=>({...e,[t]:!e[t]}))};return(0,f.jsxs)(`div`,{className:`protocol-compare-container`,style:{padding:`2.5rem`,backgroundColor:`white`,borderRadius:`32px`,border:`1px solid var(--border)`,marginBottom:`0`,boxShadow:`0 20px 50px rgba(0,0,0,0.04)`},children:[(0,f.jsx)(`style`,{children:`
        .model-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }

        @media (max-width: 1023px) {
          .model-grid {
            display: flex;
            flex-direction: column;
            padding: 1rem 0;
            margin: 0;
            gap: 1.25rem;
          }
          .model-card {
            width: 100%;
          }
        }

        .model-card {
          border: 2px solid transparent;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .model-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.08);
          border-color: #E2E8F0;
        }

        .model-card.selected {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.08);
        }

        .rationale-toggle {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #64748B;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          transition: color 0.2s ease;
          user-select: none;
          padding: 0.5rem 0;
        }
        
        .rationale-toggle:hover {
          color: var(--primary);
        }

        .clinical-badge {
          display: inline-flex;
          align-items: center;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 0.65rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          background-color: #F1F5F9;
          color: #475569;
          margin-right: 0.4rem;
          margin-bottom: 0.4rem;
        }
      `}),(0,f.jsxs)(`div`,{style:{marginBottom:`3rem`,textAlign:`center`},children:[(0,f.jsx)(`h3`,{style:{fontSize:`1.75rem`,fontWeight:900,marginBottom:`0.75rem`,color:`var(--primary)`,letterSpacing:`-0.02em`},children:`Algorithm Selection`}),(0,f.jsx)(`p`,{style:{fontSize:`1.1rem`,color:`var(--text-muted)`,fontWeight:500,maxWidth:`700px`,margin:`0 auto`},children:`Select the titration strategy that best fits the clinical research objectives and patient tolerance profile.`})]}),(0,f.jsx)(`div`,{className:`model-grid`,children:h.filter(e=>e.data?.blueprint?.phases).map(e=>{let r=t===e.id,l=!!p[e.id],u=e.data.blueprint.phases.reduce((e,t)=>e+(t.end_week-t.start_week+1),0);return(0,f.jsxs)(`div`,{className:`model-card ${r?`selected`:``}`,onClick:()=>n(e.id),style:{padding:`2rem`,borderRadius:`24px`,border:r?`2.5px solid ${e.color}`:`2px solid #F1F5F9`,backgroundColor:r?e.bg:`#ffffff`,cursor:`pointer`,position:`relative`,display:`flex`,flexDirection:`column`,gap:`1.5rem`},children:[(0,f.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,alignItems:`flex-start`},children:[(0,f.jsx)(`div`,{style:{width:`56px`,height:`56px`,borderRadius:`16px`,backgroundColor:r?`white`:`#F1F5F9`,display:`flex`,alignItems:`center`,justifyContent:`center`,color:r?e.color:`#64748B`,boxShadow:r?`0 4px 12px rgba(0,0,0,0.05)`:`none`},children:e.icon}),r?(0,f.jsx)(`div`,{style:{backgroundColor:e.color,borderRadius:`50%`,padding:`6px`,display:`flex`,boxShadow:`0 0 0 4px ${e.color}20`},children:(0,f.jsx)(o,{size:18,color:`white`})}):(0,f.jsx)(`div`,{style:{width:`24px`,height:`24px`,border:`2px solid #E2E8F0`,borderRadius:`50%`}})]}),(0,f.jsxs)(`div`,{children:[(0,f.jsx)(`h4`,{style:{fontWeight:900,color:`var(--primary)`,fontSize:`1.25rem`,marginBottom:`0.5rem`,letterSpacing:`-0.01em`},children:e.label}),(0,f.jsxs)(`div`,{style:{display:`inline-flex`,alignItems:`center`,gap:`0.5rem`,fontSize:`0.75rem`,fontWeight:800,color:e.color,backgroundColor:`${e.color}15`,padding:`4px 12px`,borderRadius:`100px`,textTransform:`uppercase`},children:[(0,f.jsx)(s,{size:12}),` `,u,` Weeks`]}),(0,f.jsx)(`p`,{style:{fontSize:`0.65rem`,color:`var(--text-muted)`,margin:`0.5rem 0 0 0`,fontWeight:600,opacity:.8},children:`Final logistics and tax calculations are applied at checkout.`})]}),(0,f.jsxs)(`div`,{style:{flexGrow:1},children:[(0,f.jsx)(`p`,{style:{fontSize:`0.9rem`,color:`var(--text-main)`,fontWeight:700,marginBottom:`1rem`,lineHeight:1.5},children:e.guidance}),(0,f.jsx)(`div`,{style:{marginBottom:`1rem`},children:e.tags.map(e=>(0,f.jsx)(`span`,{className:`clinical-badge`,children:e},e))}),(0,f.jsxs)(`div`,{className:`rationale-toggle`,onClick:t=>g(t,e.id),children:[(0,f.jsx)(c,{size:16}),`Clinical rationale`,l?(0,f.jsx)(a,{size:16}):(0,f.jsx)(i,{size:16})]}),l&&(0,f.jsxs)(`div`,{style:{marginTop:`0.75rem`,padding:`1.25rem`,backgroundColor:`rgba(255, 255, 255, 0.6)`,borderRadius:`12px`,border:`1px solid rgba(0,0,0,0.05)`,fontSize:`0.8rem`,color:`var(--text-main)`,lineHeight:1.6,animation:`fadeInSlideDown 0.3s ease-out`,cursor:`default`},onClick:e=>e.stopPropagation(),children:[(0,f.jsx)(`p`,{style:{margin:`0 0 0.75rem 0`,fontWeight:500},children:e.rationale.intro}),(0,f.jsxs)(`p`,{style:{margin:`0 0 0.75rem 0`,fontWeight:700},children:[(0,f.jsx)(`span`,{style:{color:`var(--text-muted)`},children:`Escalation interval:`}),` `,e.rationale.interval]}),(0,f.jsx)(`div`,{style:{fontWeight:700,marginBottom:`0.25rem`},children:`Best suited for:`}),(0,f.jsx)(`ul`,{style:{margin:0,paddingLeft:`1.25rem`,fontWeight:500},children:e.rationale.bestFor.map(e=>(0,f.jsx)(`li`,{style:{marginBottom:`0.25rem`},children:e},e))})]})]})]},e.id)})})]})}export{p as default};