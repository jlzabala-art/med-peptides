import ShieldCheck from "lucide-react/dist/esm/icons/shield-check";
import Microscope from "lucide-react/dist/esm/icons/microscope";
import FileCheck from "lucide-react/dist/esm/icons/file-check";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import React from 'react';





const SafetyCheck = () => {
  const protocols = [
    {
      icon: <ShieldCheck className="text-primary" />,
      title: "HPLC/Mass-Spec Verified",
      desc: "Every batch is tested via High-Performance Liquid Chromatography to ensure purity levels exceed 99%."
    },
    {
      icon: <Microscope className="text-primary" />,
      title: "Sterility Protocols",
      desc: "Synthesized in ISO-certified environments with strict adherence to aseptic techniques."
    },
    {
      icon: <FileCheck className="text-primary" />,
      title: "Full COA Documentation",
      desc: "Certificates of Analysis available for every molecule, transparently documenting the synthesis profile."
    },
    {
      icon: <AlertCircle className="text-primary" />,
      title: "Legal Transparency",
      desc: "Clear labeling and documentation ensuring compliance with laboratory research regulations."
    }
  ];

  return (
    <section className="safety-check section-padding">
      <div className="container">
        <div className="glass-card p-xl border-primary-light">
          <div className="text-center mb-xl">
            <h2 className="h2 mb-m">Research <span className="text-gradient">Integrity</span></h2>
            <p className="p-m text-secondary">Our commitment to scientific precision and laboratory safety.</p>
          </div>

          <div className="grid grid-2 gap-l">
            {protocols.map((item, index) => (
              <div key={index} className="flex gap-m items-start p-m hover-glow border-radius-s transition-all">
                <div className="p-s bg-primary-soft border-radius-s">
                  {item.icon}
                </div>
                <div>
                  <h4 className="h4 mb-s">{item.title}</h4>
                  <p className="p-s text-secondary">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-xl p-m bg-darker border border-radius-s border-dashed border-secondary text-center">
            <p className="p-s text-secondary">
              <span className="text-primary font-bold">Researcher Notice:</span> By accessing this catalog, you acknowledge that these molecules are designated for in-vitro laboratory research only.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SafetyCheck;