import React from 'react';

/**
 * BackgroundOrbs renders subtle, frosted, colored orbs that float in the background.
 * They use Tailwind utility classes for size, position, color, opacity and blur.
 * The component is positioned absolutely and placed behind the main content via `z-0`.
 */
const BackgroundOrbs: React.FC = () => {
  return (
    <>
      {/* Orb 1 – soft cyan */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#7c8fa1]/10 rounded-full blur-[120px] pointer-events-none" />
      {/* Orb 2 – gentle violet */}
      <div className="absolute top-1/2 right-1/3 w-[28rem] h-[28rem] bg-[#7c8fa1]/15 rounded-full blur-[150px] pointer-events-none" />
      {/* Orb 3 – muted amber */}
      <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-[#7c8fa1]/8 rounded-full blur-[100px] pointer-events-none" />
    </>
  );
};

export default BackgroundOrbs;
