import Plus from "lucide-react/dist/esm/icons/plus";
import Minus from "lucide-react/dist/esm/icons/minus";
import React, { useState } from 'react';


import homeData from '../data/homeData.js';
import { renderTitle } from '../utils/textFormatter';

const QuickFAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const { title, subtitle, faqs } = homeData.quickFAQ;

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="quick-faq section-padding bg-dark" id="faq">
      <div className="container max-w-800">
        <div className="text-center mb-xl">
          <h2 className="h2 mb-m">{renderTitle(title)}</h2>
          <p className="p-m text-secondary">
            {subtitle}
          </p>
        </div>

        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div key={index} className="faq-item mb-m">
              <button 
                className={`faq-question w-full flex items-center justify-between p-l glass-card ${openIndex === index ? 'active' : ''}`}
                onClick={() => toggleFAQ(index)}
              >
                <span className="p-l font-bold text-left">{faq.question}</span>
                {openIndex === index ? <Minus size={20} /> : <Plus size={20} />}
              </button>
              {openIndex === index && (
                <div className="faq-answer p-l bg-dark-soft border-radius-m mt-s animate-fade-in">
                  <p className="p-m text-secondary">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QuickFAQ;