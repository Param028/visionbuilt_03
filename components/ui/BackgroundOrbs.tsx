import React from 'react';

const BackgroundOrbs: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <div className="absolute top-[10%] left-[6%] h-[28rem] w-[28rem] rounded-full bg-white/10 blur-[120px]" />
      <div className="absolute top-[34%] right-[4%] h-[34rem] w-[34rem] rounded-full bg-[#1F327A]/20 blur-[140px]" />
      <div className="absolute bottom-[8%] left-[24%] h-[24rem] w-[24rem] rounded-full bg-white/8 blur-[110px]" />
    </div>
  );
};

export default BackgroundOrbs;
