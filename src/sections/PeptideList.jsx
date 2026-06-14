import ExternalLink from "lucide-react/dist/esm/icons/external-link";
import Tag from "lucide-react/dist/esm/icons/tag";
import React from 'react';



const PeptideList = () => {
  const peptides = [
    {
      name: "BPC-157",
      category: "Tissue Repair",
      desc: "Pentadecapeptide composed of 15 amino acids. Extensively studied for its osteo-tendinous and gastric protective properties.",
      tags: ["Ligament", "Gastric", "Anti-inflammatory"],
      potency: "99.8%"
    },
    {
      name: "TB-500 (Thymosin Beta-4)",
      category: "Regeneration",
      desc: "Synthetic version of the naturally occurring protein. Research focuses on cell migration and angiogenesis (new blood vessel formation).",
      tags: ["Angiogenesis", "Cell Migration", "Soft Tissue"],
      potency: "99.9%"
    },
    {
      name: "GHK-Cu",
      category: "Skin & DNA",
      desc: "Copper tripeptide-1. Known for its role in collagen synthesis and potential epigenetic signaling in aging skin cells.",
      tags: ["Collagen", "Anti-aging", "DNA Repair"],
      potency: "99.5%"
    },
    {
      name: "CJC-1295 + Ipamorelin",
      category: "Growth Factors",
      desc: "A combination growth hormone secretagogue. Designed to study pulsatile release mechanisms of endogenous GH.",
      tags: ["Endocrine", "Recovery", "Sleep Research"],
      potency: "99.7%"
    }
  ];

  return (
    <section className="peptide-list section-padding bg-darker">
      <div className="container">
        <div className="flex justify-between items-end mb-xl">
          <div>
            <h2 className="h2 mb-m">Research <span className="text-gradient">Molecules</span></h2>
            <p className="p-m text-secondary max-w-600">
              High-purity laboratory reagents with 3rd party verified chromatography.
            </p>
          </div>
          <button className="btn btn-secondary flex items-center gap-s">
            View All Molecules <ExternalLink size={18} />
          </button>
        </div>

        <div className="grid grid-2 gap-l">
          {peptides.map((pep, index) => (
            <div key={index} className="peptide-card glass-card p-l hover-glow">
              <div className="flex justify-between items-start mb-m">
                <div>
                  <span className="p-xs text-primary bg-primary-soft px-s py-xs border-radius-xs mb-s inline-block uppercase tracking-wider font-bold">
                    {pep.category}
                  </span>
                  <h3 className="h3 mt-s">{pep.name}</h3>
                </div>
                <div className="text-right">
                  <span className="p-xs text-secondary block">PURITY</span>
                  <span className="text-gradient font-bold">{pep.potency}</span>
                </div>
              </div>
              <p className="p-m text-secondary mb-l line-height-m">
                {pep.desc}
              </p>

              <div className="flex gap-s flex-wrap mb-l">
                {pep.tags.map((tag, i) => (
                  <span key={i} className="flex items-center gap-xs p-xs px-s bg-dark border-radius-full text-secondary border p-s-hover">
                    <Tag size={12} className="text-primary" />
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex gap-m">
                <button className="btn btn-primary flex-1">Laboratory Data</button>
                <button className="btn btn-secondary flex-1">Purchase Research</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PeptideList;