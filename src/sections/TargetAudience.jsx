import Microscope from "lucide-react/dist/esm/icons/microscope";
import Activity from "lucide-react/dist/esm/icons/activity";
import Brain from "lucide-react/dist/esm/icons/brain";
import UserCheck from "lucide-react/dist/esm/icons/user-check";
import Timer from "lucide-react/dist/esm/icons/timer";
import React from 'react';





import homeData from '../data/homeData.js';
import { renderTitle } from '../utils/textFormatter';

const iconMap = {
  Microscope: <Microscope className="text-primary" />,
  Activity: <Activity className="text-primary" />,
  Brain: <Brain className="text-primary" />,
  UserCheck: <UserCheck className="text-primary" />,
  Timer: <Timer className="text-primary" />
};

const TargetAudience = () => {
  const { title, subtitle, audiences } = homeData.targetAudience;

  return (
    <section className="target-audience section-padding bg-darker" id="audience">
      <div className="container">
        <div className="text-center mb-xl">
          <h2 className="h2 mb-m">{renderTitle(title)}</h2>
          <p className="p-m text-secondary max-w-600 mx-auto">
            {subtitle}
          </p>
        </div>

        <div className="audience-grid">
          {audiences.map((aud, index) => (
            <div key={index} className="audience-card glass-card p-xl border-glow">
              <div className="icon-box mb-m">
                {iconMap[aud.icon]}
              </div>
              <h3 className="h3 mb-s">{aud.title}</h3>
              <p className="p-m text-secondary">{aud.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TargetAudience;